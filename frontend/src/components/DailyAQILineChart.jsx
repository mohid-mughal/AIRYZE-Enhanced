import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getAllCitiesHistory } from "../api/historyService";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";

import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend
);

const CITY_COLORS = {
  Karachi: "#1f77b4",
  Lahore: "#ff7f0e",
  Islamabad: "#2ca02c",
  Rawalpindi: "#d62728",
  Peshawar: "#9467bd",
  Quetta: "#8c564b",
  Faisalabad: "#e377c2",
  Multan: "#7f7f7f",
};

export default function DailyAQILineChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function load() {
      const history = await getAllCitiesHistory();

      const cities = Object.keys(history);

      const datasets = cities.map((city) => ({
        label: city,
        data: history[city]
          .map((d) => ({
            x: d.date,
            y: d.aqi ?? null, // allow null for connectNulls
          }))
          .reverse(),
        borderColor: CITY_COLORS[city] || "#000", // fallback color
        backgroundColor: CITY_COLORS[city] + "55",
        borderWidth: 2,
        tension: 0.25,
        spanGaps: true, // *** Bridges missing days ***
        connectNulls: true, // *** Forces continuous line ***
        pointRadius: 2,
      }));

      setChartData({ datasets });
    }

    load();
  }, []);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 font-medium">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Daily AQI Trend
        </h2>
      </div>

      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl p-4 border border-blue-100">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 15,
                  font: {
                    size: 12,
                    weight: "600",
                  },
                  usePointStyle: true,
                },
              },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                titleColor: "#1f2937",
                bodyColor: "#4b5563",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
              },
            },
            scales: {
              x: {
                type: "time",
                time: { unit: "day" },
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
                ticks: {
                  font: {
                    size: 11,
                  },
                },
              },
              y: {
                title: {
                  display: true,
                  text: "AQI",
                  font: {
                    size: 12,
                    weight: "600",
                  },
                },
                min: 0,
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
                ticks: {
                  font: {
                    size: 11,
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
