import React from "react";

interface LegendProps {
  data: { name: string; color: string }[];
  selectedItems: string[];
  onChange: (name: string) => void;
}

const Legend: React.FC<LegendProps> = ({ data, selectedItems, onChange }) => (
  <div className="legendContainer">
    {data.map((d) => (
      <div className="checkbox" style={{ color: d.color }} key={d.name}>
        <label>
          {d.name !== "Portfolio" && (
            <input
              type="checkbox"
              value={d.name}
              checked={selectedItems.includes(d.name)}
              onChange={() => onChange(d.name)}
            />
          )}
          {d.name}
        </label>
      </div>
    ))}
  </div>
);

export default Legend;
