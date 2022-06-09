class Weather {
    constructor(city, country, type, icon, desc, feels_like, temp, high, low) {
        this.city = city;
        this.country = country;
        this.type = type;
        this.icon = icon;
        this.desc = desc;
        this.feels_like = feels_like;
        this.temp = temp;
        this.high = high;
        this.low = low;
    }
}

const interactiveMap = (() => {
    let map;
    let layer;
    const setMap = (lat, lon) => {
        if (map) {
            map.setView([lat, lon], 12);
            layer.clearLayers();
        } else {
            map = L.map("map").setView([lat, lon], 12);
            layer = L.layerGroup().addTo(map);
        }
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
        }).addTo(map);
        L.marker([lat, lon]).addTo(layer);
    };
    return { setMap };
})();

const forecast = (() => {
    let weather;
    let fahrenheit = true;
    const setWeather = (
        city,
        country,
        type,
        icon,
        desc,
        feels_like,
        temp,
        high,
        low
    ) => {
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
            type,
            icon,
            desc,
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
    const fetchWeather = async (city) => {
        const loading = document.querySelector(".loading");
        loading.classList.remove("hidden");
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=21f4d3accb72400f5b07454c7190562f`,
            { mode: "cors" }
        );
        try {
            const data = await response.json();
            if (data.cod != "200") {
                throw new Error(data.message);
            }
            console.log(data);
            const last_updated = document.querySelector("#local_time");
            last_updated.textContent = new Date().toLocaleTimeString();
            setWeather(
                data.name,
                data.sys.country,
                data.weather[0].main,
                data.weather[0].icon,
                data.weather[0].description,
                data.main.feels_like,
                data.main.temp,
                data.main.temp_max,
                data.main.temp_min
            );
            getWeather();
            interactiveMap.setMap(data.coord.lat, data.coord.lon);
            updateDOM();
        } catch (error) {
            //handle error
            alert(error);
        }
        loading.classList.add("hidden");
    };
    const updateUnit = (selection) => {
        // do nothing if unit is the same
        if (fahrenheit != selection) {
            fahrenheit = selection;
            console.log("updated to", selection);
            updateWeather();
            updateDOM();
        }
    };
    const updateWeather = () => {
        if (!fahrenheit) {
            weather.feels_like = ((weather.feels_like - 32) * (5 / 9)).toFixed(
                1
            );
            weather.temp = ((weather.temp - 32) * (5 / 9)).toFixed(1);
            weather.high = ((weather.high - 32) * (5 / 9)).toFixed(1);
            weather.low = ((weather.low - 32) * (5 / 9)).toFixed(1);
        } else {
            weather.feels_like = (weather.feels_like * (9 / 5) + 32).toFixed(1);
            weather.temp = (weather.temp * (9 / 5) + 32).toFixed(1);
            weather.high = (weather.high * (9 / 5) + 32).toFixed(1);
            weather.low = (weather.low * (9 / 5) + 32).toFixed(1);
        }
    };
    const updateDOM = () => {
        const city = document.querySelector("#city");
        const country = document.querySelector("#country");
        const weather_icon = document.querySelector("#weather_icon");
        const feels_like = document.querySelector("#temp_feels_like");
        const temp = document.querySelector("#temp");
        const temp_high = document.querySelector("#temp_high");
        const temp_low = document.querySelector("#temp_low");
        city.textContent = weather.city;
        country.textContent = weather.country;
        weather_icon.src = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        feels_like.textContent = "Feels like: " + weather.feels_like;
        temp.textContent = "Current temp: " + weather.temp;
        temp_high.textContent = "High: " + weather.high;
        temp_low.textContent = "Low: " + weather.low;
    };
    return { setWeather, getWeather, fetchWeather, updateUnit };
})();

function parseSearch(search) {
    if (search.value.length < 1) {
        alert("Please enter a city name!");
    } else {
        forecast.fetchWeather(search.value);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    function () {
        const f_btn = document.querySelector("#fahrenheit");
        f_btn.addEventListener("click", (e) => {
            e.currentTarget.classList.add("active");
            e.currentTarget.previousElementSibling.classList.remove("active");
            forecast.updateUnit(true);
        });
        const c_btn = document.querySelector("#celcius");
        c_btn.addEventListener("click", (e) => {
            e.currentTarget.classList.add("active");
            e.currentTarget.nextElementSibling.classList.remove("active");
            forecast.updateUnit(false);
        });
        const search = document.querySelector("#search");
        const search_btn = document.querySelector("#search-btn");
        search_btn.addEventListener("click", () => parseSearch(search));
        search.addEventListener("keypress", (e) => {
            if (e.key == "Enter") {
                parseSearch(search);
            }
        });
        forecast.fetchWeather("San Francisco");
    },
    false
);
