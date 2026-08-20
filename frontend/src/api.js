const API_BASE = "http://localhost:3000/api";

async function fetchAPI(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);

    if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
    }

    return await response.json();
}

async function getWeather() {
    return await fetchAPI("/weather");
}

async function getEarthquakes() {
    return await fetchAPI("/earthquakes");
}