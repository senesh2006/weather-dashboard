// Simple, dependency-free (except Leaflet for map) weather app for Sri Lanka.
// Sources: Open-Meteo Forecast / Geocoding / Air Quality / Marine APIs.
'use strict';

const API = {
  forecast: 'https://api.open-meteo.com/v1/forecast',
  geocoding: 'https://geocoding-api.open-meteo.com/v1/search',
  airQuality: 'https://air-quality-api.open-meteo.com/v1/air-quality',
  marine: 'https://marine-api.open-meteo.com/v1/marine',
};

// Accurate lat/lon for Sri Lankan towns (sourced from OpenStreetMap / GeoNames approximations)
const CITIES = [
  { name: 'Colombo',       lat: 6.9271,  lon: 79.8612,  region: 'Western' },
  { name: 'Negombo',       lat: 7.2086,  lon: 79.8358,  region: 'Western' },
  { name: 'Kandy',         lat: 7.2906,  lon: 80.6338,  region: 'Central' },
  { name: 'Galle',         lat: 6.0535,  lon: 80.2210,  region: 'Southern' },
  { name: 'Matara',        lat: 5.9544,  lon: 80.5550,  region: 'Southern' },
  { name: 'Hambantota',    lat: 6.1244,  lon: 81.1185,  region: 'Southern' },
  { name: 'Trincomalee',   lat: 8.5876,  lon: 81.2150,  region: 'Eastern' },
  { name: 'Batticaloa',    lat: 7.7106,  lon: 81.6924,  region: 'Eastern' },
  { name: 'Jaffna',        lat: 9.6615,  lon: 80.0255,  region: 'Northern' },
  { name: 'Anuradhapura',  lat: 8.3114,  lon: 80.4037,  region: 'North Central' },
  { name: 'Kurunegala',    lat: 7.4862,  lon: 80.5863,  region: 'North Western' },
  { name: 'Nuwara Eliya',  lat: 6.9580,  lon: 80.7605,  region: 'Central' },
  { name: 'Badulla',       lat: 6.9909,  lon: 81.0551,  region: 'Uva' },
  { name: 'Ratnapura',     lat: 6.6822,  lon: 80.4000,  region: 'Sabaragamuwa' },
  { name: 'Polonnaruwa',   lat: 7.9403,  lon: 81.0188,  region: 'North Central' },
  { name: 'Vavuniya',      lat: 8.7514,  lon: 80.4971,  region: 'Northern' },
  { name: 'Puttalam',      lat: 8.0606,  lon: 79.8153,  region: 'North Western' },
  { name: 'Monaragala',    lat: 6.7100,  lon: 81.3486,  region: 'Uva' },
  { name: 'Kegalle',       lat: 7.3297,  lon: 80.3461,  region: 'Sabaragamuwa' },
  { name: 'Kalutara',      lat: 6.5854,  lon: 79.9607,  region: 'Western' },
  { name: 'Chilaw',        lat: 7.5752,  lon: 79.7958,  region: 'North Western' },
  { name: 'Ampara',        lat: 6.2851,  lon: 81.6747,  region: 'Eastern' },
  { name: 'Mannar',        lat: 8.9810,  lon: 79.9050,  region: 'Northern' },
  { name: 'Dambulla',      lat: 7.8739,  lon: 80.6511,  region: 'Central' },
];

const $ = (id) => document.getElementById(id);
const els = {
  input: $('search-input'),
  results: $('search-results'),
  quick: $('quick-cities'),
  statusText: $('status-text'),
  updated: $('updated-at'),
  errorBanner: $('error-banner'),
  errorMessage: $('error-message'),
  city: $('current-city'),
  region: $('current-region'),
  date: $('current-date'),
  temp: $('current-temp'),
  condition: $('current-condition'),
  feels: $('current-feels'),
  icon: $('current-icon'),
  desc: $('current-desc'),
  hourlyChart: $('hourly-chart'),
  hourlyStrip: $('hourly-strip'),
  daily: $('daily-list'),
  overview: $('overview-cities'),
  citiesGrid: $('cities-grid'),
  favList: $('favourites-list'),
  favEmpty: $('favourites-empty'),
  aqiBadge: $('aqi-badge'),
  mapEl: $('leaflet-map'),
};

