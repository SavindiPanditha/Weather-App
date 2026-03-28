const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const submitBtn = document.getElementById('submitBtn');
const resultDiv = document.getElementById('weatherResult');

const unitButtons = Array.from(document.querySelectorAll('.seg[data-unit]'));

let activeController = null;
let activeUnit = 'metric';
let lastWeatherData = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setBusy(isBusy) {
  resultDiv.setAttribute('aria-busy', String(isBusy));
  cityInput.disabled = isBusy;
  submitBtn.disabled = isBusy;
}

function setActiveUnit(unit) {
  activeUnit = unit === 'imperial' ? 'imperial' : 'metric';
  for (const btn of unitButtons) {
    const pressed = btn.dataset.unit === activeUnit;
    btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }

  if (lastWeatherData) {
    renderWeather(lastWeatherData);
  }
}

function setWeatherThemeFromId(weatherId) {
  let theme = '';

  if (typeof weatherId === 'number') {
    if (weatherId >= 200 && weatherId < 300) theme = 'storm';
    else if (weatherId >= 300 && weatherId < 600) theme = 'rain';
    else if (weatherId >= 600 && weatherId < 700) theme = 'snow';
    else if (weatherId >= 700 && weatherId < 800) theme = 'fog';
    else if (weatherId === 800) theme = 'clear';
    else if (weatherId > 800 && weatherId < 900) theme = 'clouds';
  }

  if (theme) {
    document.body.dataset.weather = theme;
  } else {
    delete document.body.dataset.weather;
  }
}

function setTempThemeFromC(tempC) {
  const value = Number(tempC);
  if (!Number.isFinite(value)) {
    delete document.body.dataset.temp;
    return;
  }

  // Temperature bands in °C.
  // Adjusting these thresholds changes the overall feel of the UI.
  let band = 'mild';
  if (value <= 0) band = 'freezing';
  else if (value <= 10) band = 'cold';
  else if (value <= 18) band = 'cool';
  else if (value <= 26) band = 'mild';
  else if (value <= 32) band = 'warm';
  else band = 'hot';

  document.body.dataset.temp = band;
}

function setWxTheme(weather0) {
  const id = typeof weather0?.id === 'number' ? weather0.id : null;
  const main = String(weather0?.main ?? '').trim().toLowerCase();
  const desc = String(weather0?.description ?? '').trim().toLowerCase();

  let wx = '';

  // Prefer ID ranges (most reliable), then fall back to main/description.
  if (typeof id === 'number') {
    if (id >= 200 && id < 300) wx = 'thunderstorm';
    else if (id >= 300 && id < 400) wx = 'drizzle';
    else if (id >= 500 && id < 600) wx = 'rain';
    else if (id >= 600 && id < 700) wx = 'snow';
    else if (id >= 700 && id < 800) wx = 'mist';
    else if (id === 800) wx = 'clear';
    else if (id > 800 && id < 900) wx = 'clouds';
  }

  if (!wx) {
    if (main === 'thunderstorm' || desc.includes('thunder')) wx = 'thunderstorm';
    else if (main === 'drizzle') wx = 'drizzle';
    else if (main === 'rain' || desc.includes('rain') || desc.includes('shower')) wx = 'rain';
    else if (main === 'snow' || desc.includes('snow')) wx = 'snow';
    else if (main === 'clear') wx = 'clear';
    else if (main === 'clouds' || desc.includes('cloud')) wx = 'clouds';
    else if (main) wx = main;
  }

  if (wx) {
    document.body.dataset.wx = wx;
  } else {
    delete document.body.dataset.wx;
  }
}

function renderEmpty() {
  delete document.body.dataset.weather;
  delete document.body.dataset.temp;
  delete document.body.dataset.wx;
  resultDiv.innerHTML = `
    <div class="panel">
      <div class="empty">Search a city to see current conditions.</div>
    </div>
  `;
}

function renderLoading(city) {
  delete document.body.dataset.wx;
  resultDiv.innerHTML = `
    <div class="panel">
      <div class="status">
        <div class="spinner" aria-hidden="true"></div>
        <div><strong>Exploring weather</strong>${city ? ` for ${escapeHtml(city)}` : ''}…</div>
      </div>
    </div>
  `;
}

function renderError(message) {
  delete document.body.dataset.weather;
  delete document.body.dataset.temp;
  delete document.body.dataset.wx;
  resultDiv.innerHTML = `
    <div class="panel" role="alert">
      <div class="status">
        <div class="error">${escapeHtml(message)}</div>
        <div class="help">Try a different city name (or “City, CountryCode”).</div>
      </div>
    </div>
  `;
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
}

