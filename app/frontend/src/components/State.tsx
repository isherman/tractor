import * as React from "react";
import { Table } from "react-bootstrap";
import { useRootStore } from "../models/RootStore";
import { useObserver } from "mobx-react-lite";
import { flatten } from "../utils/flatten";

export const State: React.FC = () => {
  const busEventStore = useRootStore().busEventStore;

  return useObserver(() => {
    const rows = Object.entries(
      flatten(Object.fromEntries(busEventStore.state.entries()))
    ).map(([key, value]) => (
      <tr key={key}>
        <td>{key}</td>
        <td>{value.toString()}</td>
      </tr>
    ));

    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  });
};
