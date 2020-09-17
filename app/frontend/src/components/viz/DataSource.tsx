import * as React from "react";
import styles from "./DataSource.module.scss";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import { useStores } from "../../hooks/useStores";
import { DataSourceType } from "../../stores/VisualizationStore";
import { useObserver } from "mobx-react-lite";
import { ChangeEvent, useRef } from "react";
import { decodeAnyEvent } from "../../models/decodeAnyEvent";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import { Buffer } from "../../types/common";
import { EventTypeId } from "../../registry/events";
import { FileInput } from "./FileInput";

class UploadBuffer {
  public bufferStart: Date | null = null;
  public bufferEnd: Date | null = null;
  public data: Buffer = {};

  public add(event: BusAnyEvent): void {
    if (!event || !event.data || !event.stamp) return;
    this.bufferStart = this.bufferStart || event.stamp;
    this.bufferEnd = event.stamp;
    const typeUrl = event.data.typeUrl as EventTypeId;
    if (!this.data[typeUrl]) this.data[typeUrl] = {};
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!this.data[typeUrl]![event.name]) this.data[typeUrl]![event.name] = [];
    const decodedEvent = decodeAnyEvent(event);
    if (!decodedEvent) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.data[typeUrl]![event.name].push([event.stamp.getTime(), decodedEvent]);
  }
}

export const DataSource: React.FC = () => {
  const { visualizationStore: store } = useStores();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logDirectoryRef = useRef<HTMLInputElement | null>(null);

  const setDataSource = (d: DataSourceType): void => {
    store.dataSource = d;
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.currentTarget.checked &&
      setDataSource(e.currentTarget.value as DataSourceType);
  };

  return useObserver(() => {
    const handleOnLogDirectorySelect = async (
      e: ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
      store.setResourceArchive(e.target.files);
    };

    const handleOnLogSelect = async (
      e: ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
      const file = e.target.files?.[0];
      if (file) {
        const eventBuffer = new UploadBuffer();
        const fileBuffer = await file.arrayBuffer();
        let offset = 0;
        while (offset < fileBuffer.byteLength) {
          const header = fileBuffer.slice(offset, offset + 2);
          const length = new Uint16Array(header)[0];
          offset += 2;
          const record = fileBuffer.slice(offset, offset + length);
          offset += length;
          eventBuffer.add(BusAnyEvent.decode(new Uint8Array(record)));

          // Update progress bar at a reasonable frequency
          const newProgress = Math.round((offset / file.size) * 10) / 10;
          if (newProgress != store.bufferLoadProgress) {
            store.bufferLoadProgress = newProgress;
            // Yield main thread for UI updates
            await new Promise((r) => setTimeout(r, 0));
          }
        }
        store.buffer = eventBuffer.data;
        store.bufferSize = file.size / 1e6;
        store.bufferStart = eventBuffer.bufferStart;
        store.bufferEnd = eventBuffer.bufferEnd;
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
        <label>
          Log Directory
          <FileInput
            type="file"
            id="file"
            ref={logDirectoryRef}
            webkitdirectory={"true"}
            onChange={handleOnLogDirectorySelect}
          />
        </label>
        <span>{store.bufferLoadProgress}</span>
      </div>
    );
  });
};
