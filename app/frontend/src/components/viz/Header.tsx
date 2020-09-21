import * as React from "react";
import styles from "./Header.module.scss";
import { Button, Col, Container, Form } from "react-bootstrap";
import { useObserver } from "mobx-react-lite";
import RangeSlider from "react-bootstrap-range-slider";
import { useStores } from "../../hooks/useStores";
import { ResourceArchive } from "../../models/ResourceArchive";
import { StreamingBuffer } from "../../models/StreamingBuffer";
import { formatValue } from "../../utils/formatValue";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import { Icon } from "../Icon";

export const Header: React.FC = () => {
  const { visualizationStore: store } = useStores();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [logFilePath, setLogFilePath] = React.useState<string | null>(null);

  const handleOnLoadLogClick = (
    _: React.MouseEvent<HTMLButtonElement>
  ): void => {
    if (!fileInputRef.current) {
      return;
    }
    fileInputRef.current.click();
  };

  const handleOnToggleStreamClick = (
    _: React.MouseEvent<HTMLButtonElement>
  ): void => {
    store.toggleStreaming();
  };

  const handleOnLoadLog = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    store.bufferLogLoadProgress = 0;
    const eventTarget = e.target;
    const file = eventTarget.files?.[0];
    if (file) {
      // TODO: Pull this logic out of the view
      const resourceArchive = new ResourceArchive(file);
      const streamingBuffer = new StreamingBuffer();
      const fileInfo = await resourceArchive.getFileInfo();
      const logFilePath = fileInfo.find((_) => _.endsWith(".log"));
      if (!logFilePath) {
        throw Error("No .log file in archive");
      }
      setLogFilePath(logFilePath);
      const blob = await resourceArchive.getBlob(logFilePath);
      const fileBuffer = await blob.arrayBuffer();
      let offset = 0;
      while (offset < fileBuffer.byteLength) {
        const header = fileBuffer.slice(offset, offset + 2);
        const length = new Uint16Array(header)[0];
        offset += 2;
        const record = fileBuffer.slice(offset, offset + length);
        offset += length;
        streamingBuffer.add(BusAnyEvent.decode(new Uint8Array(record)));

        // Update progress at a reasonable frequency
        const newProgress = Math.round((offset / file.size) * 10) / 10;
        if (newProgress != store.bufferLogLoadProgress) {
          store.bufferLogLoadProgress = newProgress;
          // Yield main thread for UI updates
          await new Promise((r) => setTimeout(r, 0));
        }
      }
      store.setFromStreamingBuffer(streamingBuffer, resourceArchive);
      eventTarget.value = "";
    }
  };

  return useObserver(() => {
    return (
      <div className={styles.header}>
        <Container fluid>
          <Form.Row>
            <Col xs={2}>
              <div className={styles.dataSourceButtons}>
                <Button
                  onClick={handleOnToggleStreamClick}
                  className={[
                    styles.streamButton,
                    store.bufferStreaming && styles.active
                  ].join(" ")}
                >
                  <Icon id={store.bufferStreaming ? "stop" : "play"} />
                  {store.bufferStreaming ? "Stop" : "Stream"}
                </Button>

                <Button
                  disabled={store.bufferStreaming}
                  onClick={handleOnLoadLogClick}
                >
                  Load log
                </Button>
                <input
                  ref={fileInputRef}
                  onChange={handleOnLoadLog}
                  name="loadLog"
                  type="file"
                  hidden
                />
              </div>
              <div className={"text-muted"}>
                {store.bufferLogLoadProgress === 1 && `${logFilePath}`}
              </div>
            </Col>
            <Col xs={8}>
              <RangeSlider
                step={0.01}
                max={1}
                value={store.bufferRangeStart}
                disabled={store.bufferEmpty}
                tooltip={store.bufferStart && store.bufferEnd ? "auto" : "off"}
                tooltipLabel={() => formatValue(store.bufferRangeStartDate)}
                onChange={(e) =>
                  store.setBufferRangeStart(parseFloat(e.target.value))
                }
              />
              <RangeSlider
                step={0.01}
                max={1}
                value={store.bufferRangeEnd}
                disabled={store.bufferEmpty}
                tooltip={store.bufferStart && store.bufferEnd ? "auto" : "off"}
                tooltipLabel={() => formatValue(store.bufferRangeEndDate)}
                onChange={(e) =>
                  store.setBufferRangeEnd(parseFloat(e.target.value))
                }
              />
              <div className={styles.bufferTimestamps}>
                {store.bufferStart && (
                  <span className={"text-muted"}>
                    {formatValue(store.bufferStart)}
                  </span>
                )}
                {store.bufferEnd && (
                  <span className={"text-muted"}>
                    {formatValue(store.bufferEnd)}
                  </span>
                )}
              </div>
            </Col>
            <Col xs={1}>
              <Form.Group controlId="buffer.throttle">
                <Form.Label>Throttle</Form.Label>
                <Form.Control
                  as="select"
                  disabled={store.bufferEmpty}
                  value={store.bufferThrottle}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    (store.bufferThrottle = parseInt(e.target.value))
                  }
                >
                  <option value={0}>none</option>
                  <option value={1}>1 ms</option>
                  <option value={100}>100 ms</option>
                  <option value={500}>500 ms</option>
                  <option value={1000}>1 s</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs={1}>
              <Form.Group controlId="buffer.length">
                <Form.Label>Expiration</Form.Label>
                <Form.Control
                  as="select"
                  disabled={store.bufferEmpty || !store.bufferStreaming}
                  value={store.bufferExpirationWindow}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    (store.bufferExpirationWindow = parseInt(e.target.value))
                  }
                >
                  <option value={60 * 1000}>1 min</option>
                  <option value={5 * 60 * 1000}>5min</option>
                  <option value={30 * 60 * 1000}>30min</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Form.Row>
        </Container>
      </div>
    );
  });
};
