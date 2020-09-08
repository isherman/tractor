import * as React from "react";
import { ListGroup } from "react-bootstrap";

export const Overview: React.FC = () => {
  return (
    <div>
      <h1>Overview</h1>
      <h2>Distance Traveled</h2>
      <h2>Battery</h2>
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
};
