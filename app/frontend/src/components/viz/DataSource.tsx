import * as React from "react";
import styles from "./DataSource.module.scss";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import { useStores } from "../../hooks/useStores";
import { DataSourceType } from "../../stores/VisualizationStore";
import { useObserver } from "mobx-react-lite";
import { ChangeEvent, useRef } from "react";
import { decodeAnyEvent } from "../../models/decodeAnyEvent";
import { Event } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import { Buffer } from "../../stores/buffer";
import { EventTypeId } from "../../data/registry";

export const DataSource: React.FC = () => {
  const { visualizationStore: store } = useStores();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setDataSource = (d: DataSourceType): void => {
    store.dataSource = d;
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.currentTarget.checked &&
      setDataSource(e.currentTarget.value as DataSourceType);
  };

  return useObserver(() => {
    const handleOnLogSelect = async (
      e: ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
      const file = e.target.files?.[0];
      if (file) {
        const buffer: Buffer = {};
        let bufferStart: Date | null = null;
        let bufferEnd: Date | null = null;

        const fileBuffer = await file.arrayBuffer();
        let start = 0;
        let end = 0;
        while (end < fileBuffer.byteLength) {
          start = end;
          end = start + 2;
          const recordLength = new Uint16Array(fileBuffer.slice(start, end))[0];
          start = end;
          end = start + recordLength;
          const record = fileBuffer.slice(start, end);
          const anyEvent = Event.decode(new Uint8Array(record));
          if (!anyEvent || !anyEvent.data || !anyEvent.stamp) continue;
          bufferStart = bufferStart || anyEvent.stamp;
          bufferEnd = anyEvent.stamp;
          const typeUrl = anyEvent.data.typeUrl as EventTypeId;
          const typeEntry = buffer[typeUrl];
          if (!typeEntry) {
            buffer[typeUrl] = [
              {
                name: anyEvent.name,
                values: []
              }
            ];
          }
          const stream = buffer[typeUrl]?.find(
            (_) => _.name === anyEvent.name
          ) || {
            name: anyEvent.name,
            values: []
          };
          const event = decodeAnyEvent(anyEvent);
          if (!event) continue;
          stream.values.push([anyEvent.stamp.getTime(), event]);
          const newProgress = Math.round((end / file.size) * 10) / 10;
          if (newProgress != store.bufferLoadProgress) {
            store.bufferLoadProgress = newProgress;
            await new Promise((r) => setTimeout(r, 0));
          }
        }
        store.buffer = buffer;
        store.bufferSize = file.size / 1e6;
        store.bufferStart = bufferStart;
        store.bufferEnd = bufferEnd;
        store.bufferLoadProgress = 1;
      }
    };

    return (
      <div className={styles.dataSource}>
        <ButtonGroup toggle>
          <ToggleButton
            type="radio"
            name="dataSource"
            checked={store.dataSource === "live"}
            value={"live"}
            onChange={handleOnChange}
          >
            Live
          </ToggleButton>
          <ToggleButton
            type="radio"
            name="dataSource"
            checked={store.dataSource === "pause"}
            value={"pause"}
            onChange={handleOnChange}
          >
            Pause
          </ToggleButton>
        </ButtonGroup>
        <label>
          Log
          <input
            type="file"
            id="file"
            ref={fileInputRef}
            onChange={handleOnLogSelect}
          />
        </label>
        <span>{store.bufferLoadProgress}</span>
      </div>
    );
  });
};
