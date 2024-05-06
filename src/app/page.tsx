"use client";

import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
} from "chart.js";
import React, { useEffect, useState } from "react";
import Legend from "@/normal/components/Legend";
import MultilineChart from "@/normal/views/MultilineChart";

import schc from "../normal/data/SCHC.json";
import vcit from "../normal/data/VCIT.json";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
);

const schcData = {
  name: "SCHC",
  color: "#d53e4f",
  items: schc.map((d) => ({ ...d, date: new Date(d.date) })),
};
const vcitData = {
  name: "VCIT",
  color: "#5e4fa2",
  items: vcit.map((d) => ({ ...d, date: new Date(d.date) })),
};

export default function Home() {
  const [selectedItems, setSelectedItems] = useState<any>([]);
  const legendData = [schcData, vcitData];
  const chartData = [
    ...[schcData, vcitData].filter((d) => selectedItems.includes(d.name)),
  ];
  const onChangeSelection = (name: any) => {
    const newSelectedItems = selectedItems.includes(name)
      ? selectedItems.filter((item: any) => item !== name)
      : [...selectedItems, name];
    setSelectedItems(newSelectedItems);
  };
  useEffect(() => {});
  return (
    <div className="App">
      <Legend
        data={legendData}
        selectedItems={selectedItems}
        onChange={onChangeSelection}
      />
      <MultilineChart
        data={chartData}
        margin={{
          top: 0,
          bottom: 100,
          left: 150,
          right: 150,
        }}
      />
    </div>
  );
}
