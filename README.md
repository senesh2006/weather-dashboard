# SSS Sea Food Suppliers — කාලගුණ උපකරණ පුවරුව

A simple, fast weather dashboard for Sri Lanka, built for **SSS Sea Food
Suppliers**. The interface is in **Sinhala**, the default city is
**Mullaitivu**, and it works with no build step, no API key and no account.

Live site (after enabling GitHub Pages): `https://senesh2006.github.io/weather-dashboard/`

## Features

- **Sinhala UI** (`lang="si"`, Noto Sans Sinhala)
- **Default city: Mullaitivu** (මුලතිව්) — great for the fishing/coastal side of the business
- Search any city / town / village in Sri Lanka (Open-Meteo Geocoding)
- 📍 "Use my location" button
- Current conditions: temperature, feels-like, humidity, wind, pressure,
  UV, precipitation, visibility, sunrise/sunset, dew point, cloud cover,
  wind gusts
- Next 24 hours: temperature chart + swipeable hourly strip
- 7-day forecast with temperature range bars
- Air quality: US AQI, PM2.5, PM10, O₃, NO₂, dust (CAMS)
- **Marine / coast:** wave height, wave period, swell, sea-surface temperature
- Interactive map of Sri Lanka (Leaflet / OpenStreetMap)
- Favourites saved in the browser
- °C / °F toggle, refresh, Colombo local time (UTC+5:30)
- Loading animations: top progress bar, card spinner, skeleton shimmer
- Mobile-first: bottom tab bar, 44px tap targets, safe-area support

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
Open `index.html` in a browser. Live data needs internet.

### Option B — GitHub Pages (recommended)
This repo includes a Pages workflow (`.github/workflows/pages.yml`).
Enable Pages under **Settings → Pages → Source: GitHub Actions** and every
push to `main` deploys the site.

## Project structure

```
.
├── index.html      # Sinhala app shell + views (මුල් පිටුව / සිතියම / නගර / තොරතුරු)
├── style.css       # Styles + mobile layer + loading animations
├── app.js          # Fetch, render, search, map, favourites
├── manifest.json   # PWA manifest
└── README.md
```

## How it works

- `app.js` calls the Open-Meteo APIs directly from the browser (no server,
  no key, CORS-enabled).
- API times are `Asia/Colombo` wall-clock strings and are displayed exactly
  as returned, so they never shift with the viewer's timezone.
- Temperatures are fetched in °C and converted client-side for °F.
- Favourites and unit preference are stored in `localStorage`.

## Credits

- Weather & environmental data: Open-Meteo (CC-BY 4.0)
- Map: OpenStreetMap contributors
- Sri Lanka Department of Meteorology for official warnings
- Built for SSS Sea Food Suppliers 🐟
