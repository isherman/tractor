import * as React from "react";
import styles from "./Buffer.module.scss";
import { Form } from "react-bootstrap";
import { useStores } from "../../hooks/useStores";
import { useObserver } from "mobx-react-lite";
import { formatValue } from "../../utils/formatValue";

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

      <Form.Group controlId="buffer.rangeStart">
        <Form.Label>Range Start</Form.Label>
        <Form.Control
          type="text"
          defaultValue={formatValue(store.bufferRangeEnd)}
        />
      </Form.Group>

      <Form.Group controlId="buffer.cursor">
        <Form.Label>Current</Form.Label>
        <Form.Control type="range" custom />
      </Form.Group>

      <Form.Group controlId="buffer.rangeEnd">
        <Form.Label>Buffer End</Form.Label>
        <Form.Control
          type="text"
          defaultValue={formatValue(store.bufferRangeEnd)}
        />
      </Form.Group>

      <Form.Group controlId="buffer.end">
        <Form.Label>Buffer End</Form.Label>
        <Form.Control
          plaintext
          readOnly
          defaultValue={formatValue(store.bufferEnd)}
        />
      </Form.Group>

      <Form.Group controlId="buffer.rate">
        <Form.Label>Rate (hz)</Form.Label>
        <Form.Control as="select">
          <option>1</option>
          <option>5</option>
          <option>10</option>
          <option>100</option>
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
