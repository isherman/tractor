import * as React from "react";
import { useEffect, useRef, useState } from "react";
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

  const resize = (): void => {
    const containerElement = containerRef?.current;

    if (containerElement && uPlotInstance) {
      uPlotInstance.setSize({
        width: containerElement.clientWidth,
        height: containerElement.clientHeight
      });
    }
  };

  useEffect(() => {
    setUPlotInstance(
      new uPlot(options, data, containerRef.current as HTMLElement)
    );
    return () => {
      uPlotInstance && uPlotInstance.destroy();
    };
  }, [containerRef, options]);

  useEffect(resize, [containerRef, uPlotInstance]);
  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [containerRef, uPlotInstance]);

  useEffect(() => {
    if (!uPlotInstance) {
      return;
    }
    uPlotInstance.setData(data);
    uPlotInstance.redraw();
  }, [data]);

  return <div className={styles.plot} ref={containerRef}></div>;
};
