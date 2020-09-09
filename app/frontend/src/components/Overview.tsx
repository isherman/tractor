import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { useRootStore } from "../models/RootStore";
import { useObserver } from "mobx-react-lite";
import { TractorState } from "../../genproto/farm_ng_proto/tractor/v1/tractor";
import { MotorControllerState } from "../../genproto/farm_ng_proto/tractor/v1/motor";

const voltageWarningThreshold = 38;

export const Overview: React.FC = () => {
  const busEventStore = useRootStore().busEventStore;
  return useObserver(() => {
    const absDistanceTraveled = (busEventStore.lastSnapshot.get("tractor_state")
      ?.latestEvent as TractorState)?.absDistanceTraveled;
    const rightMotorInputVoltage = (busEventStore.lastSnapshot.get(
      "right_motor/state"
    )?.latestEvent as MotorControllerState)?.inputVoltage;
    const rightMotorWarning =
      rightMotorInputVoltage &&
      rightMotorInputVoltage < voltageWarningThreshold;
    const leftMotorInputVoltage = (busEventStore.lastSnapshot.get(
      "left_motor/state"
    )?.latestEvent as MotorControllerState)?.inputVoltage;
    const leftMotorWarning =
      leftMotorInputVoltage && leftMotorInputVoltage < voltageWarningThreshold;

    return (
      <div>
        <h1>Overview</h1>
        <h2>Distance Traveled</h2>
        <ListGroup>
          <ListGroup.Item>{absDistanceTraveled}</ListGroup.Item>
        </ListGroup>
        <h2>Battery</h2>
        {
          <ListGroup>
            <ListGroup.Item variant={rightMotorWarning && "warning"}>
              {rightMotorInputVoltage}
            </ListGroup.Item>
            <ListGroup.Item variant={leftMotorWarning && "warning"}>
              {leftMotorInputVoltage}
            </ListGroup.Item>
          </ListGroup>
        }
        <h2>Process Status</h2>
        <ListGroup>
          <ListGroup.Item>No style</ListGroup.Item>
          <ListGroup.Item variant="primary">Primary</ListGroup.Item>
          <ListGroup.Item variant="secondary">Secondary</ListGroup.Item>
          <ListGroup.Item variant="success">Success</ListGroup.Item>
          <ListGroup.Item variant="danger">Danger</ListGroup.Item>
          <ListGroup.Item variant="warning">Warning</ListGroup.Item>
          <ListGroup.Item variant="info">Info</ListGroup.Item>
          <ListGroup.Item variant="light">Light</ListGroup.Item>
          <ListGroup.Item variant="dark">Dark</ListGroup.Item>
        </ListGroup>
      </div>
    );
  });
};
