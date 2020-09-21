import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import styles from "./Plot.module.scss";
import "uplot/dist/uPlot.min.css";

interface IProps {
  data: uPlot.AlignedData;
  options: uPlot.Options;
}

export const Plot: React.FC<IProps> = ({ data, options }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [uPlotInstance, setUPlotInstance] = useState<uPlot | null>(null);

  // On mount, or if options change, instantiate a new uPlot instance
  useEffect(() => {
    setUPlotInstance(
      (existing) =>
        existing ||
        new uPlot(options, data, containerRef.current as HTMLElement)
    );
  }, [containerRef, options]);

  // On data change, just update the data
  useEffect(() => {
    if (!uPlotInstance) {
      return;
    }
    uPlotInstance.setData(data);
    uPlotInstance.redraw();
  }, [data]);

  // Resize
  const resize = useCallback(() => {
    const containerElement = containerRef?.current;

    if (containerElement && uPlotInstance) {
      uPlotInstance.setSize({
        width: Math.floor(containerElement.clientWidth),
        height: Math.floor(containerElement.clientHeight - 25)
      });
    }
  }, [containerRef, uPlotInstance]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [containerRef, uPlotInstance]);

  return (
    <div
      id={`plot-${Math.random()}`}
      className={styles.plot}
      ref={containerRef}
    ></div>
  );
};
