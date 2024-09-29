import React from "react";

const SeatingOptionSelector = ({
  selectedSeatingOption,
  setSeatingOption,
  seatingOptions,
}: {
  selectedSeatingOption: string;
  setSeatingOption: (seatingOption: { value: string }) => void;
  seatingOptions: { value: string; title: string }[];
}) => {
  return (
    <div>
      <label htmlFor="seating-option">Select Seating Option</label>
      <select
        id="seating-option"
        value={selectedSeatingOption || ""}
        onChange={(e) => setSeatingOption({ value: e.target.value })}
      >
        {seatingOptions.map((mappedOption) => (
          <option key={mappedOption.value} value={mappedOption.value}>
            {mappedOption.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeatingOptionSelector;
