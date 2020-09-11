import * as React from "react";
import { Header } from "./Header";
import { Content } from "./Content";

export const Root: React.FC = () => {
  return (
    <div>
      <Header />
      <Content />
    </div>
  );
};
