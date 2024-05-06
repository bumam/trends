/** AxisX.tsx */
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface AxisProps {
  type: "left" | "bottom" | "right";
  mode: "x" | "y";
  scale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;
  ticks?:
    | number
    | ((
        scale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>,
      ) => number);
  tickFormat?: any;
  transform?: string;
  className?: string;
  disableAnimation?: boolean;
  anchorEl?: HTMLElement | null;
}

const Axis: React.FC<AxisProps> = ({
  type,
  scale,
  ticks = 0,
  tickFormat,
  transform = "",
  disableAnimation = false,
  anchorEl,
  className,
  mode,
  ...props
}) => {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const axisGenerator =
      type === "left"
        ? d3.axisLeft
        : type === "right"
          ? d3.axisRight
          : d3.axisBottom;
    const axis = axisGenerator(scale)
      .ticks(typeof ticks === "function" ? ticks(scale) : ticks)
      .tickFormat(tickFormat);
    const axisGroup = d3.select(ref.current);
    if (disableAnimation) {
      axisGroup.call(axis);
    } else {
      axisGroup.transition().duration(750).ease(d3.easeLinear).call(axis);
    }
    axisGroup.select(".domain").remove();
    axisGroup.selectAll("line").remove();
    axisGroup
      .selectAll("text")
      .attr("opacity", 0.5)
      .attr("fill", "black")
      .attr("font-size", "0.75rem");
  }, [scale, ticks, tickFormat, disableAnimation, type]);

  useEffect(() => {
    if (!anchorEl) return;
    if (mode === "x") {
      d3.select(anchorEl)
        .on("mouseout.axisX", () => {
          d3.select(ref.current)
            .selectAll<SVGTextElement, Date>("text")
            .attr("opacity", 0.5)
            .style("font-weight", "normal");
        })
        .on("mousemove.axisX", () => {
          const [x] = d3.pointer(event, anchorEl);
          const xDate = scale.invert(x);
          const textElements = d3
            .select(ref.current)
            .selectAll<SVGTextElement, Date>("text");
          const data = textElements.data();
          const index = d3.bisector((d: Date) => d).left(data, xDate);
          textElements
            .attr("opacity", (d, i) => (i === index - 1 ? 1 : 0.5))
            .style("font-weight", (d, i) =>
              i === index - 1 ? "bold" : "normal",
            );
        });
    } else {
      d3.select(anchorEl)
        .on("mouseout.axisY", () => {
          d3.select(ref.current)
            .selectAll<SVGTextElement, Date>("text")
            .attr("opacity", 0.5)
            .style("font-weight", "normal");
        })
        .on("mousemove.axisY", () => {
          const [y] = d3.pointer(event, anchorEl);
          const yDate = scale.invert(y);
          const textElements = d3
            .select(ref.current)
            .selectAll<SVGTextElement, Date>("text");

          const data = textElements.data();
          const index = d3.bisector((d) => d.value).left(data, yDate);
          textElements
            .attr("opacity", (d, i) => (i === index - 1 ? 1 : 0.5))
            .style("font-weight", (d, i) =>
              i === index - 1 ? "bold" : "normal",
            );
        });
    }
  }, [anchorEl, scale]);

  return <g ref={ref} className={className} transform={transform} {...props} />;
};

export default Axis;
