// ./components/MapView.jsx
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";
import { useState, useEffect } from "react";
import { fetchAQI } from "../api/aqiService";
import { getAQIStatus } from "../utils/aqiLevels";

function LocationMarker({ onSelect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const result = await fetchAQI(lat, lng);
        onSelect(lat, lng, result);
      } catch (err) {
        onSelect(lat, lng, { error: err.message });
      }
    },
  });
  return null;
}

export default function MapView({
  initialCenter = [33.6844, 73.0479],
  onSelect,
}) {
  const [location, setLocation] = useState(null);
  const [aqiData, setAqiData] = useState(null);

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

  return (
    <div className="h-full rounded-xl overflow-hidden border">
      <MapContainer
        center={initialCenter}
        zoom={10}
        style={{ height: "100%", minHeight: 420 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onSelect={handleSelect} />

        {location && <Marker position={location} />}

        {location && aqiData && (
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
      </MapContainer>
    </div>
  );
}
