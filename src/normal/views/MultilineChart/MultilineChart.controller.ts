/** MultilineChart.controller.tsx */

import { useMemo } from "react";
import * as d3 from "d3";

interface MultilineChartData {
  name: string;
  color: string;
  items: { date: Date; value: number }[];
}

interface UseControllerProps {
  data: MultilineChartData[];
  width: number;
  height: number;
}

const useController = ({ data, width, height }: UseControllerProps) => {
  const xMin = useMemo(
    () => d3.min(data, ({ items }) => d3.min(items, ({ date }) => date)),
    [data],
  );

  const xMax = useMemo(
    () => d3.max(data, ({ items }) => d3.max(items, ({ date }) => date)),
    [data],
  );

  const xScale = useMemo(
    () =>
      d3
        .scaleTime()
        .domain([xMin as Date, xMax as Date])
        .range([0, width]),
    [xMin, xMax, width],
  );

  // const yMin = useMemo(
  //   () => data ? d3.min(data, ({ items }) => d3.min(items, ({ value }) => value)) : 0,
  //   [data],
  // );
  const yMin = 0;

  const yMax = useMemo(
    () =>
      data
        ? d3.max(data, ({ items }) => d3.max(items, ({ value }) => value))
        : 100,
    [data],
  );
  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);
  }, [height, yMin, yMax]);

  // const yTickFormat = (d) =>
  //     `${parseFloat(d) > 0 ? "+" : ""}${d3.format(".2%")(d / 100)}`;
  const yTickFormat = (d: number) => d;

  const xTickFormat = (d: Date) => {
    if (d3.timeFormat("%b")(d) === "Jan") {
      return d3.timeFormat("%Y")(d);
    }
    return d3.timeFormat("%b")(d);
  };

  return {
    yTickFormat,
    xScale,
    yScale,
    xTickFormat,
  };
};

export default useController;
