import React, { useCallback, useEffect, useRef } from "react";
import * as d3 from "d3";
import { MultiLineDataType } from "../utils/propTypes";
import { formatPercent, formatPriceUSD } from "../utils/commonUtils";

interface TooltipProps {
  width: number;
  height: number;
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  data: MultiLineDataType[];
  xScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  anchorEl: HTMLElement | null;
  className?: string;
  mode: "x" | "y";
}

const Tooltip: React.FC<TooltipProps> = ({
  width,
  height,
  margin,
  data,
  xScale,
  yScale,
  anchorEl,
  className,
  mode = "x",
}) => {
  const ref = useRef<SVGGElement>(null);
  const fixedLinesXRef = useRef<SVGGElement>(null);
  const fixedLinesYRef = useRef<SVGGElement>(null);
  let fixedLines = [];
  const drawLineX = useCallback(
    (x: number) => {
      if (mode === "x") {
        d3.select(ref.current)
          .select(".tooltipLineX")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", -margin.top)
          .attr("y2", height);
      }
    },
    [ref, height, margin],
  );

  const drawLineY = useCallback(
    (y: number) => {
      if (mode === "y") {
        d3.select(ref.current)
          .select(".tooltipLineY")
          .attr("x1", -margin.bottom)
          .attr("x2", width)
          .attr("y1", y)
          .attr("y2", y);
      }
    },
    [ref, height, margin],
  );

  const drawContent = useCallback(
    (x: number) => {
      const tooltipContent = d3.select(ref.current).select(".tooltipContent");
      tooltipContent.attr("transform", (_, i, nodes) => {
        const nodeWidth = nodes[i]?.getBoundingClientRect().width || 0;
        const translateX = nodeWidth + x > width ? x - nodeWidth - 12 : x + 8;
        return `translate(${translateX}, ${-margin.top})`;
      });
      tooltipContent
        .select(".contentTitle")
        .text(d3.timeFormat("%b %d, %Y")(xScale.invert(x)));
    },
    [xScale, margin, width],
  );

  const drawBackground = useCallback(() => {
    const contentBackground = d3
      .select(ref.current)
      .select(".contentBackground");
    contentBackground.attr("width", 125).attr("height", 40);

    const tooltipContentElement = d3
      .select(ref.current)
      .select(".tooltipContent")
      .node();
    if (!tooltipContentElement) return;

    const contentSize = tooltipContentElement.getBoundingClientRect();
    contentBackground
      .attr("width", contentSize.width + 8)
      .attr("height", contentSize.height + 4);
  }, []);

  const onChangePosition = useCallback(
    (
      d: {
        date?: Date;
        value?: number;
        marketvalue?: number;
      },
      i: number,
      isVisible: boolean,
    ) => {
      d3.selectAll<
        SVGTextElement,
        {
          date?: Date;
          value?: number;
          marketvalue?: number;
        }
      >(".performanceItemValue")
        .filter((_, tIndex) => tIndex === i)
        .text(isVisible ? formatPercent(d.value || 0) : "");
      d3.selectAll<
        SVGTextElement,
        {
          date?: Date;
          value?: number;
          marketvalue?: number;
        }
      >(".performanceItemMarketValue")
        .filter((_, tIndex) => tIndex === i)
        .text(
          d.marketvalue && !isVisible
            ? "No data"
            : formatPriceUSD(d.marketvalue || 0),
        );

      const maxNameWidth = d3.max(
        d3
          .selectAll<
            SVGTextElement,
            {
              name: string;
              color: string;
            }
          >(".performanceItemName")
          .nodes(),
        (node) => node.getBoundingClientRect().width,
      );
      d3.selectAll<
        SVGTextElement,
        {
          name: string;
          color: string;
        }
      >(".performanceItemValue").attr(
        "transform",
        (_, index, nodes) =>
          `translate(${nodes[index].previousElementSibling?.getBoundingClientRect().width + 14},4)`,
      );

      d3.selectAll<
        SVGTextElement,
        {
          name: string;
          color: string;
        }
      >(".performanceItemMarketValue").attr(
        "transform",
        `translate(${maxNameWidth + 60},4)`,
      );
    },
    [],
  );

  const followPoints = useCallback(() => {
    const [x, y] = d3.pointer(event, anchorEl);
    const xDate = xScale.invert(x);
    const yDate = yScale.invert(y);

    const bisectDate = d3.bisector((d: any) => {
      return d.date;
    }).left;
    const bisectValue = d3.bisector((d: any) => {
      return d.value;
    }).left;

    let baseXPos = 0;
    let baseYPos = 0;

    d3.select(ref.current)
      .selectAll<
        SVGCircleElement,
        {
          name: string;
          color: string;
        }
      >(".tooltipLinePoint")
      .attr("transform", (_, i) => {
        const indexX = bisectDate(data[i].items, xDate, 1);
        const indexY = bisectValue(data[i].items, yDate, 1);
        const d0 = data[i].items[indexX - 1];
        const d1 = data[i].items[indexX];
        // console.log("d0, d1", d0, d1);

        const yd0 = data[i].items[indexY - 1];
        const yd1 = data[i].items[indexY];
        // console.log("yd0, yd1", yd0, yd1)

        const d =
          xDate - (d0?.date?.getTime() || 0) >
          (d1?.date?.getTime() || 0) - xDate
            ? d1
            : d0;

        if (!d || !d.date || !d.value) {
          return "translate(-100,-100)";
        }
        const xPos = xScale(d.date);

        if (i === 0) {
          baseXPos = xPos;
        }

        let isVisible = true;
        if (xPos !== baseXPos) {
          isVisible = false;
        }
        const yPos = yScale(d.value);
        if (i === 0) {
          baseYPos = yPos;
        }

        onChangePosition(d, i, isVisible);

        return isVisible
          ? `translate(${xPos}, ${yPos})`
          : "translate(-100,-100)";
      });

    mode === "x" ? drawLineX(baseXPos) : drawLineY(baseYPos);

    drawContent(baseXPos);
    drawBackground();
  }, [
    anchorEl,
    drawLineX,
    drawLineY,
    drawContent,
    drawBackground,
    xScale,
    yScale,
    data,
    onChangePosition,
  ]);

  useEffect(() => {
    d3.select(anchorEl)
      .on("mouseout.tooltip", () => {
        d3.select(ref.current).attr("opacity", 0);
      })
      .on("mouseover.tooltip", () => {
        d3.select(ref.current).attr("opacity", 1);
      })
      .on("click", () => {
        console.log("click", d3.select(ref.current));

        const line = d3
          .select(ref.current)
          .select(".tooltipLineX")
          .node()
          .cloneNode(true);

        const point = d3
          .select(ref.current)
          .selectAll<
            SVGCircleElement,
            {
              name: string;
              color: string;
            }
          >(".tooltipLinePoint")
          .node()
          .cloneNode(true);

        console.log("line", line);
        console.log("point", point);

        d3.select(line).attr("class", "fixedLineX");
        console.log("");
        d3.select(fixedLinesXRef.current)
          .append("g")
          .node()
          .append(line, point);
      })
      .on("mousemove.tooltip", () => {
        d3.select(ref.current)
          .selectAll<
            SVGCircleElement,
            {
              name: string;
              color: string;
            }
          >(".tooltipLinePoint")
          .attr("opacity", 1);
        followPoints();
      });
  }, [anchorEl, followPoints]);

  if (!data.length) return null;

  return (
    <>
      <g ref={fixedLinesYRef} className="fixedLinesY"></g>

      <g ref={fixedLinesXRef} className="fixedLinesX"></g>

      <g ref={ref} className={className}>
        <line className="tooltipLineX" />
        <line className="tooltipLineY" />

        <g className="tooltipContent">
          <rect className="contentBackground" rx={4} ry={4} opacity={0.2} />
          <text className="contentTitle" transform="translate(4,14)" />
          <g className="content" transform="translate(4,32)">
            {data.map(({ name, color }, i) => (
              <g key={name} transform={`translate(6,${22 * i})`}>
                <circle r={6} fill={color} />
                <text
                  className="performanceItemName"
                  transform="translate(10,4)"
                >
                  {name}
                </text>
                <text
                  className="performanceItemValue"
                  opacity={0.5}
                  fontSize={10}
                />
                <text className="performanceItemMarketValue" />
              </g>
            ))}
          </g>
        </g>
        {data.map(({ name }) => (
          <circle className="tooltipLinePoint" r={6} key={name} opacity={0} />
        ))}
      </g>
    </>
  );
};

export default Tooltip;
