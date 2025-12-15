// ./components/MapView.jsx
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useState, useEffect } from "react";
import { fetchAQI } from "../api/aqiService";
import { getAQIStatus } from "../utils/aqiLevels";
import L from "leaflet";
import axios from "axios";

// Custom marker icons for reports
const createReportIcon = (color) => {
  return L.divIcon({
    className: "custom-report-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function LocationMarker({ onSelect, mode }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      if (mode === "reports") {
        // For reports mode, just pass coordinates for location selection
        onSelect(lat, lng);
      } else {
        // For AQI mode, fetch AQI data
        try {
          const result = await fetchAQI(lat, lng);
          onSelect(lat, lng, result);
        } catch (err) {
          onSelect(lat, lng, { error: err.message });
        }
      }
    },
  });
  return null;
}

function MapController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [center, map]);
  
  return null;
}

export default function MapView({
  initialCenter = [33.6844, 73.0479],
  onSelect,
  reports = [],
  mode = "aqi", // "aqi" or "reports"
}) {
  const [location, setLocation] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    // if parent passes onSelect it will handle fetching; keep internal state for visual feedback
    // no-op
  }, []);

  // Parent-driven selection will call this onSelect handler (which we call only when map clicked)
  const handleSelect = async (lat, lon, data) => {
    setLocation([lat, lon]);
    setAqiData(data && data.aqi ? data : null);

    // If parent provided onSelect (Dashboard), call it so Dashboard can store details too
    if (typeof onSelect === "function") {
      onSelect(lat, lon, data);
    }
  };

  const mapColor = aqiData ? getAQIStatus(aqiData.aqi).mapColor : "#777";

  // Calculate marker color based on report age
  const getReportMarkerColor = (timestamp) => {
    const now = new Date();
    const reportDate = new Date(timestamp);
    const diffHours = (now - reportDate) / (1000 * 60 * 60);

    if (diffHours < 24) return "#22c55e"; // green - recent (< 1 day)
    if (diffHours < 72) return "#eab308"; // yellow - moderate (1-3 days)
    return "#9ca3af"; // gray - old (> 3 days)
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString();
  };

  // Search for location using Nominatim API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
      alert("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setMapCenter([lat, lon]);
    setSearchResults([]);
    setSearchQuery("");
    
    // Auto-select the location
    if (mode === "aqi") {
      try {
        const aqiResult = await fetchAQI(lat, lon);
        handleSelect(lat, lon, aqiResult);
      } catch (err) {
        handleSelect(lat, lon, { error: err.message });
      }
    } else {
      handleSelect(lat, lon);
    }
  };

  return (
    <div className="h-full w-full relative">
      {/* Search Bar - Outside map container */}
      <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
        <form onSubmit={handleSearch} className="relative pointer-events-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location..."
            className="w-full px-4 py-2 pr-10 rounded-lg shadow-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white/95 backdrop-blur-sm"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
          >
            {isSearching ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-gray-200 max-h-60 overflow-y-auto pointer-events-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-800">{result.display_name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="h-full rounded-xl overflow-hidden border">
        <MapContainer
          center={initialCenter}
          zoom={10}
          style={{ height: "100%", minHeight: 420 }}
        >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onSelect={handleSelect} mode={mode} />
        <MapController center={mapCenter} />

        {/* AQI Mode - Show selected location marker */}
        {mode === "aqi" && location && <Marker position={location} />}

        {mode === "aqi" && location && aqiData && (
          <CircleMarker
            center={location}
            radius={28}
            pathOptions={{
              color: mapColor,
              fillColor: mapColor,
              fillOpacity: 0.18,
              weight: 3,
            }}
          />
        )}

        {/* Reports Mode - Show report markers */}
        {mode === "reports" &&
          reports.map((report) => {
            const markerColor = getReportMarkerColor(report.timestamp);
            return (
              <Marker
                key={report.id}
                position={[report.lat, report.lon]}
                icon={createReportIcon(markerColor)}
              >
                <Popup maxWidth={300}>
                  <div className="p-2">
                    <p className="font-semibold text-gray-800 mb-2">
                      {report.description}
                    </p>
                    {report.photo_url && (
                      <img
                        src={report.photo_url}
                        alt="Report"
                        className="w-full h-32 object-cover rounded mb-2"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatTimestamp(report.timestamp)}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          {report.upvotes}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {report.downvotes}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
      </div>
    </div>
  );
}
