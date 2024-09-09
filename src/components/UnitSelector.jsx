import React from 'react';
import { conversionRates } from '../utils/conversionUtils';

function UnitSelector({ category, value, onChange }) {
  const units = Object.keys(conversionRates[category]);

  return (
    <select value={value} onChange={onChange}>
      {units.map((unit) => (
        <option key={unit} value={unit}>
          {unit}
        </option>
      ))}
    </select>
  );
}

export default UnitSelector;