function renderWeather(data) {
  lastWeatherData = data;

  const tempC = Number(data?.main?.temp);
  const tempF = (tempC * 9 / 5 + 32);
  const feelsC = Number(data?.main?.feels_like);
  const feelsF = (feelsC * 9 / 5 + 32);
  const humidity = data?.main?.humidity;
  const windMs = Number(data?.wind?.speed);
  const windMph = windMs * 2.2369362920544;

  const weather0 = Array.isArray(data?.weather) ? data.weather[0] : null;
  const weatherId = typeof weather0?.id === 'number' ? weather0.id : null;
  const main = weather0?.main ?? 'Weather';
  const description = weather0?.description ?? '';
  const iconCode = weather0?.icon;
  const icon = iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : '';

  const place = data?.name ?? '—';
  const country = data?.sys?.country ?? '';
  const updated = formatTime(new Date());

  setWeatherThemeFromId(weatherId);
  setTempThemeFromC(tempC);
  setWxTheme(weather0);

  const showImperial = activeUnit === 'imperial';
  const displayTemp = showImperial ? tempF : tempC;
  const displayFeels = showImperial ? feelsF : feelsC;
  const secondaryTemp = showImperial ? tempC : tempF;
  const secondaryFeels = showImperial ? feelsC : feelsF;

  const tempUnit = showImperial ? '°F' : '°C';
  const secondaryUnit = showImperial ? '°C' : '°F';

  const displayWind = showImperial ? windMph : windMs;
  const windUnit = showImperial ? 'mph' : 'm/s';

  resultDiv.innerHTML = `
    <article class="panel">
      <div class="panel-header">
        ${icon ? `<img class="wx-icon" src="${icon}" alt="${escapeHtml(main)} icon">` : ''}
        <div class="place">
          <div class="place-name">${escapeHtml(place)}${country ? `, ${escapeHtml(country)}` : ''}</div>
          <div class="place-meta">Updated ${escapeHtml(updated)}</div>
        </div>
      </div>

      <div class="temp-row">
        <div class="temp">${Number.isFinite(displayTemp) ? `${displayTemp.toFixed(1)}${tempUnit}` : '—'}</div>
        <div class="cond">${escapeHtml(main)}${description ? ` • ${escapeHtml(description)}` : ''}</div>
        <div class="help">${Number.isFinite(secondaryTemp) ? `${secondaryTemp.toFixed(1)}${secondaryUnit}` : ''}${Number.isFinite(displayFeels) ? ` • Feels like ${displayFeels.toFixed(1)}${tempUnit}${Number.isFinite(secondaryFeels) ? ` (${secondaryFeels.toFixed(1)}${secondaryUnit})` : ''}` : ''}</div>
      </div>

      <div class="grid">
        <div class="tile">
          <span class="tile-k">Humidity</span>
          <span class="tile-v">${typeof humidity === 'number' ? `${humidity}%` : '—'}</span>
        </div>
        <div class="tile">
          <span class="tile-k">Wind</span>
          <span class="tile-v">${Number.isFinite(displayWind) ? `${displayWind.toFixed(1)} ${windUnit}` : '—'}</span>
        </div>
      </div>
    </article>
  `;
}

function normalizeCityInput(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return { ok: false, value: '', error: 'Enter a city name.' };
  if (value.length < 2) return { ok: false, value, error: 'City name looks too short.' };
  if (value.length > 80) return { ok: false, value, error: 'City name looks too long.' };

  const allowed = /^[\p{L}\p{M}0-9 .,'\-]+$/u;
  if (!allowed.test(value)) {
    return { ok: false, value, error: 'Use letters, numbers, spaces, commas, apostrophes, dots, or hyphens.' };
  }

  return { ok: true, value, error: '' };
}

function getApiKey() {
  const override = localStorage.getItem('OWM_API_KEY');
  return (override && override.trim()) ? override.trim() : '0f1afcb62708ad4df480ca8c35abc678';
}

async function fetchWeather(cityQuery, signal) {
  const apiKey = getApiKey();
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityQuery)}&appid=${encodeURIComponent(apiKey)}&units=metric`;
  const response = await fetch(url, { signal });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof data?.message === 'string' && data.message.trim() ? data.message : 'City not found';
    throw new Error(message);
  }

  return data;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const normalized = normalizeCityInput(cityInput.value);
  cityInput.setAttribute('aria-invalid', normalized.ok ? 'false' : 'true');
  if (!normalized.ok) {
    renderError(normalized.error);
    return;
  }

  if (activeController) {
    activeController.abort();
  }
  activeController = new AbortController();

  setBusy(true);
  renderLoading(normalized.value);

  try {
    const data = await fetchWeather(normalized.value, activeController.signal);
    renderWeather(data);
  } catch (err) {
    if (err && typeof err === 'object' && err.name === 'AbortError') {
      return;
    }
    renderError(err?.message ? String(err.message) : 'Something went wrong.');
  } finally {
    setBusy(false);
  }
});

for (const btn of unitButtons) {
  btn.addEventListener('click', () => {
    setActiveUnit(btn.dataset.unit);
  });
}

renderEmpty();

cityInput.addEventListener('input', () => {
  if (cityInput.getAttribute('aria-invalid') === 'true') {
    cityInput.setAttribute('aria-invalid', 'false');
  }
});

cityInput.focus();