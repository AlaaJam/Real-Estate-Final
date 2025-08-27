// frontend/src/helpers/graphs.js
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarGraph = ({ properties = [] }) => {
  const categories = [...new Set(properties.map(p => p.category || "Uncategorized"))];
  const counts = categories.map(c =>
    properties.filter(p => (p.category || "Uncategorized") === c).length
  );

  const data = {
    labels: categories,
    datasets: [{ label: "Properties", data: counts }],
  };

 

  return (
    <div style={{ width: "100%", height: 300 }}>
      <Bar data={data}  />
    </div>
  );
};

export default BarGraph;
