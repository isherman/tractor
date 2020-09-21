import * as React from "react";
import { ChangeEvent, useRef } from "react";
import styles from "./LogChooser.module.scss";
import { useObserver } from "mobx-react-lite";
import { useStores } from "../../hooks/useStores";
import { ResourceArchive } from "../../models/ResourceArchive";
import { UploadBuffer } from "../../models/UploadBuffer";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
// import "bs-custom-file-input";
import { Form } from "react-bootstrap";

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
        <Form>
          <Form.File
            id="log-file-input"
            label="Upload"
            custom
            ref={fileInputRef}
            onChange={handleOnLogSelect}
          />
        </Form>
        <span>{store.bufferLoadProgress}</span>
      </div>
    );
  });
};
