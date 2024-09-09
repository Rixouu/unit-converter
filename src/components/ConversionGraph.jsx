import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ConversionGraph({ fromUnit, toUnit, category }) {
  const generateData = () => {
    if (category !== 'temperature') return null;

    const data = [];
    const labels = [];
    const step = fromUnit === 'kelvin' ? 10 : 5;
    const start = fromUnit === 'celsius' ? -20 : fromUnit === 'fahrenheit' ? 0 : 250;
    const end = fromUnit === 'celsius' ? 40 : fromUnit === 'fahrenheit' ? 100 : 310;

    for (let i = start; i <= end; i += step) {
      labels.push(i);
      let converted;
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
        converted = (i * 9/5) + 32;
      } else if (fromUnit === 'celsius' && toUnit === 'kelvin') {
        converted = i + 273.15;
      } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
        converted = (i - 32) * 5/9;
      } else if (fromUnit === 'fahrenheit' && toUnit === 'kelvin') {
        converted = (i - 32) * 5/9 + 273.15;
      } else if (fromUnit === 'kelvin' && toUnit === 'celsius') {
        converted = i - 273.15;
      } else if (fromUnit === 'kelvin' && toUnit === 'fahrenheit') {
        converted = (i - 273.15) * 9/5 + 32;
      }
      data.push(converted);
    }

    return { labels, data };
  };

  const chartData = generateData();

  if (!chartData) return null;

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: `${fromUnit} to ${toUnit}`,
        data: chartData.data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${fromUnit} to ${toUnit} Conversion`,
      },
    },
  };

  return <Line options={options} data={data} />;
}

export default ConversionGraph;