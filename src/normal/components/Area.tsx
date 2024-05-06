/** Area.tsx */
import React, { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

interface AreaProps {
  xScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  color: string;
  data: { date: Date; value: number }[];
  disableAnimation?: boolean;
}

const Area: React.FC<AreaProps> = ({
  xScale,
  yScale,
  color,
  data,
  disableAnimation = false,
  ...props
}) => {
  const ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (disableAnimation) {
      d3.select(ref.current).attr("opacity", 1);
      return;
    }
    d3.select(ref.current)
      .transition()
      .duration(750)
      .ease(d3.easeBackIn)
      .attr("opacity", 1);
  }, [disableAnimation]);

  const d = useMemo(() => {
    const area = d3
      .area<{ date: Date; value: number }>()
      .x(({ date }) => xScale(date))
      .y1(({ value }) => yScale(value))
      .y0(() => yScale(yScale.domain()[0]));
    return area(data);
  }, [xScale, yScale, data]);

  return (
    <>
      <path
        ref={ref}
        d={d}
        fill={`url(#gradient-${color})`}
        opacity={0}
        {...props}
      />
      <defs>
        <linearGradient
          id={`gradient-${color}`}
          x1="0%"
          x2="0%"
          y1="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
    </>
  );
};

export default Area;
