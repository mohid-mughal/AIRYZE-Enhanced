import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

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

export default function DailyAQILineChart({ lat, lon }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showingLocation, setShowingLocation] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      
      // If lat/lon provided, fetch history for that location
      if (lat && lon) {
        try {
          const response = await fetch(`http://localhost:5000/api/history?lat=${lat}&lon=${lon}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch history');
          }
          
          const data = await response.json();
          
          if (data && Array.isArray(data) && data.length > 0) {
            const datasets = [{
              label: 'Selected Location',
              data: data.map(d => ({
                x: d.date,
                y: d.aqi ?? null,
              })),
              borderColor: '#3b82f6',
              backgroundColor: '#3b82f655',
              borderWidth: 3,
              tension: 0.3,
              spanGaps: true,
              connectNulls: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
            }];
            
            setChartData({ datasets });
            setShowingLocation(true);
            setLoading(false);
            return;
          } else {
            // No data available for this location, fall back to cities
            setShowingLocation(false);
          }
        } catch (error) {
          console.error('Error fetching location history:', error);
          setShowingLocation(false);
        }
      } else {
        setShowingLocation(false);
      }
      
      // Load all major cities history (default view or fallback)
      try {
        const majorCities = [
          { name: 'Karachi', lat: 24.8607, lon: 67.0011 },
          { name: 'Lahore', lat: 31.5204, lon: 74.3587 },
          { name: 'Islamabad', lat: 33.6844, lon: 73.0479 },
          { name: 'Rawalpindi', lat: 33.5651, lon: 73.0169 },
          { name: 'Peshawar', lat: 34.0151, lon: 71.5249 },
          { name: 'Quetta', lat: 30.1798, lon: 66.9750 },
          { name: 'Faisalabad', lat: 31.4504, lon: 73.1350 },
          { name: 'Multan', lat: 30.1575, lon: 71.5249 },
        ];

        const citiesData = await Promise.all(
          majorCities.map(async (city) => {
            try {
              const response = await fetch(`http://localhost:5000/api/history?lat=${city.lat}&lon=${city.lon}`);
              const data = await response.json();
              return { name: city.name, data: data || [] };
            } catch (error) {
              console.error(`Error fetching ${city.name} history:`, error);
              return { name: city.name, data: [] };
            }
          })
        );

        const datasets = citiesData
          .filter(city => city.data.length > 0)
          .map((city) => ({
            label: city.name,
            data: city.data.map(d => ({
              x: d.date,
              y: d.aqi ?? null,
            })),
            borderColor: CITY_COLORS[city.name] || '#000',
            backgroundColor: (CITY_COLORS[city.name] || '#000') + '55',
            borderWidth: 2,
            tension: 0.25,
            spanGaps: true,
            connectNulls: true,
            pointRadius: 2,
            pointHoverRadius: 4,
          }));

        if (datasets.length > 0) {
          setChartData({ datasets });
        } else {
          setChartData(null);
        }
      } catch (error) {
        console.error('Error fetching cities history:', error);
        setChartData(null);
      }
      
      setLoading(false);
    }

    load();
  }, [lat, lon]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Daily AQI Trend
          </h2>
        </div>
        <div className="flex items-center justify-center h-64 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-gray-500 font-medium">Loading historical data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Daily AQI Trend
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div className="text-gray-500 font-medium text-center px-4">
            {lat && lon ? 'No historical data available for this location' : 'Select a location on the map to view 30-day AQI trends'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Daily AQI Trend
          </h2>
        </div>
        {showingLocation && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Selected Location
          </span>
        )}
        {!showingLocation && chartData && (
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            Major Cities
          </span>
        )}
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
