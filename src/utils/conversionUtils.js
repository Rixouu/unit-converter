import Decimal from 'decimal.js';

export const conversionRates = {
  length: {
    meter: '1',
    kilometer: '1000',
    centimeter: '0.01',
    millimeter: '0.001',
    mile: '1609.344',
    yard: '0.9144',
    foot: '0.3048',
    inch: '0.0254'
  },
  mass: {
    kilogram: 1,
    gram: 1000,
    milligram: 1000000,
    pound: 2.20462,
    ounce: 35.274,
  },
  temperature: {
    celsius: 1,
    fahrenheit: 1,
    kelvin: 1,
  },
  volume: {
    liter: 1,
    milliliter: 1000,
    cubicMeter: 0.001,
    gallon: 0.264172,
    quart: 1.05669,
    pint: 2.11338,
    cubicFoot: 0.0353147,
  },
  area: {
    squareMeter: 1,
    squareKilometer: 1000000,
    squareMile: 2589988.11,
    acre: 4046.86,
    hectare: 10000,
    squareFoot: 0.092903,
  },
  // ... add more categories ...
};

export function convertUnits(value, fromUnit, toUnit, category) {
  return convert(value, fromUnit, toUnit, category);
}

export const convert = (value, fromUnit, toUnit, category) => {
  if (category === 'temperature') {
    return convertTemperature(value, fromUnit, toUnit);
  }

  const fromRate = new Decimal(conversionRates[category][fromUnit]);
  const toRate = new Decimal(conversionRates[category][toUnit]);
  
  const valueDecimal = new Decimal(value);
  
  // Convert to base unit
  const baseValue = valueDecimal.times(fromRate);
  
  // Convert from base unit to target unit
  return baseValue.dividedBy(toRate);
};

const convertTemperature = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return new Decimal(value);
  
  let celsius;
  switch (fromUnit) {
    case 'celsius':
      celsius = new Decimal(value);
      break;
    case 'fahrenheit':
      celsius = new Decimal(value).minus(32).times(5).dividedBy(9);
      break;
    case 'kelvin':
      celsius = new Decimal(value).minus(273.15);
      break;
  }

  switch (toUnit) {
    case 'celsius':
      return celsius;
    case 'fahrenheit':
      return celsius.times(9).dividedBy(5).plus(32);
    case 'kelvin':
      return celsius.plus(273.15);
  }
};

export const getConversionRate = (category, unit) => {
  return conversionRates[category][unit];
};

export const reverseConvert = (value, fromUnit, toUnit, category) => {
  if (category === 'temperature') {
    // ... existing temperature conversion logic ...
  } else {
    const fromRate = conversionRates[category][fromUnit];
    const toRate = conversionRates[category][toUnit];
    return (value * toRate) / fromRate;
  }
};