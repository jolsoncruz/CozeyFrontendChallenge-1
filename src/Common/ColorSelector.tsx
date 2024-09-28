import React from "react";

const ColorSelector = ({
  selectedColor,
  setColor,
  colors,
}: {
  selectedColor: string;
  setColor: (color: { value: string }) => void;
  colors: { value: string; title: string }[];
}) => {
  return (
    <div>
      <label>Select Color</label>
      <select
        value={selectedColor || ""}
        onChange={(e) => setColor({ value: e.target.value })}
      >
        {colors.map((color) => (
          <option key={color.value} value={color.value}>
            {color.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ColorSelector;
