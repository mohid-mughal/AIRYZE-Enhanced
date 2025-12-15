// ./components/cityAQIGrid.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getAQIStatus } from "../utils/aqiLevels";
import { badgeTracker } from "../utils/badgeTracker";

export default function CityAQIGrid({
  fetchUrl = "http://localhost:5000/api/pak_cities",
  searchQuery = "",
}) {
  const [cities, setCities] = useState([]);
  const [searchedCities, setSearchedCities] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchCities = useCallback(async () => {
    try {
      const res = await fetch(fetchUrl);
      const data = await res.json();
      setCities(data || []);
      
      // Track city views for badge progress
      if (data && data.length > 0) {
        data.forEach(city => {
          badgeTracker.trackAction('city_view', city.name);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [fetchUrl]);

  useEffect(() => {
    // Initial fetch
    let mounted = true;
    fetchCities().then(() => {
      if (!mounted) return;
    });
    
    // Set up interval for periodic updates
    const t = setInterval(() => {
      fetchCities();
    }, 5 * 60 * 1000);
    
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [fetchCities]);

  // Search for cities using Nominatim and fetch their AQI
  useEffect(() => {
    async function searchCities() {
      if (!searchQuery.trim()) {
        setSearchedCities([]);
        return;
      }

      setIsSearching(true);
      try {
        // Search for cities using Nominatim
        const searchResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&featuretype=city`
        );
        const searchResults = await searchResponse.json();

        // Fetch AQI for each result
        const citiesWithAQI = await Promise.all(
          searchResults.slice(0, 8).map(async (result) => {
            try {
              const aqiResponse = await fetch(
                `http://localhost:5000/api/aqi?lat=${result.lat}&lon=${result.lon}`
              );
              const aqiData = await aqiResponse.json();
              
              return {
                name: result.display_name.split(',')[0],
                aqi: aqiData.aqi,
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                updatedAt: Math.floor(Date.now() / 1000),
              };
            } catch (error) {
              console.error('Error fetching AQI for', result.display_name, error);
              return null;
            }
          })
        );

        const validCities = citiesWithAQI.filter(city => city !== null);
        setSearchedCities(validCities);
        
        // Track searched city views for badge progress
        validCities.forEach(city => {
          badgeTracker.trackAction('city_view', city.name);
        });
      } catch (error) {
        console.error('Error searching cities:', error);
      } finally {
        setIsSearching(false);
      }
    }

    const debounceTimer = setTimeout(searchCities, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Use searched cities if query exists, otherwise use default cities
  const displayCities = searchQuery.trim() ? searchedCities : cities;

  return (
    <div className="w-full">
      {isSearching ? (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Searching cities...
        </div>
      ) : displayCities.length === 0 && searchQuery ? (
        <div className="text-center py-8 text-gray-500">
          No cities found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {displayCities.map((city, i) => {
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
