import * as React from "react";
import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

interface IProps {
  data: uPlot.AlignedData;
  options: uPlot.Options;
}

export const Plot: React.FC<IProps> = (props) => {
  const plotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    new uPlot(props.options, props.data, plotRef.current as HTMLElement);
  }, [props]);

  return (
    <div>
      <div ref={plotRef} />
    </div>
  );
};
