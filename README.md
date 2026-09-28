# Boca Beach Weather 🌴

A pink beach-themed weather app for **FAU in Boca Raton, FL**.
It uses the free [Open-Meteo](https://open-meteo.com/) API (no key or login needed).

## Features
- Current weather: temperature, feels like, humidity, wind, UV, sunrise/sunset
- Next 24 hours
- 7-day forecast
- Auto-refresh every 15 minutes

## Files
- `index.html` – page layout and beach scene (sun, ocean, palm trees)
- `style.css` – pink beach theme
- `app.js` – gets the weather from Open-Meteo and shows it
- `netlify.toml` – Netlify settings

## Run locally
Open `index.html` in your browser. Or run a small server:

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000

## Deploy on Netlify
1. Log in at [app.netlify.com](https://app.netlify.com).
2. Click **Add new site → Import an existing project**.
3. Pick **GitHub** and choose this repo.
4. Leave the build command empty. Publish directory is `.` (already set in `netlify.toml`).
5. Click **Deploy**.

**Quick option:** drag and drop this folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
