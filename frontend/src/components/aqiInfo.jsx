// ./components/aqiInfo.jsx
import { getAQIStatus } from "../utils/aqiLevels";

function SmallStat({ label, value, className = "", style }) {
  return (
    <div className={`flex flex-col items-start ${className}`} style={style}>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-base font-bold text-gray-800">{value}</div>
    </div>
  );
}

export default function AQIInfo({ data }) {
  const { aqi, components = {} } = data;
  const status = getAQIStatus(aqi);

  return (
    <div
      className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg flex flex-col gap-6 border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
      style={{ borderColor: status.color }}
    >
      {/* Circular gauge */}
      <div className="flex items-center justify-center">
        <div
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-300 hover:scale-110"
          style={{ 
            background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}dd 100%)`,
            boxShadow: `0 10px 30px ${status.color}40`
          }}
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold">{aqi}</div>
            <div className="text-xs sm:text-sm font-semibold mt-1 opacity-95">{status.label}</div>
          </div>
        </div>
      </div>

      {/* Pollutant grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {Object.entries(components).map(([key, value]) => (
          <div
            key={key}
            className="p-4 rounded-xl bg-white border-2 transition-all duration-300 hover:shadow-md hover:scale-105 hover:border-blue-300"
            style={{ borderColor: "#e2e8f0" }}
          >
            <div className="text-xs uppercase font-bold text-gray-600 tracking-wide mb-2">
              {key}
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-extrabold text-gray-800">{value}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">µg/m³</div>
          </div>
        ))}
      </div>

      {/* AQI Status & Advice */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <SmallStat label="AQI Status" value={status.label} />
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
          <SmallStat
            label="Alert Advice"
            value={status.advice || "Avoid prolonged outdoors"}
          />
        </div>
      </div>
    </div>
  );
}
