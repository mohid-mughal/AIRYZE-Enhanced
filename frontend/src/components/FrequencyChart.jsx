import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { getAllCitiesHistory } from "../api/historyService";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

const categories = [
  { label: "Good", min: 0, max: 50 },
  { label: "Moderate", min: 51, max: 100 },
  { label: "Poor", min: 101, max: 150 },
  { label: "Unhealthy", min: 151, max: 200 },
  { label: "Very Unhealthy", min: 201, max: 300 },
  { label: "Hazardous", min: 301, max: 999 },
];

export default function AQICategoryFrequencyChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function load() {
      const history = await getAllCitiesHistory();
      const cities = Object.keys(history);

      // Count AQI occurrences in each category per city
      const cityCategoryCounts = cities.map((city) => {
        const counts = categories.map(() => 0);

        history[city].forEach((d) => {
          const aqi = d?.aqi ?? null;

          categories.forEach((cat, idx) => {
            if (aqi !== null && aqi >= cat.min && aqi <= cat.max) {
              counts[idx]++;
            }
          });
        });

        return counts;
      });

      setChartData({
        labels: categories.map((c) => c.label),
        datasets: cities.map((city, idx) => ({
          label: city,
          data: cityCategoryCounts[idx],
          backgroundColor: CITY_COLORS[city] + "88",
          borderColor: CITY_COLORS[city],
          borderWidth: 2,

          // Added for consistency — even though Bar charts don't draw gaps
          spanGaps: true,
          connectNulls: true,
        })),
      });
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
        <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          AQI Category Frequency (Last 30 Days)
        </h2>
      </div>

      <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-4 border border-purple-100">
        <Bar
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
                    weight: '600'
                  },
                  usePointStyle: true,
                },
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                  font: {
                    size: 11
                  }
                }
              },
              y: {
                beginAtZero: true,
                title: { 
                  display: true, 
                  text: "Count",
                  font: {
                    size: 12,
                    weight: '600'
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                  font: {
                    size: 11
                  }
                }
              },
            },
          }}
        />
      </div>
    </div>
  );
}
