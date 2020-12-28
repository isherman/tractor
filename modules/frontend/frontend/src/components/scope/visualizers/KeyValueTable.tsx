import * as React from "react";
import { Table } from "react-bootstrap";
import { formatValue } from "../../../utils/formatValue";

interface IProps {
  headers?: string[];
  records: unknown[][];
}

export const KeyValueTable: React.FC<IProps> = ({ records, headers }) => {
  return (
    <Table bordered size="sm" responsive="md">
      {headers && (
        <thead>
          <tr>
            {headers.map((_) => (
              <th key={_}>{_}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {records.map((record) => (
          <tr key={formatValue(record[0])}>
            {record.map((v, i) => (
              <td key={i}>{formatValue(v)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
