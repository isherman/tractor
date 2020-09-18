import * as React from "react";
import styles from "./DataSource.module.scss";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import { useStores } from "../../hooks/useStores";
import { DataSourceType } from "../../stores/VisualizationStore";
import { useObserver } from "mobx-react-lite";
import { ChangeEvent } from "react";

export const DataSource: React.FC = () => {
  const { visualizationStore: store } = useStores();

  const setDataSource = (d: DataSourceType): void => {
    store.dataSource = d;
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.currentTarget.checked &&
      setDataSource(e.currentTarget.value as DataSourceType);
  };

  return useObserver(() => {
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
          <ToggleButton
            type="radio"
            name="dataSource"
            checked={store.dataSource === "log"}
            value={"log"}
            onChange={handleOnChange}
          >
            Log
          </ToggleButton>
        </ButtonGroup>
      </div>
    );
  });
};
