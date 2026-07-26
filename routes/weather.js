const express = require('express');
const router = express.Router();

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const LAT_LON_RE = /^[-+]?\d+(?:\.\d+)?\s*,\s*[-+]?\d+(?:\.\d+)?$/;

const weatherCodeMap = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const weatherIconMap = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  56: '🌧️',
  57: '🌨️',
  61: '🌧️',
  63: '🌧️',
  65: '⛈️',
  66: '🌧️',
  67: '⛈️',
  71: '🌨️',
  73: '🌨️',
  75: '❄️',
  77: '🌨️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '❄️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

async function getWeatherData(query) {
  if (!query) {
    return { weather: null, error: 'Enter a city name or coordinates.' };
  }

  let lat;
  let lon;
  let placeName = query;
  let country = '';

  if (LAT_LON_RE.test(query)) {
    [lat, lon] = query.split(',').map((value) => parseFloat(value.trim()));

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return { weather: null, error: 'Coordinates must be valid numbers like 51.5072,-0.1276.' };
    }

    placeName = `Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`;
  } else {
    const geoRes = await fetch(`${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=1`);
    const geoData = await geoRes.json();

    if (!geoRes.ok || !geoData.results || geoData.results.length === 0) {
      return { weather: null, error: 'Location not found. Please check the city name or coordinates.' };
    }

    const place = geoData.results[0];
    lat = place.latitude;
    lon = place.longitude;
    placeName = place.name || query;
    country = place.country || '';
  }

  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto&temperature_unit=celsius&windspeed_unit=ms`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    return { weather: null, error: data.reason || 'Unable to retrieve weather.' };
  }

  const cw = data.current_weather;
  if (!cw) {
    return { weather: null, error: 'No current weather available.' };
  }

  const description = weatherCodeMap[cw.weathercode] || `Weather code ${cw.weathercode}`;
  const icon = weatherIconMap[cw.weathercode] || '🌈';

  return {
    weather: {
      city: placeName,
      country,
      description,
      icon,
      temperature: cw.temperature,
      humidity: null,
      windSpeed: cw.windspeed,
      lat: lat,
      lon: lon,
      lastUpdated: new Date().toISOString(),
    },
    error: null,
  };
}

router.get('/', async (req, res) => {
  const city = req.query.city?.trim();

  if (!city) {
    return res.render('index', { weather: null, error: null });
  }

  try {
    const result = await getWeatherData(city);
    res.render('index', { weather: result.weather, error: result.error });
  } catch (err) {
    console.error(err);
    const networkMessage =
      err?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT'
        ? 'Unable to reach the weather service. Check your internet connection, firewall, or proxy settings.'
        : 'Unable to fetch weather. Please check your internet connection or try again later.';
    res.render('index', { weather: null, error: networkMessage });
  }
});

router.get('/api/weather', async (req, res) => {
  const city = req.query.city?.trim();

  if (!city) {
    return res.status(400).json({ error: 'Provide a city name or coordinates in the query string.' });
  }

  try {
    const result = await getWeatherData(city);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ weather: result.weather });
  } catch (err) {
    console.error(err);
    const networkMessage =
      err?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT'
        ? 'Unable to reach the weather service. Check your internet connection, firewall, or proxy settings.'
        : 'Unable to fetch weather. Please check your internet connection or try again later.';
    res.status(500).json({ error: networkMessage });
  }
});

module.exports = router;
