document.getElementById('weatherForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;

  const apiKey = '0f1afcb62708ad4df480ca8c35abc678';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  const resultDiv = document.getElementById('weatherResult');
  resultDiv.innerHTML = '<div class="loading">Exploring weather...</div>';

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message ? data.message : 'City not found');
    }
    const tempC = data.main.temp;
    const tempF = (tempC * 9/5 + 32).toFixed(1);
    const condition = data.weather[0].main;
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;

    const description = data.weather[0].description.toLowerCase();
    let bgImage = '';
    if (description.includes('clear')) {
      bgImage = "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')";
    } else if (description.includes('cloud')) {
      bgImage = "url('https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Cloudy_sky_%2826171935906%29.jpg/1200px-Cloudy_sky_%2826171935906%29.jpg')";
    } else if (description.includes('rain') || description.includes('drizzle')) {
      bgImage = "url('https://s7d2.scene7.com/is/image/TWCNews/fullscreen_pic-22')";
    } else if (description.includes('thunder')) {
      bgImage = "url('https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Lightning_Pritzerbe_01_%28MK%29.jpg/960px-Lightning_Pritzerbe_01_%28MK%29.jpg')";
    } else if (description.includes('snow')) {
      bgImage = "url('https://i.abcnewsfe.com/a/7f8980ec-b4c2-4ae1-b15b-e2d2e787464d/snow-rf-gty-ml-241129_1732917933880_hpMain_16x9.jpg?w=1600')";
    } else if (description.includes('mist') || description.includes('fog') || description.includes('haze')) {
      bgImage = "url('https://miro.medium.com/v2/resize:fit:1280/1*QlTeGUn3xDCgKurTxUC6Sg.jpeg')";
    } else {
      bgImage = "url('https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=1200&q=80')";
    }
    document.body.style.background = bgImage + " center/cover no-repeat fixed";

    resultDiv.innerHTML = `
      <div class="weather-box">
        <div class="weather-header">
          <img src="${icon}" alt="Weather icon" class="weather-icon" />
          <div class="weather-city">${data.name}</div>
        </div>
        <div class="weather-condition-row">
          <div class="weather-condition-main">${condition}</div>
          <div class="weather-desc">${data.weather[0].description}</div>
          <div class="weather-temp">${tempC.toFixed(1)}°C / ${tempF}°F</div>
        </div>
        <div class="weather-details-grid">
          <div class="weather-detail">
            <span class="detail-label">Humidity</span>
            <span class="detail-value">${humidity}%</span>
          </div>
          <div class="weather-detail">
            <span class="detail-label">Wind Speed</span>
            <span class="detail-value">${wind} m/s</span>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<div class="error">${err.message}</div>`;
  }
});