import * as React from "react";
import styles from "./Buffer.module.scss";
import { Col, Form } from "react-bootstrap";
import { useStores } from "../../hooks/useStores";
import { useObserver } from "mobx-react-lite";
import { formatValue } from "../../utils/formatValue";
import RangeSlider from "react-bootstrap-range-slider";
import { ChangeEvent } from "react";

export const Buffer: React.FC = () => {
  const { visualizationStore: store } = useStores();

  return useObserver(() => (
    <div className={styles.buffer}>
      <Form.Group controlId="buffer.start">
        <Form.Label>Buffer Start</Form.Label>
        <Form.Control
          plaintext
          readOnly
          defaultValue={formatValue(store.bufferStart)}
        />
      </Form.Group>

      <div className={styles.rangeSliders}>
        <Form.Group controlId="buffer.rangeStart">
          <Form.Label>Range Start</Form.Label>
          <Col>
            <RangeSlider
              step={0.01}
              max={1}
              value={store.bufferRangeStart}
              onChange={(e) =>
                (store.bufferRangeStart = parseFloat(e.target.value))
              }
            />
          </Col>
        </Form.Group>

        <Form.Group controlId="buffer.rangeEnd">
          <Form.Label>Range End</Form.Label>
          <Col>
            <RangeSlider
              step={0.01}
              max={1}
              value={store.bufferRangeEnd}
              onChange={(e) =>
                (store.bufferRangeEnd = parseFloat(e.target.value))
              }
            />
          </Col>
        </Form.Group>
      </div>

      <Form.Group controlId="buffer.end">
        <Form.Label>Buffer End</Form.Label>
        <Form.Control
          plaintext
          readOnly
          defaultValue={formatValue(store.bufferEnd)}
        />
      </Form.Group>

      <Form.Group controlId="buffer.throttle">
        <Form.Label>Throttle (ms)</Form.Label>
        <Form.Control
          as="select"
          value={store.bufferThrottle}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            (store.bufferThrottle = parseInt(e.target.value))
          }
        >
          <option value={1}>1</option>
          <option value={100}>100</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
        </Form.Control>
      </Form.Group>

      <Form.Group>
        <Form.Label column sm="2">
          Buffer Size (MB)
        </Form.Label>
        <Form.Control
          plaintext
          readOnly
          defaultValue={formatValue(store.bufferSize)}
        />
      </Form.Group>
    </div>
  ));
};