let state = {
  unit: localStorage.getItem('lk-weather-unit') || 'c', // c | f
  current: CITIES[0], // default Colombo
  forecast: null,
  airQuality: null,
  marine: null,
  favourites: JSON.parse(localStorage.getItem('lk-weather-favs') || '[]'),
  map: null,
  overviewData: {},
};

const isF = () => state.unit === 'f';
const tempUnit = () => (isF() ? 'fahrenheit' : 'celsius');
const toTemp = (c) => (isF() ? (c * 9) / 5 + 32 : c);
const fmtTemp = (c) => (c == null || Number.isNaN(c) ? '—' : `${Math.round(toTemp(c))}°${isF() ? 'F' : 'C'}`);
const fmtSpeed = (kmh) => {
  if (kmh == null) return '—';
  return isF() ? `${Math.round(kmh * 0.621371)} mph` : `${Math.round(kmh)} km/h`;
};

function setStatus(msg, updated) {
  els.statusText.textContent = msg;
  if (updated) els.updated.textContent = updated;
}
function showError(msg) {
  els.errorMessage.textContent = msg || 'Check your connection and try again.';
  els.errorBanner.hidden = false;
}
function hideError() { els.errorBanner.hidden = true; }

// WMO weather codes -> label + icon (WMO No. 4680)
function wmo(code) {
  const map = {
    0:  ['Clear sky', '☀️'],
    1:  ['Mostly clear', '🌤️'],
    2:  ['Partly cloudy', '⛅'],
    3:  ['Overcast', '☁️'],
    45: ['Fog', '🌫️'],
    48: ['Rime fog', '🌫️'],
    51: ['Light drizzle', '🌦️'],
    53: ['Drizzle', '🌦️'],
    55: ['Dense drizzle', '🌧️'],
    56: ['Freezing drizzle', '🌧️'],
    57: ['Freezing drizzle', '🌧️'],
    61: ['Light rain', '🌧️'],
    63: ['Rain', '🌧️'],
    65: ['Heavy rain', '⛈️'],
    66: ['Freezing rain', '🌧️'],
    67: ['Freezing rain', '🌧️'],
    71: ['Light snow', '🌨️'],
    73: ['Snow', '🌨️'],
    75: ['Heavy snow', '🌨️'],
    77: ['Snow grains', '🌨️'],
    80: ['Light showers', '🌦️'],
    81: ['Rain showers', '🌧️'],
    82: ['Violent showers', '⛈️'],
    85: ['Snow showers', '🌨️'],
    86: ['Snow showers', '🌨️'],
    95: ['Thunderstorm', '⛈️'],
    96: ['Thunderstorm with hail', '⛈️'],
    99: ['Thunderstorm with hail', '⛈️'],
  };
  return map[code] || ['Unknown', '🌡️'];
}

function dirLabel(deg) {
  if (deg == null) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function formatLocal(iso, opts = { hour: 'numeric', minute: '2-digit' }) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', ...opts });
  } catch { return iso; }
}

async function fetchJSON(url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function forecastUrl(place) {
  const p = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code,uv_index,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'Asia/Colombo',
    forecast_days: '7',
    temperature_unit: 'celsius', // keep API in C, convert client-side
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });
  return `${API.forecast}?${p.toString()}`;
}

function airQualityUrl(place) {
  const p = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: 'us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,dust',
    hourly: 'pm2_5,pm10',
    timezone: 'Asia/Colombo',
    forecast_days: '1',
  });
  return `${API.airQuality}?${p.toString()}`;
}

function marineUrl(place) {
  const p = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: 'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period',
    hourly: 'wave_height,swell_wave_height,sea_surface_temperature',
    timezone: 'Asia/Colombo',
    forecast_days: '1',
  });
  return `${API.marine}?${p.toString()}`;
}

