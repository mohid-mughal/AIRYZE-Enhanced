// ./utils/aqiLevels.js
export function getAQIStatus(aqi) {
  switch (aqi) {
    case 1:
      return {
        label: "Good",
        color: "#55A84F",
        mapColor: "green",
        advice: "Safe to go outside",
      };
    case 2:
      return {
        label: "Fair",
        color: "#A3C853",
        mapColor: "lightgreen",
        advice: "Low impact",
      };
    case 3:
      return {
        label: "Moderate",
        color: "#FFF833",
        mapColor: "yellow",
        advice: "Sensitive groups should take care",
      };
    case 4:
      return {
        label: "Poor",
        color: "#F29C33",
        mapColor: "orange",
        advice: "Reduce prolonged outdoor exertion",
      };
    case 5:
      return {
        label: "Very Poor",
        color: "#E93F33",
        mapColor: "red",
        advice: "Avoid outdoor exposure",
      };
    default:
      return { label: "Unknown", color: "#999", mapColor: "gray", advice: "" };
  }
}
