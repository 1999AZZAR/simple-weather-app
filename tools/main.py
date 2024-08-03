import requests

def fetch_weather_data():
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": -7.1167,
        "longitude": 112.4167,
        "current": "temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code",
        "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code"
    }

    response = requests.get(url, params=params)
    data = response.json()

    current_weather = data["current"]
    hourly_weather = data["hourly"]

    current_data = {
        "time": current_weather["time"],
        "temperature": current_weather["temperature_2m"],
        "humidity": current_weather["relative_humidity_2m"],
        "precipitation": current_weather["precipitation"]
    }

    hourly_data = [
        {
            "time": hourly_weather["time"][i],
            "temperature": hourly_weather["temperature_2m"][i],
            "humidity": hourly_weather["relative_humidity_2m"][i],
            "precipitation_probability": hourly_weather["precipitation_probability"][i]
        }
        for i in range(len(hourly_weather["time"]))
    ]

    return current_data, hourly_data

def display_weather_data():
    current_data, hourly_data = fetch_weather_data()

    print("Current Weather:")
    print(f"Time: {current_data['time']}")
    print(f"Temperature: {current_data['temperature']} °C")
    print(f"Humidity: {current_data['humidity']} %")
    print(f"Precipitation: {current_data['precipitation']} mm")

    print("\nHourly Weather:")
    for hourly in hourly_data:
        print(f"Time: {hourly['time']}")
        print(f"Temperature: {hourly['temperature']} °C")
        print(f"Humidity: {hourly['humidity']} %")
        print(f"Precipitation Probability: {hourly['precipitation_probability']} %")
        print()

if __name__ == "__main__":
    display_weather_data()

