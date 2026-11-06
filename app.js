// ශ්‍රී ලංකා කාලගුණ උපකරණ පුවරුව
// දත්ත: Open-Meteo Forecast / Geocoding / Air Quality / Marine APIs
'use strict';

const API = {
  forecast: 'https://api.open-meteo.com/v1/forecast',
  geocoding: 'https://geocoding-api.open-meteo.com/v1/search',
  airQuality: 'https://air-quality-api.open-meteo.com/v1/air-quality',
  marine: 'https://marine-api.open-meteo.com/v1/marine',
};

// ප්‍රධාන නගර — ඛණ්ඩාංක Open-Meteo Geocoding / OpenStreetMap වෙතින්
const CITIES = [
  { name: 'Mullaitivu',   si: 'මුලතිව්',          lat: 9.2680,  lon: 80.8150,  region: 'Northern' },
  { name: 'Colombo',      si: 'කොළඹ',             lat: 6.9271,  lon: 79.8612,  region: 'Western' },
  { name: 'Negombo',      si: 'මීගමුව',           lat: 7.2086,  lon: 79.8358,  region: 'Western' },
  { name: 'Kandy',        si: 'මහනුවර',           lat: 7.2906,  lon: 80.6338,  region: 'Central' },
  { name: 'Galle',        si: 'ගාල්ල',            lat: 6.0535,  lon: 80.2210,  region: 'Southern' },
  { name: 'Matara',       si: 'මාතර',             lat: 5.9544,  lon: 80.5550,  region: 'Southern' },
  { name: 'Hambantota',   si: 'හම්බන්තොට',        lat: 6.1244,  lon: 81.1185,  region: 'Southern' },
  { name: 'Trincomalee',  si: 'ත්‍රිකුණාමලය',      lat: 8.5876,  lon: 81.2150,  region: 'Eastern' },
  { name: 'Batticaloa',   si: 'මඩකලපුව',          lat: 7.7106,  lon: 81.6924,  region: 'Eastern' },
  { name: 'Jaffna',       si: 'යාපනය',            lat: 9.6615,  lon: 80.0255,  region: 'Northern' },
  { name: 'Anuradhapura', si: 'අනුරාධපුරය',       lat: 8.3114,  lon: 80.4037,  region: 'North Central' },
  { name: 'Kurunegala',   si: 'කුරුණෑගල',         lat: 7.4862,  lon: 80.5863,  region: 'North Western' },
  { name: 'Nuwara Eliya', si: 'නුවරඑළිය',         lat: 6.9580,  lon: 80.7605,  region: 'Central' },
  { name: 'Badulla',      si: 'බදුල්ල',            lat: 6.9909,  lon: 81.0551,  region: 'Uva' },
  { name: 'Ratnapura',    si: 'රත්නපුර',           lat: 6.6822,  lon: 80.4000,  region: 'Sabaragamuwa' },
  { name: 'Polonnaruwa',  si: 'පොළොන්නරුව',        lat: 7.9403,  lon: 81.0188,  region: 'North Central' },
  { name: 'Vavuniya',     si: 'වවුනියාව',          lat: 8.7514,  lon: 80.4971,  region: 'Northern' },
  { name: 'Puttalam',     si: 'පුත්තලම',          lat: 8.0606,  lon: 79.8153,  region: 'North Western' },
  { name: 'Monaragala',   si: 'මොණරාගල',          lat: 6.7100,  lon: 81.3486,  region: 'Uva' },
  { name: 'Kegalle',      si: 'කෑගල්ල',           lat: 7.3297,  lon: 80.3461,  region: 'Sabaragamuwa' },
  { name: 'Kalutara',     si: 'කළුතර',             lat: 6.5854,  lon: 79.9607,  region: 'Western' },
  { name: 'Chilaw',       si: 'හලාවත',            lat: 7.5752,  lon: 79.7958,  region: 'North Western' },
  { name: 'Ampara',       si: 'අම්පාර',            lat: 6.2851,  lon: 81.6747,  region: 'Eastern' },
  { name: 'Mannar',       si: 'මන්නාරම',           lat: 8.9810,  lon: 79.9050,  region: 'Northern' },
  { name: 'Dambulla',     si: 'දඹුල්ල',           lat: 7.8739,  lon: 80.6511,  region: 'Central' },
];

const PROVINCE_SI = {
  Western: 'බස්නාහිර', Central: 'මධ්‍යම', Southern: 'දකුණු', Eastern: 'නැගෙනහිර',
  Northern: 'උතුරු', 'North Central': 'උතුරු මැද', 'North Western': 'වයඹ',
  Uva: 'ඌව', Sabaragamuwa: 'සබරගමුව',
};

