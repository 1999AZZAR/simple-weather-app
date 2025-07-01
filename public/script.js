document.addEventListener('DOMContentLoaded', () => {
    const fetchWeatherButton = document.getElementById('fetch-weather-button');
    const useLocationButton = document.getElementById('use-location-button');
    const loadingIndicator = document.querySelector('.result-panel .loading');
    const header = document.getElementById('header');
    const inputArea = document.getElementById('input-area');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const timezoneInput = document.getElementById('timezone');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const resultPanel = document.querySelector('.result-panel');
    const themeToggleButton = document.getElementById('theme-toggle');
    const languageToggleButton = document.getElementById('language-toggle');
    const tabsContainer = document.querySelector('.tabs');

    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    function moveActiveTabIndicator(target) {
        if (!target) return;
        const left = target.offsetLeft;
        const width = target.offsetWidth;
        tabsContainer.style.setProperty('--left', `${left}px`);
        tabsContainer.style.setProperty('--width', `${width}px`);
    }

    function setTeam(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggleButton.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    languageToggleButton.addEventListener('click', () => {
        const currentLang = languageToggleButton.getAttribute('data-lang');
        const newLang = currentLang === 'en' ? 'id' : 'en';
        languageToggleButton.setAttribute('data-lang', newLang);
        languageToggleButton.textContent = newLang.toUpperCase();
        localStorage.setItem('language', newLang);
        updateUIText(newLang);
    });

    themeToggleButton.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        setTeam(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTeam(savedTheme);

    // Load saved language
    const savedLang = localStorage.getItem('language') || 'en';
    languageToggleButton.setAttribute('data-lang', savedLang);
    languageToggleButton.textContent = savedLang.toUpperCase();
    updateUIText(savedLang);

    function getApiUrl(latitude, longitude, timezone) {
        const encodedTimezone = encodeURIComponent(timezone);
        return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,visibility,wind_speed_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timeformat=unixtime&timezone=${encodedTimezone}&past_days=2&forecast_days=14`;
    }

    async function fetchWeatherData(latitude, longitude, timezone) {
        if (!latitude || !longitude || !timezone) {
            alert('Please provide latitude, longitude, and time zone.');
            return;
        }

        const cacheKey = `weather-${latitude}-${longitude}`;
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
            displayAllWeatherData(cachedData);
            return;
        }

        const apiUrl = getApiUrl(latitude, longitude, timezone);
        
        // Hide weather content and show loader
        tabContents.forEach(content => content.style.display = 'none');
        loadingIndicator.classList.remove('hidden');

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Weather data not found.');
            const data = await response.json();
            setCachedData(cacheKey, data);
            displayAllWeatherData(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please check the coordinates and try again.');
            loadingIndicator.classList.add('hidden'); // Hide loader on error
        } finally {
            // Loader is hidden inside displayAllWeatherData or the catch block
        }
    }

    function displayAllWeatherData(data) {
        loadingIndicator.classList.add('hidden'); // Hide loader
        // Show the 'current' tab by default
        const currentTabButton = document.querySelector('.tab-button[data-target="current"]');
        const currentTabContent = document.getElementById('current');
        
        // Reset all tabs
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        // Activate current tab
        currentTabButton.classList.add('active');
        currentTabContent.classList.add('active');
        currentTabContent.style.display = 'block';
        moveActiveTabIndicator(currentTabButton);
        
        displayCurrentWeather(data.current, data.current_units);
        displayHourlyWeather(data.hourly, data.hourly_units);
        displayDailyWeather(data.daily, data.daily_units);
        updateCurrentTime();
    }
    
    function getCachedData(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const now = new Date();
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        displayAllWeatherData(item.value);
        return item.value;
    }

    function setCachedData(key, value) {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + CACHE_DURATION,
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    function updateCurrentTime() {
        const now = new Date();
        document.getElementById('current-time').innerText = `Local Time: ${now.toLocaleTimeString()}`;
    }

    function getWeatherIcon(weatherCode, isDay) {
        // Simplified icon mapping
        if (weatherCode <= 1) return isDay ? 'fa-sun' : 'fa-moon';
        if (weatherCode <= 3) return isDay ? 'fa-cloud-sun' : 'fa-cloud-moon';
        if (weatherCode <= 48) return 'fa-smog';
        if (weatherCode <= 67) return 'fa-cloud-showers-heavy';
        if (weatherCode <= 77) return 'fa-snowflake';
        if (weatherCode <= 86) return 'fa-cloud-showers-heavy'; // Using same for rain/snow showers
        if (weatherCode <= 99) return 'fa-bolt';
        return 'fa-question-circle';
    }
    
    function getWeatherDescription(weatherCode) {
        const descriptions = {
            0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
            45: 'Fog', 48: 'Depositing rime fog',
            51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
            56: 'Light Freezing Drizzle', 57: 'Dense Freezing Drizzle',
            61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
            66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain',
            71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
            77: 'Snow Grains',
            80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
            85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
            95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Thunderstorm with Heavy Hail'
        };
        return descriptions[weatherCode] || 'Unknown';
    }

    function displayCurrentWeather(current, units) {
        const currentLang = localStorage.getItem('language') || 'en';
        const icon = getWeatherIcon(current.weather_code, current.is_day);
        document.getElementById('current-weather-code').innerHTML = `<i class="fas ${icon}"></i> ${getWeatherDescription(current.weather_code)}`;
        document.getElementById('current-temperature').innerHTML = `<i class="fas fa-temperature-half"></i> ${translations[currentLang].Temperature}: ${current.temperature_2m}${units.temperature_2m}`;
        document.getElementById('current-apparent-temperature').innerHTML = `<i class="fas fa-street-view"></i> ${translations[currentLang]["Feels Like"]}: ${current.apparent_temperature}${units.apparent_temperature}`;
        document.getElementById('current-humidity').innerHTML = `<i class="fas fa-tint"></i> ${translations[currentLang].Humidity}: ${current.relative_humidity_2m}${units.relative_humidity_2m}`;
        document.getElementById('current-precipitation').innerHTML = `<i class="fas fa-cloud-rain"></i> ${translations[currentLang].Precipitation}: ${current.precipitation}${units.precipitation}`;
        document.getElementById('current-pressure').innerHTML = `<i class="fas fa-gauge-high"></i> ${translations[currentLang].Pressure}: ${current.surface_pressure}${units.surface_pressure}`;
        document.getElementById('current-wind-speed').innerHTML = `<i class="fas fa-wind"></i> ${translations[currentLang]["Wind Speed"]}: ${current.wind_speed_10m}${units.wind_speed_10m}`;
        document.getElementById('current-wind-direction').innerHTML = `<i class="fas fa-compass"></i> ${translations[currentLang]["Wind Direction"]}: ${current.wind_direction_10m}${units.wind_direction_10m}`;
        document.getElementById('current-cloud-cover').innerHTML = `<i class="fas fa-cloud"></i> ${translations[currentLang]["Cloud Cover"]}: ${current.cloud_cover}${units.cloud_cover}`;
    }

    function displayHourlyWeather(hourly, units) {
        const hourlyInfo = document.getElementById('hourly-info');
        hourlyInfo.innerHTML = '';
        hourly.time.slice(0, 24).forEach((time, index) => { // Show next 24 hours
            const icon = getWeatherIcon(hourly.weather_code[index], hourly.is_day[index]);
            const hourCard = `
                <div class="hour-card">
                    <strong>${new Date(time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    <p><i class="fas ${icon}"></i> ${getWeatherDescription(hourly.weather_code[index])}</p>
                    <p><i class="fas fa-thermometer-half"></i> ${hourly.temperature_2m[index]}${units.temperature_2m}</p>
                    <p><i class="fas fa-tint"></i> ${hourly.relative_humidity_2m[index]}${units.relative_humidity_2m}</p>
                    <p><i class="fas fa-eye"></i> ${hourly.visibility[index] / 1000}${units.visibility.replace('m', 'km')}</p>
                </div>`;
            hourlyInfo.innerHTML += hourCard;
        });
    }

    function displayDailyWeather(daily, units) {
        const dailyInfo = document.getElementById('daily-info');
        dailyInfo.innerHTML = '';
        const currentLang = localStorage.getItem('language') || 'en';
        daily.time.forEach((time, index) => {
            const icon = getWeatherIcon(daily.weather_code[index], true); // Assume day for daily icon
            const dayCard = `
                <div class="day-card">
                    <strong>${new Date(time * 1000).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</strong>
                    <p><i class="fas ${icon}"></i> ${getWeatherDescription(daily.weather_code[index])}</p>
                    <p><i class="fas fa-temperature-high"></i> ${translations[currentLang].Max}: ${daily.temperature_2m_max[index]}${units.temperature_2m_max}</p>
                    <p><i class="fas fa-temperature-low"></i> ${translations[currentLang].Min}: ${daily.temperature_2m_min[index]}${units.temperature_2m_min}</p>
                    <p><i class="fas fa-umbrella"></i> ${translations[currentLang].Rain}: ${daily.precipitation_sum[index]}${units.precipitation_sum}</p>
                    <p><i class="fas fa-sunrise"></i> ${translations[currentLang].Sunrise}: ${new Date(daily.sunrise[index] * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><i class="fas fa-sunset"></i> ${translations[currentLang].Sunset}: ${new Date(daily.sunset[index] * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>`;
            dailyInfo.innerHTML += dayCard;
        });
    }

    function handleTabClick(event) {
        const targetId = event.target.getAttribute('data-target');
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        event.target.classList.add('active');
        moveActiveTabIndicator(event.target);
        const targetContent = document.getElementById(targetId);
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
    }

    useLocationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            // No need to hide loader here, it's handled by display logic
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                latitudeInput.value = latitude.toFixed(4);
                longitudeInput.value = longitude.toFixed(4);
                // Guess timezone, user can override
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                timezoneInput.value = timezone;
                fetchWeatherData(latitude.toFixed(4), longitude.toFixed(4), timezone);
            }, error => {
                console.error('Geolocation error:', error);
                alert('Could not retrieve your location.');
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });
    
    fetchWeatherButton.addEventListener('click', () => {
        fetchWeatherData(latitudeInput.value, longitudeInput.value, timezoneInput.value);
    });

    header.addEventListener('click', () => inputArea.classList.toggle('hidden'));
    tabButtons.forEach(button => button.addEventListener('click', handleTabClick));

    // Initial position for the tab indicator
    const initialActiveTab = document.querySelector('.tab-button.active');
    if (initialActiveTab) {
        moveActiveTabIndicator(initialActiveTab);
    }
});
