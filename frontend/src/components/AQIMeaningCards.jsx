// ./components/AQIMeaningCards.jsx
import React from "react";
import { getAQIStatus } from "../utils/aqiLevels";

const LEVELS = [1, 2, 3, 4, 5];

export default function AQIMeaningCards() {
  return (
    <div className="w-full lg:w-96 backdrop-blur-md bg-white/90 rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
        AQI Index Levels
      </h3>

      <div className="space-y-3">
        {LEVELS.map((lvl, index) => {
          const status = getAQIStatus(lvl);
          return (
            <div
              key={lvl}
              className="flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default"
              style={{
                borderColor: `${status.color}60`,
                backgroundColor: `${status.color}15`,
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-transform duration-300 hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}dd 100%)`,
                    boxShadow: `0 4px 12px ${status.color}50`
                  }}
                >
                  {lvl}
                </div>

                <div className="flex-1">
                  <div className="text-sm sm:text-base font-bold text-gray-800 mb-1">{status.label}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{status.advice}</div>
                </div>
              </div>

              <div 
                className="text-lg opacity-60"
                style={{ color: status.color }}
              >
                ●
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