const WEEKDAYS = ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'];
const WEEKDAYS_SHORT = ['ඉරිදා', 'සඳුදා', 'අඟහ', 'බදාදා', 'බ්‍රහස්', 'සිකු', 'සෙන'];
const MONTHS = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
const MONTHS_SHORT = ['ජන', 'පෙබ', 'මාර්', 'අප්‍රේ', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝ', 'සැප්', 'ඔක්', 'නොවැ', 'දෙසැ'];
const DIRS_SI = ['උ', 'ඊසා', 'නැ', 'ගිකො', 'ද', 'නි', 'බ', 'වය'];

const $ = (id) => document.getElementById(id);
const els = {
  input: $('search-input'),
  results: $('search-results'),
  quick: $('quick-cities'),
  statusText: $('status-text'),
  updated: $('updated-at'),
  errorBanner: $('error-banner'),
  errorMessage: $('error-message'),
  loadbar: $('loadbar'),
  cardLoading: $('current-loading'),
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
  seaBadge: $('sea-state-badge'),
  seaSummary: $('sea-summary-text'),
  seaArrow: $('current-arrow'),
  seaStrip: $('sea-strip'),
  seaNote: $('sea-note'),
  mapEl: $('leaflet-map'),
};

let state = {
  unit: localStorage.getItem('lk-weather-unit') || 'c',
  current: CITIES[0],            // සාමාන්‍යයෙන් මුලතිව්
  forecast: null,
  airQuality: null,
  marine: null,
  favourites: JSON.parse(localStorage.getItem('lk-weather-favs') || '[]'),
  map: null,
  overviewData: {},
};

/* ---------- helpers ---------- */
const pad = (n) => String(n).padStart(2, '0');
const isF = () => state.unit === 'f';
const toTemp = (c) => (isF() ? (c * 9) / 5 + 32 : c);
const fmtTemp = (c) => (c == null || Number.isNaN(c) ? '—' : `${Math.round(toTemp(c))}°${isF() ? 'F' : 'C'}`);
const fmtSpeed = (kmh) => (kmh == null ? '—' : isF() ? `${Math.round(kmh * 0.621371)} mph` : `${Math.round(kmh)} km/h`);

// API returns Asia/Colombo wall-clock strings WITHOUT an offset.
// Parse them as wall-clock so the displayed time never shifts by the viewer's timezone.
function isoParts(iso) {
  const [datePart, timePart = '00:00'] = String(iso).split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, hh, mm, dow };
}
const clockOf = (iso) => { const p = isoParts(iso); return `${pad(p.hh)}:${pad(p.mm)}`; };
const dateLine = (iso) => { const p = isoParts(iso); return `${WEEKDAYS[p.dow]}, ${p.d} ${MONTHS[p.m - 1]} ${p.y}`; };
const dayMonth = (iso) => { const p = isoParts(iso); return `${WEEKDAYS[p.dow]}, ${p.d} ${MONTHS[p.m - 1]}`; };
const shortDate = (iso) => { const p = isoParts(iso); return `${p.d} ${MONTHS[p.m - 1]}`; };
const hourKey = (iso) => String(iso).slice(0, 13);

const COLOMBO_OFFSET_MIN = 330; // UTC+5:30
function colomboNow() {
  const t = new Date(Date.now() + COLOMBO_OFFSET_MIN * 60000);
  const y = t.getUTCFullYear(), m = t.getUTCMonth() + 1, d = t.getUTCDate();
  const hh = t.getUTCHours(), mm = t.getUTCMinutes();
  return {
    key: `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}`,
    hour: `${y}-${pad(m)}-${pad(d)}T${pad(hh)}`,
    stamp: `${pad(hh)}:${pad(mm)} · ${d} ${MONTHS_SHORT[m - 1]}`,
    dow: t.getUTCDay(), y, m, d,
  };
}

const nameOf = (p) => (p && (p.si || p.name)) || '';
function provinceLabel(p) {
  const raw = (p && (p.region || p.admin1)) || '';
  if (/^sri lanka$/i.test(raw)) return 'ශ්‍රී ලංකාව';
  const key = raw.replace(/ Province$/, '');
  const si = PROVINCE_SI[key] || PROVINCE_SI[raw];
  return si ? `${si} පළාත` : raw;
}
function sinhalizeName(name) {
  const hit = CITIES.find((c) => c.name.toLowerCase() === String(name).toLowerCase());
  if (hit) return hit.si;
  if (/^mullaittivu$/i.test(name)) return 'මුලතිව්';
  return '';
}

function setStatus(msg, updated) {
  els.statusText.textContent = msg;
  if (updated !== undefined) els.updated.textContent = updated;
}
function showError(msg) {
  els.errorMessage.textContent = msg || 'සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.';
  els.errorBanner.hidden = false;
}
function hideError() { els.errorBanner.hidden = true; }

function setLoading(on) {
  if (els.loadbar) els.loadbar.hidden = !on;
  if (els.cardLoading) els.cardLoading.hidden = !on;
  document.body.classList.toggle('is-loading', on);
  const btn = $('btn-refresh');
  if (btn) btn.disabled = on;
}

/* ---------- weather codes (WMO) ---------- */
function wmo(code) {
  const map = {
    0:  ['පැහැදිලි අහස', '☀️'],
    1:  ['බොහෝ දුරට පැහැදිලි', '🌤️'],
    2:  ['අඩ වළාකුළු', '⛅'],
    3:  ['වළාකුළු පිරි', '☁️'],
    45: ['මීදුම', '🌫️'],
    48: ['මීදුම', '🌫️'],
    51: ['සැහැල්ලු ඉහිරෙන වැසි', '🌦️'],
    53: ['ඉහිරෙන වැසි', '🌦️'],
    55: ['තද ඉහිරෙන වැසි', '🌧️'],
    56: ['හිම මිශ්‍ර ඉහිරෙන වැසි', '🌧️'],
    57: ['හිම මිශ්‍ර ඉහිරෙන වැසි', '🌧️'],
    61: ['සැහැල්ලු වැසි', '🌧️'],
    63: ['වැසි', '🌧️'],
    65: ['තද වැසි', '⛈️'],
    66: ['හිම මිශ්‍ර වැසි', '🌧️'],
    67: ['හිම මිශ්‍ර වැසි', '🌧️'],
    71: ['සැහැල්ලු හිම', '🌨️'],
    73: ['හිම', '🌨️'],
    75: ['තද හිම', '🌨️'],
    77: ['හිම කැටි', '🌨️'],
    80: ['සැහැල්ලු වැසි වැටීම්', '🌦️'],
    81: ['වැසි වැටීම්', '🌧️'],
    82: ['දැඩි වැසි වැටීම්', '⛈️'],
    85: ['හිම වැටීම්', '🌨️'],
    86: ['හිම වැටීම්', '🌨️'],
    95: ['ගිගුරුම් සහිත වැසි', '⛈️'],
    96: ['ගිගුරුම් සහිත වැසි සහ අලිමංකඩ', '⛈️'],
    99: ['ගිගුරුම් සහිත වැසි සහ අලිමංකඩ', '⛈️'],
  };
  return map[code] || ['නොදනී', '🌡️'];
}

