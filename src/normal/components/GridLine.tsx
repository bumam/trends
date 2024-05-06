/** GridLine.tsx */
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface GridLineProps {
  scale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;
  type: "vertical" | "horizontal";
  ticks?:
    | number
    | ((
        scale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>,
      ) => number);
  transform?: string;
  className?: string;
  size: number;
  disableAnimation?: boolean;
}

const GridLine: React.FC<GridLineProps> = ({
  scale,
  type,
  ticks = 0,
  transform = "",
  size,
  className,
  disableAnimation = false,
  ...props
}) => {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const axisGenerator = type === "vertical" ? d3.axisBottom : d3.axisLeft;
    const axis = axisGenerator(scale)
      .ticks(typeof ticks === "function" ? ticks(scale) : ticks)
      .tickSize(-size);

    const gridGroup = d3.select(ref.current);
    if (disableAnimation) {
      gridGroup.call(axis);
    } else {
      gridGroup.transition().duration(750).ease(d3.easeLinear).call(axis);
    }
    gridGroup.select(".domain").remove();
    gridGroup.selectAll("text").remove();
    gridGroup.selectAll("line").attr("stroke", "rgba(202, 196, 196, 0.7)");
  }, [scale, ticks, size, disableAnimation, type]);

  return <g ref={ref} className={className} transform={transform} {...props} />;
};

export default GridLine;
