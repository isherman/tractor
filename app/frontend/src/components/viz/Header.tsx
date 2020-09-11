import * as React from "react";
import { DataSource } from "./DataSource";
import { Buffer } from "./Buffer";
import styles from "./Header.module.scss";

export const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <DataSource />
      <Buffer />
    </div>
  );
};