function dirLabel(deg) {
  if (deg == null) return '';
  return DIRS_SI[Math.round(deg / 45) % 8];
}

async function fetchJSON(url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/* ---------- API URLs ---------- */
function forecastUrl(place) {
  const p = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code,uv_index,wind_speed_10m,dew_point_2m,visibility',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'Asia/Colombo',
    forecast_days: '7',
    temperature_unit: 'celsius',
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
function marineUrl(place, cellSelection) {
  const p = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: [
      'wave_height', 'wave_direction', 'wave_period',
      'wind_wave_height', 'wind_wave_direction',
      'swell_wave_height', 'swell_wave_direction', 'swell_wave_period',
      'sea_surface_temperature',
      'ocean_current_velocity', 'ocean_current_direction',
      'sea_level_height_msl',
    ].join(','),
    hourly: 'wave_height,ocean_current_velocity,ocean_current_direction,sea_level_height_msl,sea_surface_temperature',
    timezone: 'Asia/Colombo',
    forecast_days: '2',
  });
  // "sea" prefers an actual sea grid cell (better near the coast), but returns
  // nulls far inland — fetchMarine() falls back to the nearest cell.
  if (cellSelection) p.set('cell_selection', cellSelection);
  return `${API.marine}?${p.toString()}`;
}

// Coastal reference points (~40 km apart around the island). Used only when a
// city is far enough inland that the marine model returns no data: we then show
// conditions for the nearest coast, clearly labelled as such.
const COAST_POINTS = [
  { si: 'මාන්නාරම', lat: 8.98, lon: 79.90 },
  { si: 'තලෙයිමන්නාරම', lat: 9.10, lon: 79.73 },
  { si: 'පුත්තලම', lat: 8.03, lon: 79.83 },
  { si: 'හලාවත', lat: 7.58, lon: 79.79 },
  { si: 'මීගමුව', lat: 7.21, lon: 79.83 },
  { si: 'කොළඹ', lat: 6.93, lon: 79.84 },
  { si: 'මවුන්ට් ලැවිනියා', lat: 6.83, lon: 79.86 },
  { si: 'පානදුර', lat: 6.71, lon: 79.90 },
  { si: 'කළුතර', lat: 6.58, lon: 79.96 },
  { si: 'බෙන්තොට', lat: 6.42, lon: 79.99 },
  { si: 'අම්බලන්ගොඩ', lat: 6.24, lon: 80.05 },
  { si: 'හික්කඩුව', lat: 6.14, lon: 80.10 },
  { si: 'ගාල්ල', lat: 6.03, lon: 80.22 },
  { si: 'මාතර', lat: 5.95, lon: 80.55 },
  { si: 'හම්බන්තොට', lat: 6.12, lon: 81.12 },
  { si: 'කිරින්ද', lat: 6.21, lon: 81.28 },
  { si: 'යාල', lat: 6.37, lon: 81.45 },
  { si: 'පානම', lat: 6.75, lon: 81.80 },
  { si: 'අරුගම් බොක්ක', lat: 6.84, lon: 81.83 },
  { si: 'මඩකලපුව', lat: 7.71, lon: 81.70 },
  { si: 'ත්‍රිකුණාමලය', lat: 8.58, lon: 81.23 },
  { si: 'පුල්මොඩ්ඩෙයි', lat: 8.95, lon: 81.00 },
  { si: 'මුලතිව්', lat: 9.27, lon: 80.81 },
  { si: 'පේදුරු තුඩුව', lat: 9.82, lon: 80.23 },
  { si: 'යාපනය', lat: 9.66, lon: 80.01 },
  { si: 'ඩෙල්ෆ්ට්', lat: 9.51, lon: 79.69 },
];

function haversineKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function nearestCoast(place) {
  let best = null;
  for (const p of COAST_POINTS) {
    const d = haversineKm(place, p);
    if (!best || d < best.distanceKm) best = { ...p, distanceKm: d };
  }
  return best;
}

const hasMarineValues = (m) =>
  !!(m && m.current && ['wave_height', 'ocean_current_velocity', 'sea_surface_temperature']
    .some((k) => typeof m.current[k] === 'number'));

// Currents/tides come from MeteoFrance SMOC via Copernicus Marine (0.08° grid).
// Near a coast we ask for a sea cell; inland we retry, then fall back to the
// nearest coastal reference point so the card is never just empty dashes.
async function fetchMarine(place) {
  try {
    const sea = await fetchJSON(marineUrl(place, 'sea'));
    if (hasMarineValues(sea)) return sea;

    const nearest = await fetchJSON(marineUrl(place));
    if (hasMarineValues(nearest)) { nearest._inlandFallback = true; return nearest; }

    const coast = nearestCoast(place);
    const atCoast = await fetchJSON(marineUrl({ lat: coast.lat, lon: coast.lon }, 'sea'));
    if (hasMarineValues(atCoast)) {
      atCoast._nearestCoast = { si: coast.si, distanceKm: coast.distanceKm };
      return atCoast;
    }
    return nearest;
  } catch {
    return fetchJSON(marineUrl(place));
  }
}