async function loadWeather(place, { silent = false } = {}) {
  state.current = place;
  hideError();
  if (!silent) setStatus(`Loading weather for ${place.name}…`);
  els.city.textContent = place.name;
  els.region.textContent = place.region ? `· ${place.region} Province` : (place.admin1 ? `· ${place.admin1}` : '');
  document.title = `${place.name} Weather — Sri Lanka Weather Dashboard`;
  updateFavButton();
  markActiveChips();

  try {
    const [fc, aq, ma] = await Promise.allSettled([
      fetchJSON(forecastUrl(place)),
      fetchJSON(airQualityUrl(place)),
      fetchJSON(marineUrl(place)),
    ]);
    if (fc.status === 'rejected') throw fc.reason;
    state.forecast = fc.value;
    state.airQuality = aq.status === 'fulfilled' ? aq.value : null;
    state.marine = ma.status === 'fulfilled' ? ma.value : null;

    renderCurrent();
    renderHourly();
    renderDaily();
    renderAirQuality();
    renderMarine();
    renderOverview(); // refresh overview highlight

    const nowColombo = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' });
    setStatus(`Showing data for ${place.name} · Source: Open-Meteo`, `Updated ${nowColombo} (Asia/Colombo)`);
    localStorage.setItem('lk-weather-last-place', JSON.stringify(place));
  } catch (e) {
    console.error(e);
    setStatus(`Could not load ${place.name}.`);
    showError('Network or API error. Please check your connection and try again.');
  }
}

function renderCurrent() {
  const d = state.forecast;
  if (!d || !d.current) return;
  const c = d.current;
  const [label, icon] = wmo(c.weather_code);
  const isDay = c.is_day === 1;
  els.temp.textContent = fmtTemp(c.temperature_2m);
  els.condition.textContent = label;
  els.feels.textContent = `Feels like ${fmtTemp(c.apparent_temperature)} · ${isDay ? 'Daytime' : 'Night'}`;
  els.icon.textContent = isDay ? icon : (c.weather_code === 0 ? '🌙' : icon);
  els.date.textContent = new Date(c.time).toLocaleString('en-GB', { timeZone: 'Asia/Colombo', weekday: 'long', dateStyle: 'medium', timeStyle: 'short' }) + ' (Asia/Colombo)';

  // Daily today for sunrise/sunset/uv/precip
  const today = d.daily && d.daily.time ? 0 : -1;
  const sunrise = today >= 0 ? d.daily.sunrise[today] : null;
  const sunset = today >= 0 ? d.daily.sunset[today] : null;
  const uvMax = today >= 0 ? d.daily.uv_index_max[today] : null;

  // Hourly now for visibility/dew/rain chance (nearest hour)
  let dew = null, vis = null, rainChance = null;
  if (d.hourly && d.hourly.time) {
    const target = new Date(c.time).getTime();
    let best = 0, bestDiff = Infinity;
    d.hourly.time.forEach((t, i) => {
      const diff = Math.abs(new Date(t).getTime() - target);
      if (diff < bestDiff) { bestDiff = diff; best = i; }
    });
    rainChance = d.hourly.precipitation_probability ? d.hourly.precipitation_probability[best] : null;
  }

  $('m-humidity').textContent = c.relative_humidity_2m != null ? `${c.relative_humidity_2m}%` : '—';
  $('m-wind').textContent = c.wind_speed_10m != null ? `${fmtSpeed(c.wind_speed_10m)} ${dirLabel(c.wind_direction_10m)}` : '—';
  $('m-pressure').textContent = c.pressure_msl != null ? `${Math.round(c.pressure_msl)} hPa` : '—';
  $('m-uv').textContent = uvMax != null ? `${Math.round(uvMax)} (max today)` : '—';
  $('m-precip').textContent = c.precipitation != null ? `${c.precipitation} mm` : '—';
  $('m-visibility').textContent = vis != null ? `${(vis / 1000).toFixed(1)} km` : '—';
  $('m-sunrise').textContent = sunrise ? formatLocal(sunrise) : '—';
  $('m-sunset').textContent = sunset ? formatLocal(sunset) : '—';
  $('m-dew').textContent = dew != null ? fmtTemp(dew) : '—';
  $('m-cloud').textContent = c.cloud_cover != null ? `${c.cloud_cover}%` : '—';
  $('m-rain-chance').textContent = rainChance != null ? `${rainChance}%` : '—';
  $('m-gusts').textContent = c.wind_gusts_10m != null ? fmtSpeed(c.wind_gusts_10m) : '—';

  els.desc.textContent = describeCurrent(c, rainChance);
}

