/* eslint-disable no-console */
import { useObserver } from "mobx-react-lite";
import * as React from "react";
import { ListChildComponentProps, FixedSizeList as List } from "react-window";
import { useStores } from "../hooks/useStores";
import { formatValue } from "../utils/formatValue";
import styles from "./ProgramLog.module.scss";

const Row: React.FC<ListChildComponentProps> = ({ index, style }) => {
  const { programsStore: store } = useStores();

  return useObserver(() => {
    const stableIndex = store.eventLog.length - 1 - index;
    const handleClick = (
      e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ): void => {
      e.preventDefault();
      store.selectedEntry =
        store.selectedEntry === stableIndex ? null : stableIndex;
    };

    const isSelected = store.selectedEntry === stableIndex;
    const event = store.eventLog[stableIndex];
    return (
      <div
        style={style}
        className={isSelected ? styles.selectedEntry : undefined}
      >
        <a href="#" onClick={handleClick}>{`[${formatValue(
          event.stamp
        )}] ${formatValue(event.name)}`}</a>
      </div>
    );
  });
};
export const ProgramLog: React.FC = () => {
  const { programsStore: store } = useStores();

  return useObserver(() => {
    return (
      <>
        {store.eventLog.length > 0 && (
          <List
            height={600}
            itemCount={store.eventLog.length}
            itemSize={15}
            width={"40%"}
            className={styles.programLog}
          >
            {Row}
          </List>
        )}
      </>
    );
  });
};