/* ---------- load ---------- */
async function loadWeather(place, { silent = false } = {}) {
  state.current = place;
  hideError();
  const started = Date.now();
  if (!silent) {
    setLoading(true);
    setStatus('කාලගුණය පූරණය වෙමින්…', '');
  }
  els.city.textContent = nameOf(place);
  els.region.textContent = place.region || place.admin1 ? `· ${provinceLabel(place)}` : '';
  document.title = `${nameOf(place)} කාලගුණය — SSS Sea Food Suppliers`;
  updateFavButton();
  markActiveChips();

  try {
    const [fc, aq, ma] = await Promise.allSettled([
      fetchJSON(forecastUrl(place)),
      fetchJSON(airQualityUrl(place)),
      fetchMarine(place),
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

    const now = colomboNow();
    setStatus(`${nameOf(place)} · දත්ත: Open-Meteo`, `යාවත්කාලීන: ${now.stamp}`);
    localStorage.setItem('lk-weather-last-place', JSON.stringify(place));
  } catch (e) {
    console.error(e);
    setStatus(`${nameOf(place)} සඳහා දත්ත ලබාගත නොහැක.`);
    showError('ජාල දෝෂයකි. අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.');
  } finally {
    if (!silent) {
      const wait = 320 - (Date.now() - started);
      if (wait > 0) await new Promise((res) => setTimeout(res, wait));
      setLoading(false);
    }
  }
}

/* ---------- render: current ---------- */
function renderCurrent() {
  const d = state.forecast;
  if (!d || !d.current) return;
  const c = d.current;
  const [label, icon] = wmo(c.weather_code);
  const isDay = c.is_day === 1;
  els.temp.textContent = fmtTemp(c.temperature_2m);
  els.condition.textContent = label;
  els.feels.textContent = `දැනෙන උෂ්ණත්වය ${fmtTemp(c.apparent_temperature)} · ${isDay ? 'දිවා කාලය' : 'රාත්‍රිය'}`;
  els.icon.textContent = isDay ? icon : (c.weather_code === 0 ? '🌙' : icon);
  els.date.textContent = `${dayMonth(c.time)} · ${clockOf(c.time)} (ශ්‍රී ලංකා වේලාවෙන්)`;

  const today = d.daily && d.daily.time ? 0 : -1;
  const sunrise = today >= 0 ? d.daily.sunrise[today] : null;
  const sunset = today >= 0 ? d.daily.sunset[today] : null;
  const uvMax = today >= 0 ? d.daily.uv_index_max[today] : null;

  let dew = null, vis = null, rainChance = null;
  if (d.hourly && d.hourly.time) {
    const key = hourKey(c.time);
    let best = d.hourly.time.findIndex((t) => hourKey(t) === key);
    if (best < 0) best = d.hourly.time.findIndex((t) => t >= c.time);
    if (best < 0) best = d.hourly.time.length - 1;
    rainChance = d.hourly.precipitation_probability ? d.hourly.precipitation_probability[best] : null;
    dew = d.hourly.dew_point_2m ? d.hourly.dew_point_2m[best] : null;
    vis = d.hourly.visibility ? d.hourly.visibility[best] : null;
  }

  $('m-humidity').textContent = c.relative_humidity_2m != null ? `${c.relative_humidity_2m}%` : '—';
  $('m-wind').textContent = c.wind_speed_10m != null ? `${fmtSpeed(c.wind_speed_10m)} ${dirLabel(c.wind_direction_10m)}` : '—';
  $('m-pressure').textContent = c.pressure_msl != null ? `${Math.round(c.pressure_msl)} hPa` : '—';
  $('m-uv').textContent = uvMax != null ? `${Math.round(uvMax)} (අද උපරිම)` : '—';
  $('m-precip').textContent = c.precipitation != null ? `${c.precipitation} mm` : '—';
  $('m-visibility').textContent = vis != null ? `${(vis / 1000).toFixed(1)} km` : '—';
  $('m-sunrise').textContent = sunrise ? clockOf(sunrise) : '—';
  $('m-sunset').textContent = sunset ? clockOf(sunset) : '—';
  $('m-dew').textContent = dew != null ? fmtTemp(dew) : '—';
  $('m-cloud').textContent = c.cloud_cover != null ? `${c.cloud_cover}%` : '—';
  $('m-rain-chance').textContent = rainChance != null ? `${rainChance}%` : '—';
  $('m-gusts').textContent = c.wind_gusts_10m != null ? fmtSpeed(c.wind_gusts_10m) : '—';

  els.desc.textContent = describeCurrent(c, rainChance);
}

function describeCurrent(c, rainChance) {
  const bits = [];
  if (rainChance != null && rainChance >= 40) bits.push(`අද වැසි සම්භාවිතාව ${rainChance}%`);
  if (c.cloud_cover >= 80) bits.push('වළාකුළු සහිත අහස');
  else if (c.cloud_cover <= 20) bits.push('බොහෝ දුරට පැහැදිලි අහස');
  if (c.wind_speed_10m >= 35) bits.push('සුළං සහිත තත්ත්වය');
  if (c.relative_humidity_2m >= 85) bits.push('ඉතා ආර්ද්‍රතාවය');
  if (!bits.length) return 'තත්ත්වය සාමාන්‍යයි. ඉදිරි පැය 24 සඳහා පැයක ප්‍රස්තාරය බලන්න.';
  return bits.join('. ') + '.';
}

/* ---------- render: hourly ---------- */
function renderHourly() {
  const h = state.forecast && state.forecast.hourly;
  els.hourlyStrip.innerHTML = '';
  if (!h || !h.time) return;

  const now = colomboNow();
  let startIdx = h.time.findIndex((t) => t >= now.key);
  if (startIdx < 0) startIdx = 0;

  const slice = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, h.time.length); i++) slice.push(i);

  drawHourlyChart(slice.map((i) => h.temperature_2m[i]), slice.map((i) => h.time[i]));

  slice.forEach((i, n) => {
    const [label, icon] = wmo(h.weather_code[i]);
    const isNow = n === 0 && hourKey(h.time[i]) === now.hour;
    const div = document.createElement('div');
    div.className = 'hour-box';
    div.innerHTML = `
      <div class="muted small">${isNow ? 'දැන්' : clockOf(h.time[i])}</div>
      <div class="h-ico" title="${label}">${icon}</div>
      <div class="h-temp">${fmtTemp(h.temperature_2m[i])}</div>
      <div class="muted small">${h.precipitation_probability && h.precipitation_probability[i] != null ? `💧${h.precipitation_probability[i]}%` : ''}</div>
    `;
    els.hourlyStrip.appendChild(div);
  });
}

