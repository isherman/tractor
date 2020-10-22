import * as React from "react";
import {
  Button,
  OverlayTrigger,
  Popover as BootstrapPopover
} from "react-bootstrap";
import styles from "./Popover.module.scss";

export interface PopoverProps {
  title?: string;
}

export const Popover: React.FC<PopoverProps> = ({ title, children }) => {
  const popover = (
    <BootstrapPopover>
      {title && (
        <BootstrapPopover.Title as="h3">{title}</BootstrapPopover.Title>
      )}
      <BootstrapPopover.Content>
        <div className={styles.popoverContent}>{children}</div>
      </BootstrapPopover.Content>
    </BootstrapPopover>
  );

  return (
    <OverlayTrigger trigger="click" placement="auto" overlay={popover}>
      <Button variant={"light"}>{"{}"}</Button>
    </OverlayTrigger>
  );
};