function describeCurrent(c, rainChance) {
  const bits = [];
  if (rainChance != null && rainChance >= 40) bits.push(`Rain chance ${rainChance}% today`);
  if (c.cloud_cover >= 80) bits.push('Cloudy skies');
  else if (c.cloud_cover <= 20) bits.push('Mostly clear skies');
  if (c.wind_speed_10m >= 35) bits.push('Windy conditions');
  if (c.relative_humidity_2m >= 85) bits.push('Very humid');
  if (!bits.length) return 'Conditions look settled. Check the hourly chart for the next 24 hours.';
  return bits.join('. ') + '.';
}

function renderHourly() {
  const h = state.forecast && state.forecast.hourly;
  els.hourlyStrip.innerHTML = '';
  if (!h || !h.time) return;

  // Next 24 hours from now (Asia/Colombo approximated by API times)
  const now = new Date();
  let startIdx = 0;
  for (let i = 0; i < h.time.length; i++) {
    if (new Date(h.time[i]) >= now) { startIdx = i; break; }
    startIdx = i;
  }
  const slice = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, h.time.length); i++) slice.push(i);

  // Chart
  drawHourlyChart(slice.map((i) => h.temperature_2m[i]), slice.map((i) => h.time[i]));

  // Strip
  slice.forEach((i) => {
    const [label, icon] = wmo(h.weather_code[i]);
    const div = document.createElement('div');
    div.className = 'hour-box';
    div.innerHTML = `
      <div class="muted small">${formatLocal(h.time[i])}</div>
      <div class="h-ico" title="${label}">${icon}</div>
      <div class="h-temp">${fmtTemp(h.temperature_2m[i])}</div>
      <div class="muted small">${h.precipitation_probability && h.precipitation_probability[i] != null ? `💧${h.precipitation_probability[i]}%` : ''}</div>
    `;
    els.hourlyStrip.appendChild(div);
  });
}

function drawHourlyChart(temps, times) {
  const canvas = els.hourlyChart;
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  const cssH = 140;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.height = cssH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);

  const vals = temps.map(toTemp);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = Math.max(2, (max - min) * 0.2);
  const lo = min - pad, hi = max + pad;
  const xStep = (cssW - 24) / Math.max(1, vals.length - 1);

  // Grid
  ctx.strokeStyle = '#e2e8f0';
  ctx.fillStyle = '#5b6b7d';
  ctx.font = '11px system-ui';
  for (let g = 0; g <= 2; g++) {
    const y = 10 + (cssH - 30) * (g / 2);
    ctx.beginPath(); ctx.moveTo(12, y); ctx.lineTo(cssW - 12, y); ctx.stroke();
  }
  ctx.fillText(`${Math.round(hi)}°`, 14, 14);
  ctx.fillText(`${Math.round(lo)}°`, 14, cssH - 12);

  // Line
  ctx.strokeStyle = '#0e6ea8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  vals.forEach((v, i) => {
    const x = 12 + i * xStep;
    const y = 10 + (cssH - 30) * (1 - (v - lo) / (hi - lo));
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots + labels every 4h
  ctx.fillStyle = '#0b3d5c';
  vals.forEach((v, i) => {
    const x = 12 + i * xStep;
    const y = 10 + (cssH - 30) * (1 - (v - lo) / (hi - lo));
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
    if (i % 4 === 0) {
      ctx.fillStyle = '#0f2436';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(`${Math.round(v)}°`, x - 8, y - 6);
      ctx.fillStyle = '#5b6b7d';
      ctx.font = '10px system-ui';
      ctx.fillText(formatLocal(times[i]), x - 16, cssH - 4);
    }
  });
}

function renderDaily() {
  const d = state.forecast && state.forecast.daily;
  els.daily.innerHTML = '';
  if (!d || !d.time) return;

  const allMax = d.temperature_2m_max.map(toTemp), allMin = d.temperature_2m_min.map(toTemp);
  const gmin = Math.min(...allMin), gmax = Math.max(...allMax);

  d.time.forEach((iso, i) => {
    const dt = new Date(iso);
    const [label, icon] = wmo(d.weather_code[i]);
    const isToday = i === 0;
    const dayName = isToday ? 'Today' : dt.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'Asia/Colombo' });
    const lo = toTemp(d.temperature_2m_min[i]), hi = toTemp(d.temperature_2m_max[i]);
    const left = ((lo - gmin) / Math.max(1, gmax - gmin)) * 100;
    const width = Math.max(6, ((hi - lo) / Math.max(1, gmax - gmin)) * 100);
    const row = document.createElement('div');
    row.className = 'day-row';
    row.innerHTML = `
      <div class="day-name">${dayName}<br><span class="muted small">${dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Colombo' })}</span></div>
      <div style="font-size:24px" title="${label}">${icon}</div>
      <div><div class="temp-bar"><span style="left:${left}%;width:${width}%"></span></div></div>
      <div class="range">${Math.round(lo)}° – ${Math.round(hi)}°<br><span class="muted small">${d.precipitation_probability_max && d.precipitation_probability_max[i] != null ? `💧${d.precipitation_probability_max[i]}%` : ''} ${d.precipitation_sum && d.precipitation_sum[i] ? `· ${d.precipitation_sum[i]}mm` : ''}</span></div>
    `;
    els.daily.appendChild(row);
  });
}

