// ./components/Recommendations.jsx
import { getAQIStatus } from "../utils/aqiLevels";

export default function Recommendations({ data }) {
  const { aqi = 0 } = data || {};
  const status = getAQIStatus(aqi) || {};
  console.log("AQI in Recommendations:", aqi);
  const tipsByLevel = {
    0: [
      "Be aware of your body's signals. Symptoms like coughing, burning eyes, or difficulty breathing are strong indicators that the air quality is poor.",
      "Consider wearing a mask if you experience any discomfort while outdoors.",
      "Stay hydrated and eat healthy.",
      "Avoid high-traffic areas.",
    ],
    1: [
      "Enjoy outdoor activities freely.",
      "Keep indoor spaces naturally ventilated.",
      "A great day for exercise and sports.",
    ],
    2: [
      "Sensitive groups should monitor symptoms.",
      "Light outdoor exercise is okay.",
      "Keep windows open for fresh air.",
    ],
    3: [
      "Limit extended outdoor activities.",
      "Use masks if you feel discomfort.",
      "Reduce exposure for children and elderly.",
    ],
    4: [
      "Avoid outdoor exercise as much as possible.",
      "Use N95 masks when stepping outside.",
      "Keep windows closed to reduce indoor pollution.",
      "Use air purifiers if available.",
    ],
    5: [
      "Stay indoors unless absolutely necessary.",
      "Use N95/KN95 masks outdoors.",
      "Keep all windows closed and seal openings.",
      "Avoid driving during peak smog hours.",
      "People with breathing issues should avoid going out completely.",
    ],
  };

  const tips = tipsByLevel[aqi] || tipsByLevel[0];

  return (
    <div
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 sm:p-8 shadow-xl min-h-[260px] border-2 transition-all duration-300 hover:shadow-2xl"
      style={{ borderColor: `${status.color || "#999"}40` }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="w-2 h-8 rounded-full"
          style={{ background: `linear-gradient(to bottom, ${status.color || "#999"}, ${status.color || "#999"}dd)` }}
        ></div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
          Preventive Tips for <span style={{ color: status.color || "#999" }}>{status.label || "Unknown"}</span> Air Quality
        </h3>
      </div>

      <ul className="space-y-3 sm:space-y-4">
        {tips.map((t, i) => (
          <li
            key={i}
            className="p-4 bg-white rounded-xl shadow-sm border-2 flex gap-4 items-start transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
            style={{
              borderLeft: `4px solid ${status.color || "#999"}`,
              borderColor: `${status.color || "#999"}30`,
              backgroundColor: `${status.color || "#999"}08`,
              animationDelay: `${i * 100}ms`
            }}
          >
            <div
              className="w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-sm"
              style={{ 
                backgroundColor: status.color || "#999999",
                boxShadow: `0 0 8px ${status.color || "#999"}60`
              }}
            />
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed flex-1">{t}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 italic">
        💡 Tips are based on AQI category and may vary by region.
      </div>
    </div>
  );
}