function drawHourlyChart(temps, times) {
  const canvas = els.hourlyChart;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  const cssH = 180;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.height = cssH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);

  const vals = temps.map(toTemp);
  if (!vals.length) return;
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = Math.max(1, max - min);
  const padY = Math.max(1.5, range * 0.25);
  const lo = min - padY, hi = max + padY;

  const padLeft = 40, padRight = 14, padTop = 22, padBottom = 30;
  const plotW = Math.max(100, cssW - padLeft - padRight);
  const plotH = cssH - padTop - padBottom;
  const xStep = plotW / Math.max(1, vals.length - 1);
  const xFor = (i) => padLeft + i * xStep;
  const yFor = (v) => padTop + plotH * (1 - (v - lo) / (hi - lo));

  ctx.strokeStyle = '#e2e8f0';
  ctx.fillStyle = '#5b6b7d';
  ctx.font = '11px "Noto Sans Sinhala", system-ui';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let g = 0; g <= 2; g++) {
    const y = padTop + plotH * (g / 2);
    const t = hi - (hi - lo) * (g / 2);
    ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + plotW, y); ctx.stroke();
    ctx.fillText(`${Math.round(t)}°`, padLeft - 8, y);
  }

  ctx.strokeStyle = '#0e6ea8';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  vals.forEach((v, i) => {
    const x = xFor(i), y = yFor(v);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  const labelEvery = cssW < 480 ? 6 : 3;
  vals.forEach((v, i) => {
    const x = xFor(i), y = yFor(v);
    ctx.fillStyle = '#0b3d5c';
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    if (i % labelEvery === 0 || i === vals.length - 1) {
      const cx = Math.min(Math.max(x, padLeft + 16), padLeft + plotW - 16);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f2436';
      ctx.font = 'bold 11px "Noto Sans Sinhala", system-ui';
      ctx.fillText(`${Math.round(v)}°`, cx, Math.max(11, y - 10));
      ctx.fillStyle = '#5b6b7d';
      ctx.font = '11px "Noto Sans Sinhala", system-ui';
      ctx.fillText(clockOf(times[i]), cx, cssH - 10);
    }
  });
  ctx.textAlign = 'left';
}

/* ---------- render: daily ---------- */
function renderDaily() {
  const d = state.forecast && state.forecast.daily;
  els.daily.innerHTML = '';
  if (!d || !d.time) return;

  const allMax = d.temperature_2m_max.map(toTemp), allMin = d.temperature_2m_min.map(toTemp);
  const gmin = Math.min(...allMin), gmax = Math.max(...allMax);

  d.time.forEach((iso, i) => {
    const p = isoParts(iso);
    const [label, icon] = wmo(d.weather_code[i]);
    const dayName = i === 0 ? 'අද' : WEEKDAYS_SHORT[p.dow];
    const lo = toTemp(d.temperature_2m_min[i]), hi = toTemp(d.temperature_2m_max[i]);
    const left = ((lo - gmin) / Math.max(1, gmax - gmin)) * 100;
    const width = Math.max(6, ((hi - lo) / Math.max(1, gmax - gmin)) * 100);
    const row = document.createElement('div');
    row.className = 'day-row';
    row.innerHTML = `
      <div class="day-name">${dayName}<br><span class="muted small">${shortDate(iso)}</span></div>
      <div style="font-size:24px" title="${label}">${icon}</div>
      <div><div class="temp-bar"><span style="left:${left}%;width:${width}%"></span></div></div>
      <div class="range">${Math.round(lo)}° – ${Math.round(hi)}°<br><span class="muted small">${d.precipitation_probability_max && d.precipitation_probability_max[i] != null ? `💧${d.precipitation_probability_max[i]}%` : ''} ${d.precipitation_sum && d.precipitation_sum[i] ? `· ${d.precipitation_sum[i]}mm` : ''}</span></div>
    `;
    els.daily.appendChild(row);
  });
}

/* ---------- render: air quality ---------- */
function renderAirQuality() {
  const aq = state.airQuality && state.airQuality.current;
  const us = aq ? aq.us_aqi : null;
  if (us == null) {
    ['aqi-us', 'aqi-pm25', 'aqi-pm10', 'aqi-o3', 'aqi-no2', 'aqi-dust'].forEach((id) => { $(id).textContent = '—'; });
    els.aqiBadge.textContent = 'දත්ත නැත';
    els.aqiBadge.style.background = '#64748b';
    return;
  }
  $('aqi-us').textContent = Math.round(us);
  $('aqi-pm25').textContent = aq.pm2_5 != null ? Math.round(aq.pm2_5) : '—';
  $('aqi-pm10').textContent = aq.pm10 != null ? Math.round(aq.pm10) : '—';
  $('aqi-o3').textContent = aq.ozone != null ? Math.round(aq.ozone) : '—';
  $('aqi-no2').textContent = aq.nitrogen_dioxide != null ? Math.round(aq.nitrogen_dioxide) : '—';
  $('aqi-dust').textContent = aq.dust != null ? Math.round(aq.dust) : '—';

  let label = 'හොඳයි', color = '#16a34a';
  if (us > 200) { label = 'ඉතා අහිතකර'; color = '#7e22ce'; }
  else if (us > 150) { label = 'අහිතකර'; color = '#dc2626'; }
  else if (us > 100) { label = 'සංවේදීන්ට අහිතකර'; color = '#d97706'; }
  else if (us > 50) { label = 'මධ්‍යම'; color = '#ca8a04'; }
  els.aqiBadge.textContent = `${label} · ${Math.round(us)}`;
  els.aqiBadge.style.background = color;
}

/* ---------- render: marine / sea ---------- */
function compassSi(deg) {
  if (deg == null) return null;
  return ['උතුර', 'ඊසාන', 'නැගෙනහිර', 'ගිනිකොණ', 'දකුණ', 'නිරිත', 'බටහිර', 'වයඹ'][Math.round(deg / 45) % 8];
}
const waveFromText = (deg) => (deg == null ? '—' : `${compassSi(deg)} සිට`);
const currentToText = (deg) => (deg == null ? '—' : `${compassSi(deg)} දෙසට`);

// Douglas sea scale, condensed for a simple badge
function seaState(h) {
  if (h == null) return { label: 'දත්ත නැත', color: '#64748b' };
  if (h < 0.5) return { label: 'සන්සුන්', color: '#16a34a' };
  if (h < 1.25) return { label: 'මධ්‍යස්ථ', color: '#65a30d' };
  if (h < 2.5) return { label: 'තරමක් රළු', color: '#ca8a04' };
  if (h < 4) return { label: 'රළු', color: '#d97706' };
  return { label: 'ඉතා රළු', color: '#dc2626' };
}

function renderMarine() {
  const m = state.marine;
  const c = m && m.current;
  const ids = ['marine-wave', 'marine-wave-dir', 'marine-period', 'marine-current-dir',
    'marine-sealevel', 'marine-sst', 'marine-windwave', 'marine-swell', 'marine-swell-dir'];

  if (!hasMarineValues(m)) {
    ids.forEach((id) => { const el = $(id); if (el) el.textContent = '—'; });
    if (els.seaBadge) { els.seaBadge.textContent = 'දත්ත නැත'; els.seaBadge.style.background = '#64748b'; }
    if (els.seaArrow) els.seaArrow.style.transform = 'rotate(0deg)';
    $('marine-current').textContent = '—';
    if (els.seaSummary) els.seaSummary.textContent = 'මුහුදු දත්ත නොමැත.';
    if (els.seaStrip) els.seaStrip.innerHTML = '';
    if (els.seaNote) {
      els.seaNote.textContent = m && m._inlandFallback
        ? 'මෙම ස්ථානය මුහුදට දුරින් — මුහුදු දත්ත නොමැත. නිල අනතුරු ඇඟවීම් සඳහා meteo.gov.lk බලන්න.'
        : 'මුහුදු දත්ත ලබාගත නොහැක. නිල අනතුරු ඇඟවීම් සඳහා meteo.gov.lk බලන්න.';
    }
    return;
  }

  const wave = c.wave_height;
  $('marine-wave').textContent = wave != null ? `${wave.toFixed(2)} m` : '—';
  $('marine-wave-dir').textContent = waveFromText(c.wave_direction);
  $('marine-period').textContent = c.wave_period != null ? `${c.wave_period.toFixed(1)} s` : '—';
  $('marine-current-dir').textContent = currentToText(c.ocean_current_direction);
  $('marine-sealevel').textContent = c.sea_level_height_msl != null
    ? `${c.sea_level_height_msl >= 0 ? '+' : ''}${c.sea_level_height_msl.toFixed(2)} m` : '—';
  $('marine-windwave').textContent = c.wind_wave_height != null ? `${c.wind_wave_height.toFixed(2)} m` : '—';
  $('marine-swell').textContent = c.swell_wave_height != null ? `${c.swell_wave_height.toFixed(2)} m` : '—';
  $('marine-swell-dir').textContent = waveFromText(c.swell_wave_direction);

  const currentSpeed = c.ocean_current_velocity;
  $('marine-current').textContent = currentSpeed != null ? `${currentSpeed.toFixed(1)} km/h` : '—';

  // SST: current may omit it, so use the nearest hourly value if needed
  let sst = c.sea_surface_temperature;
  if (sst == null && m.hourly && m.hourly.time && m.hourly.sea_surface_temperature) {
    let idx = m.hourly.time.findIndex((t) => hourKey(t) === colomboNow().hour);
    if (idx < 0) idx = m.hourly.time.length - 1;
    sst = m.hourly.sea_surface_temperature[idx];
  }
  $('marine-sst').textContent = sst != null ? fmtTemp(sst) : '—';

  // Badge + dial + summary
  const st = seaState(wave);
  if (els.seaBadge) { els.seaBadge.textContent = st.label; els.seaBadge.style.background = st.color; }
  if (els.seaArrow) {
    els.seaArrow.style.transform = `rotate(${c.ocean_current_direction != null ? c.ocean_current_direction : 0}deg)`;
  }
  if (els.seaSummary) {
    const bits = [];
    if (wave != null) bits.push(`රැලි ${wave.toFixed(2)} m`);
    if (currentSpeed != null) bits.push(`ධාරාව ${currentSpeed.toFixed(1)} km/h ${currentToText(c.ocean_current_direction)}`);
    if (sst != null) bits.push(`ජලය ${fmtTemp(sst)}`);
    els.seaSummary.textContent = bits.join(' · ');
  }
  if (els.seaNote) {
    if (m._nearestCoast) {
      const nc = m._nearestCoast;
      els.seaNote.textContent = `මෙම ස්ථානය මුහුදට දුරින්. ළඟම වෙරළ වන ${nc.si} (පමණ ${Math.round(nc.distanceKm)} km) සඳහා දත්ත පෙන්වයි — මෙම ස්ථානයට නොවේ. නිල අනතුරු ඇඟවීම් සඳහා meteo.gov.lk බලන්න.`;
    } else if (m._inlandFallback) {
      els.seaNote.textContent = 'මෙම ස්ථානය මුහුදට දුරින් — මුහුදු දත්ත ආසන්න අගයක් පමණි. නිල අනතුරු ඇඟවීම් සඳහා meteo.gov.lk බලන්න.';
    } else {
      els.seaNote.textContent = 'මූලාශ්‍ර: MeteoFrance SMOC (ධාරා හා වේලා) සහ MFWAM (රැලි), Copernicus Marine හරහා · Open-Meteo. මෙය නාවික සංචාලනයට නොවේ.';
    }
  }

  renderSeaStrip();
}

function renderSeaStrip() {
  if (!els.seaStrip) return;
  els.seaStrip.innerHTML = '';
  const m = state.marine;
  if (!m || !m.hourly || !m.hourly.time) return;

  const now = colomboNow();
  let start = m.hourly.time.findIndex((t) => t >= now.key);
  if (start < 0) start = 0;

  const count = Math.min(12, m.hourly.time.length - start);
  for (let n = 0; n < count; n++) {
    const i = start + n;
    const wave = m.hourly.wave_height ? m.hourly.wave_height[i] : null;
    const speed = m.hourly.ocean_current_velocity ? m.hourly.ocean_current_velocity[i] : null;
    const dir = m.hourly.ocean_current_direction ? m.hourly.ocean_current_direction[i] : null;
    const isNow = n === 0 && hourKey(m.hourly.time[i]) === now.hour;
    const box = document.createElement('div');
    box.className = 'sea-box';
    box.innerHTML = `
      <div class="muted small">${isNow ? 'දැන්' : clockOf(m.hourly.time[i])}</div>
      <div class="sea-ico" title="රැලි">🌊</div>
      <div class="sea-wave">${wave != null ? wave.toFixed(2) + ' m' : '—'}</div>
      <div class="sea-cur" title="ධාරාව ${currentToText(dir)}">
        <span class="cur-arrow" style="transform:rotate(${dir != null ? dir : 0}deg)">↑</span>
        ${speed != null ? speed.toFixed(1) : '—'}
      </div>
    `;
    els.seaStrip.appendChild(box);
  }
}

/* ---------- navigation ---------- */
function showView(name) {
  document.querySelectorAll('.view').forEach((v) => { v.hidden = true; v.classList.remove('is-active'); });
  const target = document.querySelector(`#view-${name}`);
  if (target) { target.hidden = false; target.classList.add('is-active'); }
  document.querySelectorAll('.nav-btn').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.nav === name);
    if (b.dataset.nav === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (name === 'map') {
    initMap();
    requestAnimationFrame(() => state.map && state.map.invalidateSize());
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.nav-btn, [data-nav]').forEach((el) => {
  if (el.dataset.nav) el.addEventListener('click', (e) => { e.preventDefault(); showView(el.dataset.nav); });
});

/* ---------- quick chips ---------- */
function renderQuickCities() {
  els.quick.innerHTML = '';
  CITIES.slice(0, 10).forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = c.si; b.dataset.name = c.name;
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

/* ---------- cities grid ---------- */
function renderCitiesGrid() {
  els.citiesGrid.innerHTML = '';
  CITIES.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'city-card';
    const cached = state.overviewData[c.name];
    b.innerHTML = `<span class="name">${c.si}</span><div class="muted small">${provinceLabel(c)}</div><div class="temp">${cached ? fmtTemp(cached.temp) : '--°'}</div><div class="cond">${cached ? wmo(cached.code)[0] : 'තට්ටු කරන්න'}</div>`;
    b.addEventListener('click', () => { loadWeather({ ...c }); showView('dashboard'); });
    els.citiesGrid.appendChild(b);
  });
}

