import React, { useEffect, useRef, useState } from "react";
import { useRootStore } from "@transneft/hmi-ui-trends";
import { zoomIdentity } from "d3";
import { brushX } from "d3-brush";
import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import { IYPanelsGroup } from "libs/da-trends/src/store/connected-panels-store/connected-panels-store";
import { observer } from "mobx-react-lite";
import { useDimensions } from "../../utils";
import { ChartPanelUnit } from "../chart-panel-unit/chart-panel-unit";
import { Stage, Layer, Rect } from "react-konva";
import { useChart, useZoom, useBrush } from "ds";
const X_AXIS_UPDATE_INTERVAL_MILLISECONDS = 1000;
const MultiLineChart = observer(
  ({ margin, connectedAxesGroups, chartId, mainAxisXId }) => {
    const { globalStore, connectedPanelsStore } = useRootStore();
    const [loaded, setLoaded] = useState(false);
    const stageRef = useRef(null);
    const layerRef = useRef(null);
    const [isBrushing, setIsBrushing] = useState(false);
    const mainStore = connectedPanelsStore.getAxisStoreByXId(mainAxisXId);
    const [containerRef, { svgWidth, svgHeight, width, height }] =
      useDimensions({
        maxHeight: 800,
        margin,
      });
    // Pan
    const { zoomProps, resetZoom } = useZoom({
      scaleExtent: [0.001, 50],
      filter: () => !globalStore.isShiftPressed && !isBrushing,
      onZoom: (evt) => mainStore.updateZoomState(evt.transform),
    });
    // Zoom
    const { updateDomain } = useChart({
      updateDomain: ([startDate, endDate]) => {
        mainStore.updateCurrentXDomain([startDate, endDate]);
      },
    });
    // Brush
    const { brushProps, brushed } = useBrush({
      extent: [
        [0, 0],
        [width, height],
      ],
      onStart: () => setIsBrushing(true),
      onEnd: (evt) => {
        if (!evt.selection) {
          setIsBrushing(false);
          return;
        }
        const [x0, x1] = evt.selection.map(mainStore.xScale.invert);
        updateDomain([x0, x1]);
        setIsBrushing(false);
      },
    });
    // Common block
    useEffect(() => {
      let intervalId;
      if (mainStore.isLiveMode) {
        intervalId = setInterval(() => {
          const leftData = new Date(
            mainStore.currentXDomain[0]
              .setSeconds(mainStore.currentXDomain[0].getSeconds() + 1)
              .valueOf(),
          );
          const rightData = new Date(
            mainStore.currentXDomain[1]
              .setSeconds(mainStore.currentXDomain[1].getSeconds() + 1)
              .valueOf(),
          );
          if (
            mainStore.isLiveMode &&
            !globalStore.isMouseDown &&
            !globalStore.isWheel
          ) {
            updateDomain([leftData, rightData]);
          }
        }, X_AXIS_UPDATE_INTERVAL_MILLISECONDS);
      }
      return () => {
        clearInterval(intervalId);
      };
    }, [mainStore.isLiveMode]);
    useEffect(() => {
      if (mainStore.isRealTimeDomain && mainStore.xScale) {
        const [x0, x1] = [mainStore.initialMinDataX, mainStore.initialMaxDataX];
        updateDomain([x0, x1]);
        mainStore.confirmRealTimeDomain();
      }
    }, [mainStore.isRealTimeDomain]);
    useEffect(() => {
      if (globalStore.resetSettings) {
        resetZoom();
        globalStore.confirmResetSettings();
      }
    }, [globalStore.resetSettings]);
    useEffect(() => {
      if (loaded) return;
      updateDomain([mainStore.initialMinDataX, mainStore.initialMaxDataX]);
      setLoaded(true);
    }, [loaded]);
    return (
      <div ref={containerRef} className={s.MultiLineChart}>
        <Stage ref={stageRef} width={svgWidth} height={svgHeight}>
          <Layer ref={layerRef}>
            <Rect
              {...zoomProps}
              {...brushProps}
              x={0}
              y={0}
              width={width}
              height={height}
              opacity={0}
              fill={"black"}
            />
            {[...connectedAxesGroups].map((storesGroup: IYPanelsGroup) => {
              const { yPanelId, stores, panelOrder } = storesGroup;
              return stores.map((oneAxisPairStore, index) => {
                oneAxisPairStore.updateWidth(width);
                const separatedPanelsCount = connectedAxesGroups.length;
                const onePanelHeight =
                  separatedPanelsCount === 0
                    ? height
                    : height / separatedPanelsCount;
                oneAxisPairStore.updateHeight(onePanelHeight);
                return (
                  <ChartPanelUnit
                    key={index}
                    axesIndex={index}
                    panelOrder={panelOrder}
                    oneAxisPairStore={oneAxisPairStore}
                    totalHeight={height}
                    onePanelHeight={onePanelHeight}
                    width={width}
                    chartId={chartId}
                    yPanelId={yPanelId}
                    connectedAxesGroups={connectedAxesGroups}
                    mainAxisXId={mainAxisXId}
                    ancher={layerRef.current}
                  />
                );
              });
            })}
          </Layer>
        </Stage>
      </div>
    );
  },
);
export default React.memo(MultiLineChart);
