class Weather {
    constructor(city, country, feels_like, temp, high, low) {
        this.city = city;
        this.country = country;
        this.feels_like = feels_like;
        this.temp = temp;
        this.high = high;
        this.low = low;
    }
}

function generateMap(lat, lon) {
    var map = L.map("map").setView([lat, lon], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
    }).addTo(map);
    L.marker([lat, lon]).addTo(map);
}

const forecast = (() => {
    let weather;
    let fahrenheit = true;
    const setWeather = (city, country, feels_like, temp, high, low) => {
        if (fahrenheit) {
            // array funcs?
            feels_like = (feels_like - 273.15) * (9 / 5) + 32;
            temp = (temp - 273.15) * (9 / 5) + 32;
            high = (high - 273.15) * (9 / 5) + 32;
            low = (low - 273.15) * (9 / 5) + 32;
        } else {
            feels_like = feels_like - 273.15;
            temp = temp - 273.15;
            high = high - 273.15;
            low = low - 273.15;
        }
        weather = new Weather(
            city,
            country,
            feels_like.toFixed(1),
            temp.toFixed(1),
            high.toFixed(1),
            low.toFixed(1)
        );
    };
    const getWeather = () => {
        console.log(weather);
        return weather;
    };
    const fetchWeather = async () => {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=San%20Francisco&appid=21f4d3accb72400f5b07454c7190562f`,
            { mode: "cors" }
        );
        try {
            const data = await response.json();
            if (data.cod == "404") {
                throw new Error(data.message);
            }
            console.log(data);
            const last_updated = document.querySelector("#local_time");
            last_updated.textContent = new Date().toLocaleTimeString();
            setWeather(
                data.name,
                data.sys.country,
                data.main.feels_like,
                data.main.temp,
                data.main.temp_max,
                data.main.temp_min
            );
            getWeather();
            generateMap(data.coord.lat, data.coord.lon);
            updateDOM();
        } catch (error) {
            //handle error
            console.log(error);
        }
    };
    const updateUnit = () => {
        fahrenheit = !fahrenheit;
        console.log("updated to", fahrenheit);
        updateWeather();
    };
    const updateWeather = () => {
        if (fahrenheit) {
            weather.feels_like = ((weather.feels_like - 32) * (5 / 9)).toFixed(
                1
            );
            weather.temp = ((weather.temp - 32) * (5 / 9)).toFixed(1);
            weather.high = ((weather.high - 32) * (5 / 9)).toFixed(1);
            weather.low = ((weather.low - 32) * (5 / 9)).toFixed(1);
        } else {
            weather.feels_like = (weather.feels_like * (5 / 9) + 32).toFixed(1);
            weather.temp = (weather.temp * (5 / 9) + 32).toFixed(1);
            weather.high = (weather.high * (5 / 9) + 32).toFixed(1);
            weather.low = (weather.low * (5 / 9) + 32).toFixed(1);
        }
    };
    const updateDOM = () => {
        const feels_like = document.querySelector("#temp_feels_like");
        const temp = document.querySelector("#temp");
        const temp_high = document.querySelector("#temp_high");
        const temp_low = document.querySelector("#temp_low");
        feels_like.textContent = weather.feels_like;
        temp.textContent = weather.temp;
        temp_high.textContent = weather.high;
        temp_low.textContent = weather.low;
    };
    return { setWeather, getWeather, fetchWeather, updateUnit };
})();

document.addEventListener(
    "DOMContentLoaded",
    function () {
        const temp_btns = document.querySelectorAll(".temp");
        for (let i = 0; i < temp_btns.length; i++) {
            temp_btns[i].addEventListener("click", function () {
                forecast.updateUnit();
            });
        }
        forecast.fetchWeather();
    },
    false
);
