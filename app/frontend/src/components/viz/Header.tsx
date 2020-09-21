import * as React from "react";
import styles from "./Header.module.scss";
import { Button, Col, Container, Form } from "react-bootstrap";
import { useObserver } from "mobx-react-lite";
import RangeSlider from "react-bootstrap-range-slider";
import { useStores } from "../../hooks/useStores";
import { ResourceArchive } from "../../models/ResourceArchive";
import { UploadBuffer } from "../../models/UploadBuffer";
import { formatValue } from "../../utils/formatValue";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import { Icon } from "../Icon";

export const Header: React.FC = () => {
  const { visualizationStore: store } = useStores();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [logFilePath, setLogFilePath] = React.useState<string | null>(null);

  const tooltipLabel = (v: number): string => {
    if (!store.bufferEnd || !store.bufferStart) {
      return "";
    }
    return formatValue(
      new Date(
        store.bufferStart.getTime() +
          (store.bufferEnd.getTime() - store.bufferStart.getTime()) * v
      )
    );
  };

  const handleOnLogClick = (_: React.MouseEvent<HTMLButtonElement>): void => {
    if (!fileInputRef.current) {
      return;
    }
    fileInputRef.current.click();
  };

  const handleOnToggleStreamClick = (
    _: React.MouseEvent<HTMLButtonElement>
  ): void => {
    store.bufferStreaming = !store.bufferStreaming;
  };

  const handleOnLogSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
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
      setLogFilePath(logFilePath);
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
                  onClick={handleOnLogClick}
                >
                  Load log
                </Button>
                <input
                  ref={fileInputRef}
                  onChange={handleOnLogSelect}
                  name="loadLog"
                  type="file"
                  hidden
                />
              </div>
              <div className={"text-muted"}>
                {progress === 1 && `${logFilePath}`}
              </div>
            </Col>
            <Col xs={8}>
              <RangeSlider
                step={0.01}
                max={1}
                value={store.bufferRangeStart}
                tooltip={store.bufferStart && store.bufferEnd ? "auto" : "off"}
                tooltipLabel={tooltipLabel}
                onChange={(e) =>
                  store.setBufferRangeStart(parseFloat(e.target.value))
                }
              />
              <RangeSlider
                step={0.01}
                max={1}
                value={store.bufferRangeEnd}
                tooltip={store.bufferStart && store.bufferEnd ? "auto" : "off"}
                tooltipLabel={tooltipLabel}
                onChange={(e) =>
                  store.setBufferRangeEnd(parseFloat(e.target.value))
                }
              />
              <div className={styles.bufferTimestamps}>
                <span className={"text-muted"}>
                  {formatValue(store.bufferStart || "")}
                </span>
                <span className={"text-muted"}>
                  {formatValue(store.bufferEnd || "")}
                </span>
              </div>
            </Col>
            <Col xs={1}>
              <Form.Group controlId="buffer.throttle">
                <Form.Label>Throttle</Form.Label>
                <Form.Control
                  as="select"
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
                  value={store.bufferSize}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    (store.bufferSize = parseInt(e.target.value))
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
