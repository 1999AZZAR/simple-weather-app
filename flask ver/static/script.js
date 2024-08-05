document.addEventListener('DOMContentLoaded', () => {
    const fetchWeatherButton = document.getElementById('fetch-weather-button');
    const loadingIndicator = document.getElementById('loading');
    const header = document.getElementById('header');
    const inputArea = document.getElementById('input-area');

    // Get tab buttons and content
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    function getApiUrl(latitude, longitude, timezone) {
        // Encode the timezone for URL
        const encodedTimezone = encodeURIComponent(timezone);
        return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,visibility,wind_speed_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timeformat=unixtime&timezone=${encodedTimezone}&past_days=2&forecast_days=14`;
    }

    async function fetchWeatherData() {
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        const timezone = document.getElementById('timezone').value;

        if (!latitude || !longitude || !timezone) {
            alert('Please enter latitude, longitude, and time zone.');
            return;
        }

        const apiUrl = getApiUrl(latitude, longitude, timezone);

        loadingIndicator.classList.remove('hidden');

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            displayCurrentWeather(data.current);
            displayHourlyWeather(data.hourly);
            displayDailyWeather(data.daily);
            refreshTime(); // Start updating time
        } catch (error) {
            console.error('Error fetching weather data:', error);
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }

    function updateCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        document.getElementById('current-time').innerText = `Current Time: ${timeString}`;
    }

    function refreshTime() {
        updateCurrentTime();
        setInterval(updateCurrentTime, 60000); // Update every minute
    }

    function getWeatherDescription(weatherCode) {
        const descriptions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing rime fog',
            51: 'Drizzle: Light intensity',
            53: 'Drizzle: Moderate intensity',
            55: 'Drizzle: Dense intensity',
            56: 'Freezing drizzle: Light intensity',
            57: 'Freezing drizzle: Dense intensity',
            61: 'Rain: Slight intensity',
            63: 'Rain: Moderate intensity',
            65: 'Rain: Heavy intensity',
            66: 'Freezing rain: Light intensity',
            67: 'Freezing rain: Heavy intensity',
            71: 'Snow fall: Slight intensity',
            73: 'Snow fall: Moderate intensity',
            75: 'Snow fall: Heavy intensity',
            77: 'Snow grains',
            80: 'Rain showers: Slight intensity',
            81: 'Rain showers: Moderate intensity',
            82: 'Rain showers: Violent intensity',
            85: 'Snow showers: Slight intensity',
            86: 'Snow showers: Heavy intensity',
            95: 'Thunderstorm: Slight or moderate',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };
        return descriptions[weatherCode] || 'Unknown';
    }

    function displayCurrentWeather(current) {
        document.getElementById('current-temperature').innerText = `Temperature: ${current.temperature_2m}°C`;
        document.getElementById('current-humidity').innerText = `Humidity: ${current.relative_humidity_2m}%`;
        document.getElementById('current-weather-code').innerText = `Weather Condition: ${getWeatherDescription(current.weather_code)}`;
        document.getElementById('current-precipitation').innerText = `Precipitation: ${current.precipitation} mm`;
        document.getElementById('current-cloud-cover').innerText = `Cloud Cover: ${current.cloud_cover}%`;
        document.getElementById('current-wind-speed').innerText = `Wind Speed: ${current.wind_speed_10m} km/h`;
    }

    function displayHourlyWeather(hourly) {
        const hourlyInfo = document.getElementById('hourly-info');
        hourlyInfo.innerHTML = '';
        hourly.time.forEach((time, index) => {
            const hourData = `
                <div class="hourly-item">
                    <strong>${new Date(time * 1000).toLocaleTimeString()}</strong>
                    <p><i class="fas fa-thermometer-half"></i> Temperature: ${hourly.temperature_2m[index]}°C</p>
                    <p><i class="fas fa-tint"></i> Humidity: ${hourly.relative_humidity_2m[index]}%</p>
                    <p><i class="fas fa-cloud-rain"></i> Precipitation Probability: ${hourly.precipitation_probability[index]}%</p>
                    <p><i class="fas fa-cloud-sun"></i> Weather Condition: ${getWeatherDescription(hourly.weather_code[index])}</p>
                    <p><i class="fas fa-eye"></i> Visibility: ${hourly.visibility[index]} km</p>
                    <p><i class="fas fa-wind"></i> Wind Speed: ${hourly.wind_speed_10m[index]} km/h</p>
                    <p><i class="fas fa-sun"></i> UV Index: ${hourly.uv_index[index]}</p>
                </div>
                <hr>
            `;
            hourlyInfo.innerHTML += hourData;
        });
    }

    function displayDailyWeather(daily) {
        const dailyInfo = document.getElementById('daily-info');
        dailyInfo.innerHTML = '';
        daily.time.forEach((time, index) => {
            const dayData = `
                <div class="daily-item">
                    <strong>${new Date(time * 1000).toLocaleDateString()}</strong>
                    <p><i class="fas fa-temperature-high"></i> Max Temperature: ${daily.temperature_2m_max[index]}°C</p>
                    <p><i class="fas fa-temperature-low"></i> Min Temperature: ${daily.temperature_2m_min[index]}°C</p>
                    <p><i class="fas fa-sun"></i> Sunrise: ${new Date(daily.sunrise[index] * 1000).toLocaleTimeString()}</p>
                    <p><i class="fas fa-sun"></i> Sunset: ${new Date(daily.sunset[index] * 1000).toLocaleTimeString()}</p>
                    <p><i class="fas fa-cloud-rain"></i> Precipitation: ${daily.precipitation_sum[index]} mm</p>
                    <p><i class="fas fa-cloud-sun"></i> Weather Condition: ${getWeatherDescription(daily.weather_code[index])}</p>
                </div>
                <hr>
            `;
            dailyInfo.innerHTML += dayData;
        });
    }

    function handleTabClick(event) {
        const targetId = event.target.getAttribute('data-target');

        // Remove active class from all tab buttons and contents
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => {
            if (content.id === targetId) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Add active class to the clicked tab button
        event.target.classList.add('active');
    }

    function toggleInputArea() {
        inputArea.classList.toggle('hidden');
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });

    fetchWeatherButton.addEventListener('click', fetchWeatherData);
    header.addEventListener('click', toggleInputArea); // Add click event to header
});
