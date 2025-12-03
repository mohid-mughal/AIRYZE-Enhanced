// ./components/cityAQIGrid.jsx
import React, { useState, useEffect } from "react";
import { getAQIStatus } from "../utils/aqiLevels";

export default function CityAQIGrid({
  fetchUrl = "http://localhost:5000/api/pak_cities",
  searchQuery = "",
}) {
  const [cities, setCities] = useState([]);

  async function fetchCities() {
    try {
      const res = await fetch(fetchUrl);
      const data = await res.json();
      setCities(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    (async () => {
      await fetchCities();
    })();
    const t = setInterval(fetchCities, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Filter cities based on search query
  const filteredCities = cities.filter((city) =>
    city.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {filteredCities.length === 0 && searchQuery ? (
        <div className="text-center py-8 text-gray-500">
          No cities found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {filteredCities.map((city, i) => {
          const status = getAQIStatus(city.aqi);

          return (
            <div
              key={i}
              className="flex flex-col justify-between p-5 rounded-xl border-2 shadow-md min-h-[160px] transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-default bg-white/80 backdrop-blur-sm"
              style={{
                borderColor: `${status.color}60`,
                backgroundColor: `${status.color}10`,
                animationDelay: `${i * 50}ms`
              }}
            >
              {/* Name + Updated time */}
              <div className="flex flex-col mb-4">
                <div className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{city.name}</div>
                <div className="text-xs text-gray-600 bg-white/60 rounded-lg p-2 inline-block">
                  <span className="font-semibold">Latest:</span>{" "}
                  <span>
                    {city.updatedAt
                      ? new Date(city.updatedAt * 1000).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "—"}
                  </span>
                </div>
              </div>
              {/* AQI + Label */}
              <div className="flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">AQI</div>
                  <div 
                    className="text-3xl sm:text-4xl font-extrabold leading-none"
                    style={{ color: status.color }}
                  >
                    {city.aqi ?? "—"}
                  </div>
                </div>
                <div 
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}dd 100%)`,
                    boxShadow: `0 4px 12px ${status.color}40`
                  }}
                >
                  {status.label}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
