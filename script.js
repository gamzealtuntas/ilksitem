const apiKey = "8de4b818b620557806c21dfe65f206be";

async function getWeather() {
  const city = document.getElementById("cityInput").value || "Antalya";

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=tr`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=tr`;

  try {
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();

    if (weatherData.cod !== 200 || forecastData.cod !== "200") {
      alert("Hava durumu bilgisi alınamadı. Şehir ismini kontrol edin.");
      return;
    }

    displayCurrentWeather(weatherData);
    displayForecast(forecastData.list);
    displayHourlyForecast(forecastData.list.slice(0, 8));
  } catch (error) {
    console.error("Hava durumu verisi alınamadı:", error);
    alert("Veri alınırken hata oluştu.");
  }
}

function displayCurrentWeather(data) {
  document.getElementById("cityName").innerText = data.name;
  document.getElementById("temp").innerText = `🌡 ${Math.round(data.main.temp)}°C`;
  document.getElementById("description").innerText = data.weather[0].description;
  document.getElementById("details").innerText = `Nem: ${data.main.humidity}% | Rüzgar: ${data.wind.speed} km/s`;

  const iconCode = data.weather[0].icon;
  const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const iconElement = document.getElementById("weatherIcon");

  if (iconElement) {
    iconElement.src = iconUrl;
    iconElement.alt = data.weather[0].description;
  } else {
    const img = document.createElement("img");
    img.id = "weatherIcon";
    img.src = iconUrl;
    img.alt = data.weather[0].description;
    img.style.width = "100px";
    img.style.height = "100px";
    document.getElementById("description").appendChild(img);
  }
}

function displayForecast(list) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";

  const daily = {};
  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) daily[date] = item;
  });

  const labels = [];
  const temps = [];

  Object.values(daily).slice(0, 7).forEach(day => {
    const date = new Date(day.dt_txt);
    const weekday = date.toLocaleDateString("tr-TR", { weekday: "short" });
    const temp = Math.round(day.main.temp);
    const icon = day.weather[0]?.icon;

    forecastContainer.innerHTML += `
      <div class="forecast-card">
        <p>${weekday}</p>
        ${icon ? `<img src="http://openweathermap.org/img/wn/${icon}.png" alt="icon">` : `<div style="height: 50px;"></div>`}
        <p>${temp}°C</p>
      </div>
    `;

    labels.push(weekday);
    temps.push(temp);
  });

  drawChart(labels, temps);
}

function displayHourlyForecast(list) {
  const container = document.getElementById("hourlyForecast");
  container.innerHTML = "";

  list.forEach(item => {
    const date = new Date(item.dt_txt);
    const hour = date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0]?.icon;

    container.innerHTML += `
      <div class="hourly-card">
        <p>${hour}</p>
        ${icon ? `<img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">` : `<div style="height: 50px;"></div>`}
        <p>${temp}°C</p>
      </div>
    `;
  });
}

function drawChart(labels, temps) {
  const ctx = document.getElementById("tempChart").getContext("2d");

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Sıcaklık",
        data: temps,
        borderColor: "yellow",
        backgroundColor: "rgba(255,255,0,0.2)",
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}