function renderAirQuality() {
  const aq = state.airQuality && state.airQuality.current;
  const us = aq ? aq.us_aqi : null;
  if (us == null) {
    $('aqi-us').textContent = '—';
    $('aqi-pm25').textContent = '—';
    $('aqi-pm10').textContent = '—';
    $('aqi-o3').textContent = '—';
    $('aqi-no2').textContent = '—';
    $('aqi-dust').textContent = '—';
    els.aqiBadge.textContent = 'No data';
    els.aqiBadge.style.background = '#64748b';
    return;
  }
  $('aqi-us').textContent = Math.round(us);
  $('aqi-pm25').textContent = aq.pm2_5 != null ? Math.round(aq.pm2_5) : '—';
  $('aqi-pm10').textContent = aq.pm10 != null ? Math.round(aq.pm10) : '—';
  $('aqi-o3').textContent = aq.ozone != null ? Math.round(aq.ozone) : '—';
  $('aqi-no2').textContent = aq.nitrogen_dioxide != null ? Math.round(aq.nitrogen_dioxide) : '—';
  $('aqi-dust').textContent = aq.dust != null ? Math.round(aq.dust) : '—';

  let label = 'Good', color = '#16a34a';
  if (us > 200) { label = 'Very unhealthy'; color = '#7e22ce'; }
  else if (us > 150) { label = 'Unhealthy'; color = '#dc2626'; }
  else if (us > 100) { label = 'Unhealthy for sensitive'; color = '#d97706'; }
  else if (us > 50) { label = 'Moderate'; color = '#ca8a04'; }
  els.aqiBadge.textContent = `${label} · ${Math.round(us)}`;
  els.aqiBadge.style.background = color;
}

function renderMarine() {
  const m = state.marine;
  if (!m || !m.current) {
    $('marine-wave').textContent = '—';
    $('marine-period').textContent = '—';
    $('marine-swell').textContent = '—';
    $('marine-sst').textContent = '—';
    return;
  }
  const c = m.current;
  $('marine-wave').textContent = c.wave_height != null ? `${c.wave_height.toFixed(2)} m` : '—';
  $('marine-period').textContent = c.wave_period != null ? `${c.wave_period.toFixed(1)} s` : '—';
  $('marine-swell').textContent = c.swell_wave_height != null ? `${c.swell_wave_height.toFixed(2)} m` : '—';
  let sst = null;
  if (m.hourly && m.hourly.sea_surface_temperature && m.hourly.time) {
    const now = new Date().getTime();
    let best = 0, bestDiff = Infinity;
    m.hourly.time.forEach((t, i) => { const d = Math.abs(new Date(t).getTime() - now); if (d < bestDiff) { bestDiff = d; best = i; } });
    sst = m.hourly.sea_surface_temperature[best];
  }
  $('marine-sst').textContent = sst != null ? fmtTemp(sst) : '—';
}

// ---- Navigation ----
function showView(name) {
  document.querySelectorAll('.view').forEach((v) => { v.hidden = true; v.classList.remove('is-active'); });
  const target = document.querySelector(`#view-${name}`);
  if (target) { target.hidden = false; target.classList.add('is-active'); }
  document.querySelectorAll('.nav-btn').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.nav === name);
    if (b.dataset.nav === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (name === 'map') initMap();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.nav-btn, [data-nav]').forEach((el) => {
  if (el.dataset.nav) el.addEventListener('click', (e) => { e.preventDefault(); showView(el.dataset.nav); });
});

