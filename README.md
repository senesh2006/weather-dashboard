# Sri Lanka Weather Dashboard

A simple, fast weather dashboard for Sri Lanka. No build step, no API key,
no account — just open `index.html` or visit the GitHub Pages site.

## Features

- Search any city / town / village in Sri Lanka (geocoding via Open-Meteo)
- 📍 "Use my location" button
- Current conditions: temperature, feels-like, humidity, wind, pressure,
  UV, precipitation, visibility, sunrise/sunset, dew point, cloud cover,
  wind gusts
- Next 24 hours: temperature chart + hourly strip with rain chance
- 7-day forecast with temperature range bars
- Air quality: US AQI, PM2.5, PM10, O₃, NO₂, dust (CAMS)
- Marine / coast: wave height, period, swell, sea-surface temperature
- Interactive map of Sri Lanka (Leaflet / OpenStreetMap) — tap a marker
- Popular cities grid + favourites (saved in your browser)
- °C / °F toggle, refresh, local time (Asia/Colombo, UTC+5:30)
- Simple navigation: Dashboard · Map · Cities · About & Sources
- Responsive, accessible, keyboard-friendly

## Data sources (accurate & free)

| Data | API | Provider |
|---|---|---|
| Current / hourly / daily forecast | [Open-Meteo Forecast API](https://open-meteo.com/en/docs) | ECMWF IFS, GFS, ICON via Open-Meteo (CC-BY 4.0) |
| Place-name search | [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | Open-Meteo |
| Air quality (US AQI, PM2.5/10, O₃…) | [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) | Copernicus CAMS |
| Waves / swell / sea temp | [Open-Meteo Marine API](https://open-meteo.com/en/docs/marine-weather-api) | CMEMS / wave models |
| Map tiles | [OpenStreetMap](https://www.openstreetmap.org/copyright) via Leaflet | © OpenStreetMap contributors |
| Official warnings | [Department of Meteorology, Sri Lanka](https://www.meteo.gov.lk/) | **Use for official alerts** |

> For official weather warnings, monsoon/cyclone advisories and safety
> decisions, always check [meteo.gov.lk](https://www.meteo.gov.lk/).
> This dashboard is a demo and does not replace official advice.

## Quick start

### Option A — open locally
Just open `index.html` in a browser. Live data needs internet.

### Option B — GitHub Pages (recommended)
This repo includes a Pages workflow (`.github/workflows/pages.yml`).
Enable Pages under **Settings → Pages → Source: GitHub Actions** and
every push to `main` will deploy the site.

## Project structure

```
.
├── index.html      # App shell + views (Dashboard / Map / Cities / About)
├── style.css       # Styles
├── app.js          # All logic (fetch, render, search, map)
├── manifest.json   # PWA manifest (installable)
└── README.md
```

## How it works

- `app.js` calls the Open-Meteo APIs directly from the browser (no
  server, no key, CORS-enabled).
- Times are returned in `Asia/Colombo` timezone.
- Temperatures are fetched in °C and converted client-side for °F.
- Favourites and unit preference are stored in `localStorage`.

## Credits

- Weather & environmental data: Open-Meteo (CC-BY 4.0)
- Map: OpenStreetMap contributors
- Built for Sri Lanka 🌴
