# Modern Weather App

This is a sleek, responsive, and feature-rich weather forecast application designed with a modern glassmorphism aesthetic. It provides users with current, hourly, and daily weather information for any location worldwide.

## ✨ Key Features

- **Modern & Professional UI:** A beautiful glassmorphism design with a dual-card layout that separates controls from results.
- **Responsive Design:** The layout is fully responsive and looks great on both desktop and mobile devices.
- **Light & Dark Modes:** Switch between light and dark themes for optimal viewing comfort. Your preference is saved locally.
- **Multi-Language Support:** The interface supports both **English** and **Indonesian**. Your language choice is also saved.
- **Geolocation:** Instantly fetch weather for your current location with a single click.
- **Efficient Caching:** Weather data is cached for 10 minutes to reduce redundant API calls and provide a faster experience.
- **Detailed Forecasts:**
  - **Current:** Detailed information including temperature, "feels like" temperature, humidity, precipitation, pressure, wind speed, and wind direction.
  - **Hourly:** A 24-hour forecast with temperature, conditions, and humidity.
  - **Daily:** A 14-day forecast including max/min temperatures, precipitation, sunrise, and sunset times.
- **Skeleton Loader:** A smooth skeleton loading animation provides a better user experience while data is being fetched.
- **Dynamic UI:** Features modern, interactive elements like a sliding tab control.

## 🚀 How to Run

This project uses `lite-server` to run a local development server.

1.  **Navigate to the project directory:**
    ```bash
    cd path/to/simple-weather-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    npm start
    ```
    This will automatically open the application in your default web browser.

## 🛠️ Technologies Used

- **HTML5**
- **CSS3** (with modern features like Grid, Flexbox, and custom properties)
- **Vanilla JavaScript** (ES6+)
- **Node.js / npm:** For dependency management and running the local server.
- **lite-server:** As the development server.
- **Open-Meteo API:** For providing comprehensive weather data.
- **Font Awesome:** For icons.
- **Google Fonts:** For the "Poppins" font. 