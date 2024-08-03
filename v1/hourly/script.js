document.getElementById('currentWeather').addEventListener('click', function() {
  const forecast = document.getElementById('forecast');
  forecast.classList.toggle('hidden');
});

function setWeatherBorder(weatherDescription, element) {
  element.classList.remove('sunny', 'cloudy', 'rainy', 'stormy', 'clear');

  if (weatherDescription.includes('Sunny') || weatherDescription.includes('Clear')) {
    element.classList.add('sunny');
  } else if (weatherDescription.includes('Cloud')) {
    element.classList.add('cloudy');
  } else if (weatherDescription.includes('Showers') || weatherDescription.includes('Rain')) {
    element.classList.add('rainy');
  } else if (weatherDescription.includes('Storm')) {
    element.classList.add('stormy');
  } else {
    element.classList.add('clear');
  }
}

function applyWeatherBorders() {
  const currentWeatherDescription = document.querySelector('.description').textContent;
  const container = document.querySelector('.container');
  setWeatherBorder(currentWeatherDescription, container);
}

// Fetch weather data and update the UI
async function fetchWeatherData() {
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-7.1167&longitude=112.4167&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code');
    const data = await response.json();

    // Current weather
    const current = data.current;
    document.querySelector('.temperature').textContent = `${current.temperature_2m}°C`;
    document.querySelector('.description').textContent = getWeatherDescription(current.weather_code);
    document.querySelector('.humidity').textContent = `Humidity: ${current.relative_humidity_2m}%`;
    document.querySelector('.precipitation').textContent = `Precipitation: ${current.precipitation}mm`;

    // Hourly forecast
    const hourly = data.hourly;
    const hourlyForecast = document.getElementById('hourly-forecast');
    hourlyForecast.innerHTML = '';

    hourly.time.forEach((time, index) => {
      const weatherCode = hourly.weather_code[index];
      const temperature = hourly.temperature_2m[index];
      const humidity = hourly.relative_humidity_2m[index];
      const precipitationProbability = hourly.precipitation_probability[index];

      const hourDiv = document.createElement('div');
      hourDiv.classList.add('forecast-hour');
      hourDiv.innerHTML = `
        <p>${time.slice(11, 16)}</p>
        <p>Temp: ${temperature}°C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Precipitation: ${precipitationProbability}%</p>
        <i class="${getWeatherIconClass(weatherCode)}"></i>
      `;
      hourlyForecast.appendChild(hourDiv);
    });

    applyWeatherBorders();
    setUpHourSlider(hourly);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

function getWeatherDescription(weatherCode) {
  const descriptions = {
    0: 'Clear',
    1: 'Sunny',
    2: 'Partly Cloudy',
    3: 'Cloudy',
    4: 'Overcast',
    5: 'Fog',
    6: 'Light Rain',
    7: 'Heavy Rain',
    8: 'Showers',
    9: 'Thunderstorm',
  };
  return descriptions[weatherCode] || 'Unknown';
}

function getWeatherIconClass(weatherCode) {
  const icons = {
    0: 'fas fa-sun',
    1: 'fas fa-sun',
    2: 'fas fa-cloud-sun',
    3: 'fas fa-cloud',
    4: 'fas fa-cloud-meatball',
    5: 'fas fa-smog',
    6: 'fas fa-cloud-showers-heavy',
    7: 'fas fa-cloud-showers-heavy',
    8: 'fas fa-cloud-showers-heavy',
    9: 'fas fa-bolt',
  };
  return icons[weatherCode] || 'fas fa-question';
}

function setUpHourSlider(hourly) {
  const hourSlider = document.getElementById('hour-slider');
  const selectedHour = document.getElementById('selected-hour');

  hourSlider.max = hourly.time.length - 1;

  hourSlider.addEventListener('input', function() {
    const hourIndex = parseInt(hourSlider.value);
    selectedHour.textContent = `Selected Hour: ${hourly.time[hourIndex].slice(11, 16)}`;
    updateHourlyForecast(hourly, hourIndex);
  });

  // Initialize the display
  updateHourlyForecast(hourly, 0);
}

function updateHourlyForecast(hourly, index) {
  const temperature = hourly.temperature_2m[index];
  const humidity = hourly.relative_humidity_2m[index];
  const precipitationProbability = hourly.precipitation_probability[index];
  const weatherCode = hourly.weather_code[index];

  document.querySelector('.temperature').textContent = `${temperature}°C`;
  document.querySelector('.humidity').textContent = `Humidity: ${humidity}%`;
  document.querySelector('.precipitation').textContent = `Precipitation: ${precipitationProbability}%`;
  document.querySelector('.description').textContent = getWeatherDescription(weatherCode);
  document.querySelector('.current-weather i').className = getWeatherIconClass(weatherCode);
}

document.addEventListener('DOMContentLoaded', fetchWeatherData);