async function loadOverview() {
  const subset = CITIES.slice(0, 16);
  els.overview.innerHTML = '';
  subset.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mini';
    b.innerHTML = `<strong>${c.si}</strong><span class="temp">--°</span><br><span class="muted small">පූරණය වෙමින්…</span>`;
    b.addEventListener('click', () => { loadWeather({ ...c }); showView('dashboard'); });
    b.dataset.city = c.name;
    els.overview.appendChild(b);
  });

  async function one(place) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,weather_code&timezone=Asia%2FColombo&forecast_days=1`;
      const j = await fetchJSON(url);
      if (!j.current) return;
      state.overviewData[place.name] = { temp: j.current.temperature_2m, code: j.current.weather_code };
      const [label, icon] = wmo(j.current.weather_code);
      const el = els.overview.querySelector(`[data-city="${place.name}"]`);
      if (el) {
        el.innerHTML = `<strong>${place.si} ${icon}</strong><span class="temp">${fmtTemp(j.current.temperature_2m)}</span><br><span class="muted small">${label}</span>`;
      }
      const idx = CITIES.findIndex((x) => x.name === place.name);
      const cards = [...els.citiesGrid.children];
      if (cards[idx]) {
        cards[idx].innerHTML = `<span class="name">${place.si}</span><div class="muted small">${provinceLabel(place)}</div><div class="temp">${fmtTemp(j.current.temperature_2m)}</div><div class="cond">${label}</div>`;
      }
    } catch { /* නොසලකන්න */ }
  }
  for (const c of subset) await one(c);
}

/* ---------- favourites ---------- */
function updateFavButton() {
  const btn = $('btn-favourite');
  const isFav = state.favourites.some((f) => f.name === state.current.name);
  btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
  btn.textContent = isFav ? '★ ප්‍රියතම' : '☆ ප්‍රියතම';
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
    b.innerHTML = `<span class="name">★ ${nameOf(c)}</span><div class="muted small">${provinceLabel(c)}</div>`;
    b.addEventListener('click', () => { loadWeather({ ...c }); showView('dashboard'); });
    els.favList.appendChild(b);
  });
}
$('btn-clear-favs').addEventListener('click', () => {
  state.favourites = [];
  localStorage.setItem('lk-weather-favs', '[]');
  renderFavourites(); updateFavButton();
});

/* ---------- search ---------- */
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
      els.results.innerHTML = `<li class="muted">“${q}” සඳහා ශ්‍රී ලංකාවේ ප්‍රතිඵල නැත. ප්‍රධාන නගරයක් උත්සාහ කරන්න.</li>`;
      els.results.hidden = false;
      return;
    }
    j.results.forEach((r) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.tabIndex = 0;
      const si = sinhalizeName(r.name);
      li.innerHTML = `<strong>${si ? `${si} (${r.name})` : r.name}</strong><br><span class="sub">${[r.admin1, r.country].filter(Boolean).join(' · ')} · ${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)}</span>`;
      const pick = () => {
        els.results.hidden = true;
        els.input.value = si || r.name;
        loadWeather({ name: r.name, si, lat: r.latitude, lon: r.longitude, region: (r.admin1 || '').replace(/ Province$/, ''), admin1: r.admin1 });
        showView('dashboard');
      };
      li.addEventListener('click', pick);
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      els.results.appendChild(li);
    });
    els.results.hidden = false;
  } catch {
    els.results.innerHTML = `<li class="muted">සෙවීම අසාර්ථකයි. සම්බන්ධතාවය පරීක්ෂා කරන්න.</li>`;
    els.results.hidden = false;
  }
}
$('search-form').addEventListener('submit', (e) => e.preventDefault());

/* ---------- geolocation ---------- */
$('btn-locate').addEventListener('click', () => {
  if (!navigator.geolocation) { showError('මෙම බ්‍රවුසරයේ ස්ථාන සේවා නොමැත.'); return; }
  setStatus('ස්ථානය සොයමින්…', '');
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setLoading(false);
      loadWeather({ name: 'My location', si: 'මගේ ස්ථානය', lat: pos.coords.latitude, lon: pos.coords.longitude, region: 'Sri Lanka' });
    },
    () => {
      setLoading(false);
      showError('ඔබේ ස්ථානය ලබාගත නොහැක. ස්ථාන අවසරය ලබා දෙන්න හෝ නගරයක් සොයන්න.');
      setStatus('ස්ථානය ලබාගත නොහැක.');
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

/* ---------- refresh / retry ---------- */
$('btn-refresh').addEventListener('click', () => loadWeather(state.current));
$('btn-retry').addEventListener('click', () => loadWeather(state.current));

function renderOverviewFromCache() {
  els.overview.querySelectorAll('[data-city]').forEach((el) => {
    const place = CITIES.find((c) => c.name === el.dataset.city);
    const d = state.overviewData[el.dataset.city];
    if (!place || !d) return;
    const [label, icon] = wmo(d.code);
    el.innerHTML = `<strong>${place.si} ${icon}</strong><span class="temp">${fmtTemp(d.temp)}</span><br><span class="muted small">${label}</span>`;
  });
}

/* ---------- unit toggle ---------- */
function setUnit(u) {
  state.unit = u;
  localStorage.setItem('lk-weather-unit', u);
  $('btn-c').classList.toggle('is-active', u === 'c');
  $('btn-f').classList.toggle('is-active', u === 'f');
  if (state.forecast) {
    renderCurrent(); renderHourly(); renderDaily(); renderMarine();
    renderCitiesGrid(); renderOverviewFromCache();
  }
}
$('btn-c').addEventListener('click', () => setUnit('c'));
$('btn-f').addEventListener('click', () => setUnit('f'));

/* ---------- map ---------- */
function initMap() {
  if (state.map || !window.L) return;
  const center = [7.8731, 80.7711];
  state.map = L.map('leaflet-map').setView(center, 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> දායකයින්',
  }).addTo(state.map);

  CITIES.forEach((c) => {
    const m = L.marker([c.lat, c.lon]).addTo(state.map);
    m.bindPopup(`<strong>${c.si}</strong><br>${provinceLabel(c)}<br><button onclick="window.__lkSelect&&window.__lkSelect('${c.name}')">අනාවැකිය බලන්න</button>`);
    m.on('click', () => { loadWeather({ ...c }); });
  });
}
window.__lkSelect = (name) => { const c = CITIES.find((x) => x.name === name); if (c) { loadWeather({ ...c }); showView('dashboard'); } };

/* ---------- init ---------- */
(function init() {
  setUnit(state.unit);
  renderQuickCities();
  renderCitiesGrid();
  renderFavourites();
  loadWeather(CITIES[0]).then(() => loadOverview());

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (state.forecast) renderHourly();
      if (state.map) state.map.invalidateSize();
    }, 150);
  });
  window.addEventListener('orientationchange', () => setTimeout(() => state.map && state.map.invalidateSize(), 300));
})();
