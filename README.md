# Weather Orb

A lightweight weather app built with plain HTML/CSS/JavaScript.

Live demo: https://savindipanditha.github.io/Weather-App/

## Features

- Search by city (supports “City, CountryCode” like `Paris, FR`)
- Clear UI states: empty, loading, and error
- Weather details: temperature (°C/°F), feels-like, humidity, and wind
- Weather scene background changes based on conditions (rain/snow/clouds/etc.)
- Accent colors shift based on actual temperature (cold → blue, warm → orange/red)
- Responsive + accessible layout

## Run locally

Option A (simplest):

1. Open `index.html` in your browser.

Option B (recommended, local server):

```bash
cd Weather-App
python3 -m http.server 5173
```

Then open: http://localhost:5173

## API key (OpenWeather)

This app uses the OpenWeather Current Weather endpoint.

- By default, the app includes a key in `app.js` so the GitHub Pages demo works.
- You can override it locally without changing code by setting a key in `localStorage`:

Open DevTools Console and run:

```js
localStorage.setItem('OWM_API_KEY', 'YOUR_KEY_HERE')
```

To remove the override:

```js
localStorage.removeItem('OWM_API_KEY')
```

## Deploy (GitHub Pages)

This repo can be deployed via GitHub Pages (Settings → Pages) using the default “Deploy from a branch” flow.

## Project structure

- `index.html` — UI markup
- `style.css` — styling
- `themes.css` — weather scene backgrounds (SVG)
- `assets/` — background SVGs
- `app.js` — weather fetching + rendering

