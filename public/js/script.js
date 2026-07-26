const form = document.getElementById('weather-form');
const input = document.getElementById('city');
const errorMessage = document.getElementById('error-message');
const weatherCard = document.getElementById('weather-card');
const mapContainer = document.getElementById('map-container');
const weatherCity = document.getElementById('weather-city');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const weatherTemperature = document.getElementById('weather-temperature');
const weatherWind = document.getElementById('weather-wind');
const weatherHumidity = document.getElementById('weather-humidity');
const updatedAt = document.getElementById('updated-at');
const refreshButton = document.getElementById('refresh-button');
const localTime = document.getElementById('local-time');

let activeLocation = '';
let refreshTimer = null;
let map = null;
let marker = null;

function updateLocalTime() {
  const now = new Date();
  localTime.textContent = now.toLocaleTimeString();
}

updateLocalTime();
setInterval(updateLocalTime, 1000);

function setLoading(isLoading) {
  const button = document.getElementById('search-button');
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Searching...' : 'Search';
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.toggle('visible', Boolean(message));
}

function hideWeatherCard() {
  weatherCard.classList.add('hidden');
  mapContainer.classList.add('hidden');
}

function initializeMap() {
  if (!map) {
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);
  }
}

function updateMapMarker(lat, lon) {
  if (!map) {
    initializeMap();
  }

  map.setView([lat, lon], 10);

  if (marker) {
    marker.setLatLng([lat, lon]);
  } else {
    const customIcon = L.divIcon({
      className: 'marker-icon',
      html: '📍',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
    marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
  }
}

function renderWeather(weather) {
  if (!weather) {
    hideWeatherCard();
    return;
  }

  weatherCity.textContent = weather.city;
  weatherDescription.textContent = weather.description;
  weatherIcon.textContent = weather.icon || '🌈';
  weatherTemperature.textContent = Math.round(weather.temperature);
  weatherWind.textContent = `Wind: ${weather.windSpeed} m/s`;

  if (weather.humidity != null) {
    weatherHumidity.textContent = `Humidity: ${weather.humidity}%`;
    weatherHumidity.classList.remove('hidden');
  } else {
    weatherHumidity.classList.add('hidden');
  }

  updatedAt.textContent = `Updated: ${new Date(weather.lastUpdated).toLocaleString()}`;
  weatherCard.classList.remove('hidden');
  mapContainer.classList.remove('hidden');

  const lat = parseFloat(weather.lat);
  const lon = parseFloat(weather.lon);
  if (!isNaN(lat) && !isNaN(lon)) {
    updateMapMarker(lat, lon);
  }
}

async function loadWeather(location, skipTimer = false) {
  if (!location) {
    showError('Please enter a city or coordinates to search.');
    return;
  }

  activeLocation = location;
  showError('');
  setLoading(true);

  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(location)}`);
    const data = await response.json();

    if (!response.ok) {
      renderWeather(null);
      showError(data.error || 'Unable to fetch weather. Please try again later.');
      return;
    }

    renderWeather(data.weather);

    if (!skipTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => loadWeather(location, true), 60000);
    }
  } catch (err) {
    renderWeather(null);
    showError('Unable to fetch weather. Please check your network connection.');
    console.error(err);
  } finally {
    setLoading(false);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await loadWeather(input.value.trim());
});

refreshButton.addEventListener('click', async () => {
  if (activeLocation) {
    await loadWeather(activeLocation, true);
  }
});
