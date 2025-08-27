// frontend/src/helpers/TimeSeriesLine.js
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

/** data: [{ date: 'YYYY-MM-DD', count: number }], label: string */
export default function TimeSeriesLine({ data = [], label = "Count" }) {
  const labels = data.map(d => d.date);
  const counts = data.map(d => d.count);

  const chartData = {
    labels,
    datasets: [{ label, data: counts, fill: false, tension: 0.25 }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, precision: 0 }, x: { ticks: { autoSkip: true, maxTicksLimit: 10 } } },
    plugins: { legend: { display: true, position: "top" } },
  };

  return (
    <div style={{ width: "100%", height: 300 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
