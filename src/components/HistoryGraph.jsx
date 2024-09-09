import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns'; // You might need to install this: npm install chartjs-adapter-date-fns

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

function HistoryGraph({ history }) {
  const categories = Object.keys(history);
  const datasets = categories.map(category => {
    const data = history[category].map(conversion => ({
      x: new Date(conversion.timestamp),
      y: parseFloat(conversion.to.split(' ')[0])
    }));

    return {
      label: category,
      data: data,
      borderColor: getRandomColor(),
      fill: false
    };
  });

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute'
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Converted Value'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Conversion History',
      },
    },
  };

  const data = {
    datasets: datasets
  };

  return <Line options={options} data={data} />;
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

export default HistoryGraph;