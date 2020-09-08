import * as React from "react";
import { Table } from "react-bootstrap";
import { useRootStore } from "../models/RootStore";
import { useObserver } from "mobx-react-lite";
import { flatten } from "../utils/flatten";

export const State: React.FC = () => {
  const busEventStore = useRootStore().busEventStore;

  return useObserver(() => {
    const rows = Object.entries(
      Object.fromEntries(busEventStore.lastSnapshot.entries())
    ).map(([key, stream]) => (
      <React.Fragment key={key}>
        <tr>
          <td>{key}</td>
          <td>{stream.latestEventTime?.toISOString()}</td>
          <td>{stream.eventsSinceLastSnapshot}</td>
          <td></td>
        </tr>
        {Object.entries(flatten(stream.latestEvent || {})).map(
          ([subkey, value]) => (
            <tr key={subkey}>
              <td>{subkey}</td>
              <td></td>
              <td></td>
              <td>{(value as any).toString()}</td>
            </tr>
          )
        )}
      </React.Fragment>
    ));

    return (
      <Table striped bordered hover size="sm" responsive="md">
        <thead>
          <tr>
            <th>Key</th>
            <th>Latest Timestamp</th>
            <th>Events/s</th>
            <th>Latest Value</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  });
};
