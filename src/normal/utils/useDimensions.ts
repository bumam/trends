import React, { useRef } from "react";
import useResize from "./useResize";

interface UseDimensionsProps {
  maxHeight?: number;
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  scaleCoef?: number;
}

const useDimensions = ({
  maxHeight,
  margin = { left: 10, top: 10, bottom: 10, right: 10 },
  scaleCoef = 0.5,
}: UseDimensionsProps): [
  React.RefObject<HTMLDivElement>,
  {
    svgWidth: number;
    svgHeight: number;
    width: number;
    height: number;
  },
] => {
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useResize(ref);

  const height =
    !maxHeight || width * scaleCoef < maxHeight ? width * scaleCoef : maxHeight;
  const innerWidth = width - (margin.left || 0) - (margin.right || 0);
  const innerHeight = height - (margin.top || 0) - (margin.bottom || 0);

  return [
    ref,
    {
      svgWidth: width,
      svgHeight: height,
      width: innerWidth,
      height: innerHeight,
    },
  ];
};

export default useDimensions;
