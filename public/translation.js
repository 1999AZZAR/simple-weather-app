const translations = {
    en: {
        // Control Panel
        "Weather App": "Weather App",
        "Latitude": "Latitude",
        "Longitude": "Longitude",
        "Time Zone": "Time Zone",
        "Fetch Weather": "Fetch Weather",
        "Use My Location": "Use My Location",
        "Current": "Current",
        "Hourly": "Hourly",
        "Daily": "Daily",

        // Results - General
        "Current Weather": "Current Weather",
        "Hourly Weather": "Hourly Weather",
        "Daily Weather": "Daily Weather",
        "Local Time": "Local Time",

        // Results - Current
        "Temperature": "Temperature",
        "Feels Like": "Feels Like",
        "Humidity": "Humidity",
        "Precipitation": "Precipitation",
        "Pressure": "Pressure",
        "Wind Speed": "Wind Speed",
        "Wind Direction": "Wind Direction",
        "Cloud Cover": "Cloud Cover",
        
        // Results - Daily
        "Max": "Max",
        "Min": "Min",
        "Rain": "Rain",
        "Sunrise": "Sunrise",
        "Sunset": "Sunset"
    },
    id: {
        // Control Panel
        "Weather App": "Aplikasi Cuaca",
        "Latitude": "Lintang",
        "Longitude": "Bujur",
        "Time Zone": "Zona Waktu",
        "Fetch Weather": "Ambil Cuaca",
        "Use My Location": "Gunakan Lokasi Saya",
        "Current": "Saat Ini",
        "Hourly": "Per Jam",
        "Daily": "Harian",

        // Results - General
        "Current Weather": "Cuaca Saat Ini",
        "Hourly Weather": "Cuaca Per Jam",
        "Daily Weather": "Cuaca Harian",
        "Local Time": "Waktu Lokal",

        // Results - Current
        "Temperature": "Suhu",
        "Feels Like": "Terasa Seperti",
        "Humidity": "Kelembaban",
        "Precipitation": "Presipitasi",
        "Pressure": "Tekanan",
        "Wind Speed": "Kecepatan Angin",
        "Wind Direction": "Arah Angin",
        "Cloud Cover": "Tutupan Awan",

        // Results - Daily
        "Max": "Maks",
        "Min": "Min",
        "Rain": "Hujan",
        "Sunrise": "Matahari Terbit",
        "Sunset": "Matahari Terbenam"
    }
};

function updateUIText(lang) {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        // For elements that have children (like the h2 titles)
        if (el.childNodes.length > 1 && el.querySelector('i')) {
            const icon = el.querySelector('i').outerHTML;
            el.innerHTML = `${icon} ${translations[lang][key]}`;
        } else if (el.tagName === 'P' && el.querySelector('i')) {
            // Handle paragraphs with icons and data
            const icon = el.querySelector('i').outerHTML;
            const textParts = el.innerText.split(':');
            const label = translations[lang][textParts[0].trim()];
            el.innerHTML = `${icon} ${label}: ${textParts.length > 1 ? textParts[1] : ''}`;
        } else {
            el.textContent = translations[lang][key];
        }
    });

    // Update placeholders
    document.getElementById('latitude').placeholder = lang === 'id' ? 'misal: -7.1167' : 'e.g., -7.1167';
    document.getElementById('longitude').placeholder = lang === 'id' ? 'misal: 112.4167' : 'e.g., 112.4167';
    document.getElementById('timezone').placeholder = lang === 'id' ? 'misal: Asia/Jakarta' : 'e.g., Asia/Bangkok';
} 