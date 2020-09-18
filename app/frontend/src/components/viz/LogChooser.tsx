import * as React from "react";
import { ChangeEvent, useRef } from "react";
import { decodeAnyEvent } from "../../models/decodeAnyEvent";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import { Buffer } from "../../types/common";
import { EventTypeId } from "../../registry/events";
import styles from "./LogChooser.module.scss";
import { useObserver } from "mobx-react-lite";
import { useStores } from "../../hooks/useStores";
import { ResourceArchive } from "../../models/ResourceArchive";

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

export const LogChooser: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { visualizationStore: store } = useStores();

  const handleOnLogSelect = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      store.resourceArchive = new ResourceArchive(file);
      const eventBuffer = new UploadBuffer();
      const fileInfo = await store.resourceArchive.getFileInfo();
      const logFilePath = fileInfo.find((_) => _.endsWith(".log"));
      if (!logFilePath) {
        throw Error("No .log file in archive");
      }
      const blob = await store.resourceArchive.getBlob(logFilePath);
      const fileBuffer = await blob.arrayBuffer();
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

      // TODO: Encapsulate in single setter
      store.setBuffer(eventBuffer.data);
      store.bufferSize = file.size / 1e6;
      store.bufferStart = eventBuffer.bufferStart;
      store.bufferEnd = eventBuffer.bufferEnd;
      store.bufferLoadProgress = 1;
    }
  };
  return useObserver(() => {
    return (
      <div className={styles.logChooser}>
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
