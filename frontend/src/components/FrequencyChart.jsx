import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

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

export default function AQICategoryFrequencyChart({ lat, lon }) {
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
            const counts = categories.map(() => 0);
            
            data.forEach((d) => {
              const aqi = d?.aqi ?? null;
              categories.forEach((cat, idx) => {
                if (aqi !== null && aqi >= cat.min && aqi <= cat.max) {
                  counts[idx]++;
                }
              });
            });
            
            setChartData({
              labels: categories.map((c) => c.label),
              datasets: [{
                label: 'Days in Category',
                data: counts,
                backgroundColor: [
                  '#86efac88', // Good - green
                  '#fde04788', // Moderate - yellow
                  '#fdba7488', // Poor - orange
                  '#f8717188', // Unhealthy - red
                  '#c084fc88', // Very Unhealthy - purple
                  '#94a3b888', // Hazardous - gray
                ],
                borderColor: [
                  '#22c55e',
                  '#eab308',
                  '#f97316',
                  '#ef4444',
                  '#a855f7',
                  '#64748b',
                ],
                borderWidth: 2,
              }]
            });
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

        // Aggregate all cities data
        const allCitiesCounts = categories.map(() => 0);
        
        citiesData.forEach(city => {
          city.data.forEach((d) => {
            const aqi = d?.aqi ?? null;
            categories.forEach((cat, idx) => {
              if (aqi !== null && aqi >= cat.min && aqi <= cat.max) {
                allCitiesCounts[idx]++;
              }
            });
          });
        });

        if (allCitiesCounts.some(count => count > 0)) {
          setChartData({
            labels: categories.map((c) => c.label),
            datasets: [{
              label: 'Days in Category (All Cities)',
              data: allCitiesCounts,
              backgroundColor: [
                '#86efac88', // Good - green
                '#fde04788', // Moderate - yellow
                '#fdba7488', // Poor - orange
                '#f8717188', // Unhealthy - red
                '#c084fc88', // Very Unhealthy - purple
                '#94a3b888', // Hazardous - gray
              ],
              borderColor: [
                '#22c55e',
                '#eab308',
                '#f97316',
                '#ef4444',
                '#a855f7',
                '#64748b',
              ],
              borderWidth: 2,
            }]
          });
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
          <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            AQI Category Frequency (Last 30 Days)
          </h2>
        </div>
        <div className="flex items-center justify-center h-64 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl border border-purple-100">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-gray-500 font-medium">Loading frequency data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            AQI Category Frequency (Last 30 Days)
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl border border-purple-100">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-gray-500 font-medium text-center px-4">
            {lat && lon ? 'No frequency data available for this location' : 'Select a location on the map to view AQI category distribution'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            AQI Category Frequency (Last 30 Days)
          </h2>
        </div>
        {showingLocation && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Selected Location
          </span>
        )}
        {!showingLocation && chartData && (
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            Major Cities Combined
          </span>
        )}
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
