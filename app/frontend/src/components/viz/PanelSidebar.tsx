import * as React from "react";
import styles from "./PanelSidebar.module.scss";
import { Button, Form } from "react-bootstrap";
import { useStores } from "../../hooks/useStores";
import { useObserver } from "mobx-react-lite";
import { ChangeEvent } from "react";
import { EventTypeId, eventTypeIds } from "../../registry/events";
import { visualizerId } from "../../stores/VisualizationStore";

interface IProps {
  id: string;
}

export const PanelSidebar: React.FC<IProps> = ({ id }) => {
  const { visualizationStore: store } = useStores();

  return useObserver(() => {
    const panel = store.panels.get(id);
    if (!panel) return null;

    const removePanel = (): void => {
      store.deletePanel(id);
    };

    const setTagFilter = (e: ChangeEvent<HTMLInputElement>): void => {
      panel.tagFilter = e.target.value;
    };

    let { eventType } = panel;
    const {
      tagFilter,
      selectedVisualizer,
      visualizers,
      optionConfigs: optionConfigs,
      selectedOptions
    } = panel;
    const setEventType = (e: ChangeEvent<HTMLSelectElement>): void => {
      if (e.target.value) {
        panel.setEventType(e.target.value as EventTypeId);
      }
    };

    const setVisualizer = (e: ChangeEvent<HTMLSelectElement>): void => {
      panel.setVisualizer(parseInt(e.target.value) as number);
    };

    const setOption = (i: number, e: ChangeEvent<HTMLSelectElement>): void => {
      panel.setOption(i, parseInt(e.target.value) as number);
    };

    const bufferEmpty = Object.keys(store.buffer).length === 0;
    if (!bufferEmpty && !Object.keys(store.buffer).includes(eventType)) {
      panel.setEventType(Object.keys(store.buffer)[0] as EventTypeId);

      // TODO: Figure out why this is necessary
      eventType = (Object.keys(store.buffer) as EventTypeId[])[0];
    }

    return (
      <div className={styles.panelSidebar}>
        <Button onClick={removePanel}>X</Button>

        <Form.Group controlId="eventType">
          <Form.Label>Data Type</Form.Label>
          <Form.Control
            as="select"
            disabled={bufferEmpty}
            value={bufferEmpty ? "" : eventType}
            onChange={setEventType}
          >
            {[...eventTypeIds].map((_) => (
              <option disabled={!(_ in store.buffer)} key={_}>
                {_}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="tags">
          <Form.Label>Tag Filter</Form.Label>
          <Form.Control
            value={tagFilter}
            onChange={setTagFilter}
            disabled={bufferEmpty}
          />
          <Form.Text className="text-muted">
            Supports regular expressions
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="visualizer">
          <Form.Label>Visualizer</Form.Label>
          <Form.Control
            as="select"
            value={selectedVisualizer}
            onChange={setVisualizer}
            disabled={bufferEmpty}
          >
            {visualizers.map((v, index) => (
              <option key={visualizerId(v)} value={index}>
                {visualizerId(v)}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        {optionConfigs.map((optionLabel, optionIndex) => (
          <Form.Group
            key={optionLabel.label}
            controlId={`option.{option.label}`}
          >
            <Form.Label>{optionLabel.label}</Form.Label>
            <Form.Control
              as="select"
              value={selectedOptions[optionIndex]}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setOption(optionIndex, e)
              }
              disabled={bufferEmpty}
            >
              {optionLabel.options.map((valueLabel, valueIndex) => (
                <option key={valueLabel} value={valueIndex}>
                  {valueLabel}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        ))}
      </div>
    );
  });
};
