import React, { useRef } from "react";
import { Axis, GridLine, Line, Overlay, Tooltip } from "../../components";
import useController from "./MultilineChart.controller";
import useDimensions from "../../utils/useDimensions";
import * as d3 from "d3";

interface MultilineChartProps {
  data: any[];
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

const MultilineChart: React.FC<MultilineChartProps> = ({
  data = [],
  margin = { left: 10, top: 10, bottom: 10, right: 10 },
}) => {
  const overlayRef = useRef<any>(null);
  const svgRef = useRef<any>(null);
  const [containerRef, { svgWidth, svgHeight, width, height }] = useDimensions({
    maxHeight: 800,
    margin,
  });
  const controller = useController({ data, width, height });
  const { yTickFormat, xTickFormat, xScale, yScale } = controller;
  const additionalLineMode: "x" | "y" = "x";

  const brush = d3.brushX().extent([
    [0, 0],
    [width, height],
  ]);

  return (
    <div ref={containerRef}>
      <svg width={svgWidth} height={svgHeight} ref={svgRef}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          <GridLine
            type="vertical"
            scale={xScale}
            ticks={10}
            size={height}
            transform={`translate(0, ${height})`}
          />
          <GridLine type="horizontal" scale={yScale} ticks={10} size={width} />
          <GridLine
            type="horizontal"
            className="baseGridLine"
            scale={yScale}
            ticks={22}
            size={width}
            disableAnimation
          />
          {data.map(({ name, items = [], color }) => (
            <Line
              key={name}
              data={items}
              xScale={xScale}
              yScale={yScale}
              color={color}
            />
          ))}
          {/*<Area*/}
          {/*  data={data[0].items}*/}
          {/*  xScale={xScale}*/}
          {/*  yScale={yScale}*/}
          {/*  color={"red"}*/}
          {/*/>*/}
          <Axis
            type="left"
            mode={additionalLineMode}
            scale={yScale}
            transform="translate(0, -10)"
            ticks={5}
            className="axisYLeft"
            tickFormat={yTickFormat}
          />
          <Axis
            type="right"
            mode={additionalLineMode}
            scale={yScale}
            transform={`translate(${width}, 0)`}
            ticks={5}
            className="axisYRight"
            tickFormat={yTickFormat}
          />
          <Overlay ref={overlayRef} width={width} height={height}>
            {overlayRef.current && (
              <>
                <Axis
                  type="bottom"
                  className="axisX"
                  anchorEl={overlayRef.current}
                  scale={xScale}
                  transform={`translate(0, ${height})`}
                  ticks={5}
                  tickFormat={xTickFormat}
                  mode={additionalLineMode}
                />
                <Tooltip
                  className="tooltip"
                  anchorEl={overlayRef.current}
                  width={width}
                  height={height}
                  margin={margin}
                  xScale={xScale}
                  yScale={yScale}
                  data={data}
                  mode={additionalLineMode}
                />
              </>
            )}
          </Overlay>
        </g>
      </svg>
    </div>
  );
};

export default MultilineChart;
