export async function fetchAQI(lat, lon) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/aqi?lat=${lat}&lon=${lon}`
    );

    if (!response.ok) throw new Error("Failed to fetch AQI");

    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}