// ---- Quick cities / chips ----
function renderQuickCities() {
  els.quick.innerHTML = '';
  CITIES.slice(0, 10).forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = c.name; b.dataset.name = c.name;
    b.addEventListener('click', () => { loadWeather({ ...c }); showView('dashboard'); });
    els.quick.appendChild(b);
  });
  markActiveChips();
}
function markActiveChips() {
  document.querySelectorAll('#quick-cities .chip').forEach((ch) => {
    ch.classList.toggle('is-active', ch.dataset.name === state.current.name);
  });
}

// ---- Cities grid + overview ----
function renderCitiesGrid() {
  els.citiesGrid.innerHTML = '';
  CITIES.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'city-card';
    const cached = state.overviewData[c.name];
    b.innerHTML = `<span class="name">${c.name}</span><div class="muted small">${c.region}</div><div class="temp">${cached ? fmtTemp(cached.temp) : '--°'}</div><div class="cond">${cached ? wmo(cached.code)[0] : 'Tap to load'}</div>`;
    b.addEventListener('click', () => { loadWeather({ ...c }); showView('dashboard'); });
    els.citiesGrid.appendChild(b);
  });
}

async function loadOverview() {
  // Fetch current temps for a subset to populate cards (best-effort)
  const subset = CITIES.slice(0, 16);
  els.overview.innerHTML = '';
  subset.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mini';
    b.innerHTML = `<strong>${c.name}</strong><span class="temp">--°</span><br><span class="muted small">loading…</span>`;
    b.addEventListener('click', () => { loadWeather({ ...c }); showView('dashboard'); });
    b.dataset.city = c.name;
    els.overview.appendChild(b);
  });

  // Batch with small concurrency to avoid hammering API
  async function one(place) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,weather_code&timezone=Asia%2FColombo&forecast_days=1`;
      const j = await fetchJSON(url);
      if (j.current) {
        state.overviewData[place.name] = { temp: j.current.temperature_2m, code: j.current.weather_code };
        const el = els.overview.querySelector(`[data-city="${place.name}"]`);
        if (el) {
          const [label, icon] = wmo(j.current.weather_code);
          el.innerHTML = `<strong>${place.name} ${icon}</strong><span class="temp">${fmtTemp(j.current.temperature_2m)}</span><br><span class="muted small">${label}</span>`;
        }
        // also patch cities grid card
        const cards = [...els.citiesGrid.children];
        const idx = CITIES.findIndex((x) => x.name === place.name);
        if (cards[idx]) {
          const [label] = wmo(j.current.weather_code);
          cards[idx].innerHTML = `<span class="name">${place.name}</span><div class="muted small">${place.region}</div><div class="temp">${fmtTemp(j.current.temperature_2m)}</div><div class="cond">${label}</div>`;
        }
      }
    } catch { /* ignore */ }
  }
  // sequential to be gentle
  for (const c of subset) await one(c);
}

function renderOverview() { /* highlight current in overview */ }

// ---- Favourites ----
function updateFavButton() {
  const btn = $('btn-favourite');
  const isFav = state.favourites.some((f) => f.name === state.current.name);
  btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
  btn.textContent = isFav ? '★ Favourited' : '☆ Favourite';
}
$('btn-favourite').addEventListener('click', () => {
  const idx = state.favourites.findIndex((f) => f.name === state.current.name);
  if (idx >= 0) state.favourites.splice(idx, 1);
  else state.favourites.push({ ...state.current });
  localStorage.setItem('lk-weather-favs', JSON.stringify(state.favourites));
  updateFavButton(); renderFavourites();
});
function renderFavourites() {
  els.favList.innerHTML = '';
  els.favEmpty.style.display = state.favourites.length ? 'none' : '';
  state.favourites.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'city-card';
    b.innerHTML = `<span class="name">★ ${c.name}</span><div class="muted small">${c.region || ''}</div>`;
    b.addEventListener('click', () => { loadWeather({ ...c }); showView('dashboard'); });
    els.favList.appendChild(b);
  });
}
$('btn-clear-favs').addEventListener('click', () => {
  state.favourites = [];
  localStorage.setItem('lk-weather-favs', '[]');
  renderFavourites(); updateFavButton();
});

// ---- Search (Open-Meteo Geocoding, Sri Lanka only) ----
let debounce = 0;
els.input.addEventListener('input', () => {
  clearTimeout(debounce);
  debounce = setTimeout(doSearch, 300);
});
els.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); const first = els.results.querySelector('li'); if (first) first.click(); }
  if (e.key === 'Escape') { els.results.hidden = true; }
});
document.addEventListener('click', (e) => { if (!e.target.closest('.search-form')) els.results.hidden = true; });

async function doSearch() {
  const q = els.input.value.trim();
  if (q.length < 2) { els.results.hidden = true; return; }
  try {
    const p = new URLSearchParams({ name: q, count: '10', language: 'en', format: 'json', countryCode: 'LK' });
    const j = await fetchJSON(`${API.geocoding}?${p.toString()}`);
    els.results.innerHTML = '';
    if (!j.results || !j.results.length) {
      els.results.innerHTML = `<li class="muted">No results for “${q}” in Sri Lanka. Try a major town (e.g. Colombo, Kandy, Galle).</li>`;
      els.results.hidden = false;
      return;
    }
    j.results.forEach((r) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.tabIndex = 0;
      li.innerHTML = `<strong>${r.name}</strong><br><span class="sub">${[r.admin1, r.country].filter(Boolean).join(' · ')} · ${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)}</span>`;
      const pick = () => {
        els.results.hidden = true;
        els.input.value = r.name;
        loadWeather({ name: r.name, lat: r.latitude, lon: r.longitude, region: r.admin1 || '', admin1: r.admin1 });
        showView('dashboard');
      };
      li.addEventListener('click', pick);
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      els.results.appendChild(li);
    });
    els.results.hidden = false;
  } catch {
    els.results.innerHTML = `<li class="muted">Search failed. Check connection.</li>`;
    els.results.hidden = false;
  }
}
$('search-form').addEventListener('submit', (e) => e.preventDefault());

// Geolocation
$('btn-locate').addEventListener('click', () => {
  if (!navigator.geolocation) { showError('Geolocation is not supported in this browser.'); return; }
  setStatus('Locating…');
  navigator.geolocation.getCurrentPosition(
    (pos) => loadWeather({ name: 'My location', lat: pos.coords.latitude, lon: pos.coords.longitude, region: 'Sri Lanka' }),
    () => { showError('Could not get your location. Allow location access or search a city.'); setStatus('Location unavailable.'); },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

// Refresh + retry
$('btn-refresh').addEventListener('click', () => loadWeather(state.current));
$('btn-retry').addEventListener('click', () => loadWeather(state.current));

// Unit toggle
function setUnit(u) {
  state.unit = u;
  localStorage.setItem('lk-weather-unit', u);
  $('btn-c').classList.toggle('is-active', u === 'c');
  $('btn-f').classList.toggle('is-active', u === 'f');
  if (state.forecast) { renderCurrent(); renderHourly(); renderDaily(); renderMarine(); renderCitiesGrid(); loadOverview(); }
}
$('btn-c').addEventListener('click', () => setUnit('c'));
$('btn-f').addEventListener('click', () => setUnit('f'));

// ---- Map (Leaflet) ----
function initMap() {
  if (state.map || !window.L) return;
  const center = [7.8731, 80.7711]; // Sri Lanka centre
  state.map = L.map('leaflet-map').setView(center, 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(state.map);

  CITIES.forEach((c) => {
    const m = L.marker([c.lat, c.lon]).addTo(state.map);
    m.bindPopup(`<strong>${c.name}</strong><br>${c.region}<br><button onclick="window.__lkSelect&&window.__lkSelect('${c.name}')">View weather</button>`);
    m.on('click', () => { loadWeather({ ...c }); });
  });
}
window.__lkSelect = (name) => { const c = CITIES.find((x) => x.name === name); if (c) { loadWeather({ ...c }); showView('dashboard'); } };

// ---- Init ----
(function init() {
  setUnit(state.unit);
  renderQuickCities();
  renderCitiesGrid();
  renderFavourites();

  let initial = CITIES[0];
  try {
    const last = JSON.parse(localStorage.getItem('lk-weather-last-place') || 'null');
    if (last && last.lat != null) initial = last;
  } catch {}

  loadWeather(initial).then(() => loadOverview());
  window.addEventListener('resize', () => { if (state.forecast) renderHourly(); });
})();
