// FAU Boca Raton coordinates
const LAT = 26.3683;
const LON = -80.1015;

const API_URL =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${LAT}&longitude=${LON}` +
  "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day" +
  "&hourly=temperature_2m,weather_code,precipitation_probability,is_day" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max" +
  "&temperature_unit=fahrenheit&wind_speed_unit=mph" +
  "&timezone=America%2FNew_York&forecast_days=7";

// Open-Meteo weather codes -> [description, day icon, night icon]
const WEATHER_CODES = {
  0: ["Clear sky", "☀️", "🌙"],
  1: ["Mainly clear", "🌤️", "🌙"],
  2: ["Partly cloudy", "⛅", "☁️"],
  3: ["Overcast", "☁️", "☁️"],
  45: ["Fog", "🌫️", "🌫️"],
  48: ["Rime fog", "🌫️", "🌫️"],
  51: ["Light drizzle", "🌦️", "🌧️"],
  53: ["Drizzle", "🌦️", "🌧️"],
  55: ["Heavy drizzle", "🌧️", "🌧️"],
  56: ["Freezing drizzle", "🌧️", "🌧️"],
  57: ["Freezing drizzle", "🌧️", "🌧️"],
  61: ["Light rain", "🌦️", "🌧️"],
  63: ["Rain", "🌧️", "🌧️"],
  65: ["Heavy rain", "🌧️", "🌧️"],
  66: ["Freezing rain", "🌧️", "🌧️"],
  67: ["Freezing rain", "🌧️", "🌧️"],
  71: ["Light snow", "🌨️", "🌨️"],
  73: ["Snow", "🌨️", "🌨️"],
  75: ["Heavy snow", "❄️", "❄️"],
  77: ["Snow grains", "🌨️", "🌨️"],
  80: ["Rain showers", "🌦️", "🌧️"],
  81: ["Rain showers", "🌧️", "🌧️"],
  82: ["Violent showers", "⛈️", "⛈️"],
  85: ["Snow showers", "🌨️", "🌨️"],
  86: ["Snow showers", "🌨️", "🌨️"],
  95: ["Thunderstorm", "⛈️", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️", "⛈️"],
  99: ["Thunderstorm with hail", "⛈️", "⛈️"],
};

function describe(code, isDay = 1) {
  const info = WEATHER_CODES[code] || ["Unknown", "🌈", "🌈"];
  return { text: info[0], icon: isDay ? info[1] : info[2] };
}

// Open-Meteo returns local times like "2026-09-28T14:00" (no timezone),
// so read the parts directly instead of letting the browser shift them.
function hourLabel(iso) {
  const h = Number(iso.slice(11, 13));
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12} ${suffix}`;
}

function timeLabel(iso) {
  const h = Number(iso.slice(11, 13));
  const m = iso.slice(14, 16);
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}

function dayLabel(dateStr, index) {
  if (index === 0) return "Today";
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function renderCurrent(data) {
  const c = data.current;
  const d = data.daily;
  const w = describe(c.weather_code, c.is_day);

  document.getElementById("current").innerHTML = `
    <div class="icon">${w.icon}</div>
    <div class="temp">${Math.round(c.temperature_2m)}°F</div>
    <div class="desc">${w.text}</div>
    <div class="stats">
      <div class="stat"><span>Feels like</span><strong>${Math.round(c.apparent_temperature)}°F</strong></div>
      <div class="stat"><span>Humidity</span><strong>${c.relative_humidity_2m}%</strong></div>
      <div class="stat"><span>Wind</span><strong>${Math.round(c.wind_speed_10m)} mph</strong></div>
      <div class="stat"><span>High / Low</span><strong>${Math.round(d.temperature_2m_max[0])}° / ${Math.round(d.temperature_2m_min[0])}°</strong></div>
      <div class="stat"><span>UV Index</span><strong>${Math.round(d.uv_index_max[0] ?? 0)}</strong></div>
      <div class="stat"><span>Sunrise / Sunset</span><strong>${timeLabel(d.sunrise[0])} / ${timeLabel(d.sunset[0])}</strong></div>
    </div>
  `;
}

function renderHourly(data) {
  const h = data.hourly;
  // Start at the current hour (current.time is local, e.g. "2026-09-28T14:15")
  const nowHour = data.current.time.slice(0, 13);
  let start = h.time.findIndex((t) => t.slice(0, 13) === nowHour);
  if (start < 0) start = 0;

  let html = "";
  for (let i = start; i < Math.min(start + 24, h.time.length); i++) {
    const w = describe(h.weather_code[i], h.is_day[i]);
    html += `
      <div class="hour">
        <div>${i === start ? "Now" : hourLabel(h.time[i])}</div>
        <div class="h-icon" title="${w.text}">${w.icon}</div>
        <div><strong>${Math.round(h.temperature_2m[i])}°</strong></div>
        <div class="h-rain">💧${h.precipitation_probability[i] ?? 0}%</div>
      </div>`;
  }
  document.getElementById("hourly").innerHTML = html;
}

function renderDaily(data) {
  const d = data.daily;
  let html = "";
  d.time.forEach((date, i) => {
    const w = describe(d.weather_code[i]);
    html += `
      <div class="day">
        <div class="d-name">${dayLabel(date, i)}<br><small>${w.text}</small></div>
        <div class="d-icon">${w.icon}</div>
        <div class="d-rain">💧${d.precipitation_probability_max[i] ?? 0}%</div>
        <div class="d-temps"><strong>${Math.round(d.temperature_2m_max[i])}°</strong><span class="lo">${Math.round(d.temperature_2m_min[i])}°</span></div>
      </div>`;
  });
  document.getElementById("daily").innerHTML = html;
}

async function loadWeather() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
    const data = await res.json();

    renderCurrent(data);
    renderHourly(data);
    renderDaily(data);
    document.getElementById("updated").textContent = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (err) {
    console.error(err);
    document.getElementById("current").innerHTML =
      `<p class="error">Couldn't load the weather right now 🌧️ Please try again.</p>`;
  }
}

document.getElementById("refresh").addEventListener("click", loadWeather);

loadWeather();
// Refresh every 15 minutes
setInterval(loadWeather, 15 * 60 * 1000);
