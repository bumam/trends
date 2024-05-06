import React, { forwardRef, ReactNode } from "react";

interface OverlayProps {
  width: number;
  height: number;
  children: ReactNode;
}

const Overlay: React.ForwardRefRenderFunction<SVGRectElement, OverlayProps> = (
  { width, height, children },
  ref,
) => {
  return (
    <g>
      {children}
      <rect ref={ref} width={width} height={height} opacity={0} />
    </g>
  );
};

export default forwardRef(Overlay);
