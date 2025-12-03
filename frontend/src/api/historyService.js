import axios from "axios";

const API_BASE = "http://localhost:5000/api/history";

export async function getHistoryForCity(city) {
  const response = await axios.get(`${API_BASE}/city?city=${city}`);
  return response.data;
}

export async function getAllCitiesHistory() {
  const cities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Peshawar",
    "Quetta",
    "Faisalabad",
    "Multan",
  ];

  const allData = {};

  for (const city of cities) {
    allData[city] = await getHistoryForCity(city);
  }

  return allData;
}
