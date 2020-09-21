import * as React from "react";
import { ChangeEvent, useRef, useState } from "react";
import { useStores } from "../../hooks/useStores";
import { ResourceArchive } from "../../models/ResourceArchive";
import { UploadBuffer } from "../../models/UploadBuffer";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import { Form } from "react-bootstrap";
import { useObserver } from "mobx-react-lite";
import styles from "./DataSource.module.scss";

export const DataSource: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadFilePath, setUploadFilePath] = useState<string | null>(null);
  const [logFilePath, setLogFilePath] = useState<string | null>(null);
  const [numResources, setNumResources] = useState<number>(0);

  const { visualizationStore: store } = useStores();

  const handleOnLogSelect = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFilePath(file.name);
      store.resourceArchive = new ResourceArchive(file);
      const eventBuffer = new UploadBuffer();
      const fileInfo = await store.resourceArchive.getFileInfo();
      const logFilePath = fileInfo.find((_) => _.endsWith(".log"));
      if (!logFilePath) {
        throw Error("No .log file in archive");
      }
      setLogFilePath(logFilePath);
      setNumResources(fileInfo.length - 1);
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
    const progress = store.bufferLoadProgress;
    return (
      <div className={styles.dataSource}>
        <Form>
          <Form.Switch label={"Live"} id={"log-live-switch"} />
          <Form.File id="logfile-load" custom>
            <Form.File.Input
              ref={fileInputRef}
              onChange={handleOnLogSelect}
              isValid={progress === 1}
            />
            <Form.File.Label data-browse="Load log">
              {uploadFilePath}
            </Form.File.Label>
            <Form.Control.Feedback>{`${logFilePath} + ${numResources} resources`}</Form.Control.Feedback>
          </Form.File>
        </Form>
      </div>
    );
  });
};
