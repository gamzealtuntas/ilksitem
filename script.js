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

// SVG ikon seçici (4 ikon: yağmurlu, bulutlu, güneşli, gece)
function getLocalWeatherIcon(description, isDaytime) {
  description = description.toLowerCase();

  if (!isDaytime) {
    return "resim/indir1.png"; // gece ikonu
  }
  if (description.includes("yağmur") || description.includes("rain")) {
    return "resim/yagmur1.png";
  }
  if (description.includes("bulut")) {
    return "resim/bulut1.png";
  }
  if (description.includes("güneş") || description.includes("açık")) {
    return "resim/gunes1.png";
  }
  return "resim/bulut1.png"; // varsayılan bulutlu
}

function displayCurrentWeather(data) {
  document.getElementById("cityName").innerText = data.name;
  document.getElementById("temp").innerText = `🌡 ${Math.round(data.main.temp)}°C`;
  document.getElementById("description").innerText = data.weather[0].description;
  document.getElementById("details").innerText = `Nem: ${data.main.humidity}% | Rüzgar: ${data.wind.speed} km/s`;

  const isDaytime = data.weather[0].icon.includes("d");
  const iconPath = getLocalWeatherIcon(data.weather[0].description, isDaytime);

  const iconElement = document.getElementById("weatherIcon");
  if (iconElement) {
    iconElement.src = iconPath;
    iconElement.alt = data.weather[0].description;
  }
}

function displayForecast(list) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";

  // Günlük verileri tarih bazında grupla
  const daily = {};

  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    const hour = parseInt(item.dt_txt.split(" ")[1].split(":")[0]);

    // Öğlen saatine (12-15 arası) en yakın saatlik veriyi alacağız
    if (!daily[date]) {
      daily[date] = item;
    } else {
      const currentHour = parseInt(daily[date].dt_txt.split(" ")[1].split(":")[0]);
      // Eğer bu item 12-15 aralığında ve öncekinden daha uygun ise değiştir
      if (hour >= 12 && hour <= 15) {
        // Önceki item 12-15 aralığında değilse veya bu item saat olarak daha yakınsa güncelle
        if (!(currentHour >= 12 && currentHour <= 15) || Math.abs(hour - 13) < Math.abs(currentHour - 13)) {
          daily[date] = item;
        }
      }
    }
  });

  const labels = [];
  const temps = [];

  Object.values(daily).slice(0, 7).forEach(day => {
    const date = new Date(day.dt_txt);
    const weekday = date.toLocaleDateString("tr-TR", { weekday: "short" });
    const temp = Math.round(day.main.temp);
    const isDaytime = day.weather[0].icon.includes("d");
    const iconPath = getLocalWeatherIcon(day.weather[0].description, isDaytime);

    forecastContainer.innerHTML += `
      <div class="forecast-card">
        <p>${weekday}</p>
        <img src="${iconPath}" alt="icon" width="50" height="50">
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
    const isDaytime = item.weather[0].icon.includes("d");
    const iconPath = getLocalWeatherIcon(item.weather[0].description, isDaytime);

    container.innerHTML += `
      <div class="hourly-card">
        <p>${hour}</p>
        <img src="${iconPath}" alt="icon" width="50" height="50">
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