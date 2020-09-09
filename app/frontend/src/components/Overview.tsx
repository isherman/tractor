import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { useObserver } from "mobx-react-lite";
import { TractorState } from "../../genproto/farm_ng_proto/tractor/v1/tractor";
import { MotorControllerState } from "../../genproto/farm_ng_proto/tractor/v1/motor";
import { formatValue } from "../utils/formatValue";
import { useStores } from "../hooks/useStores";

const voltageWarningThreshold = 38;

export const Overview: React.FC = () => {
  const { busEventStore } = useStores();
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

    const processes = Array.from(busEventStore.lastSnapshot.keys())
      .filter((key) => key.startsWith("ipc/announcement"))
      .map<[string, Date?]>((key) => [
        key.replace("ipc/announcement/", ""),
        busEventStore.lastSnapshot.get(key)?.latestEventTime
      ]);
    const processStatus = (
      <ListGroup>
        {processes.map(([serviceName, lastSeen]) => (
          <React.Fragment key={serviceName}>
            <ListGroup.Item>{serviceName}</ListGroup.Item>
            <ListGroup.Item>{formatValue(lastSeen)}</ListGroup.Item>
          </React.Fragment>
        ))}
      </ListGroup>
    );

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
        {processStatus}
      </div>
    );
  });
};
