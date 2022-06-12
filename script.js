class Weather {
    constructor(
        city,
        country,
        type,
        icon,
        desc,
        feels_like,
        temp,
        high,
        low,
        wind_speed,
        humidity,
        clouds,
        rain,
        snow,
        sunrise,
        sunset
    ) {
        this.city = city;
        this.country = country;
        this.type = type;
        this.icon = icon;
        this.desc = desc;
        this.feels_like = feels_like;
        this.temp = temp;
        this.high = high;
        this.low = low;
        this.wind_speed = wind_speed;
        this.humidity = humidity;
        this.clouds = clouds;
        this.rain = rain;
        this.snow = snow;
        this.sunrise = sunrise;
        this.sunset = sunset;
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
    let fahrenheit = loadSettings("lastDegree", [true]);
    let degree = fahrenheit ? "°F" : "°C";
    let metric = fahrenheit ? "mph" : "m/s";
    const checkSelection = () => {
        if (!fahrenheit) {
            const c_temp_type = document.querySelector("#celcius");
            c_temp_type.classList.add("active");
        } else {
            const f_temp_type = document.querySelector("#fahrenheit");
            f_temp_type.classList.add("active");
        }
    };
    const setWeather = (
        city,
        country,
        type,
        icon,
        desc,
        feels_like,
        temp,
        high,
        low,
        wind_speed,
        humidity,
        clouds,
        rain,
        snow,
        sunrise,
        sunset
    ) => {
        if (fahrenheit) {
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
            feels_like,
            temp,
            high,
            low,
            wind_speed,
            humidity,
            clouds,
            rain,
            snow,
            sunrise,
            sunset
        );
    };
    const safeParse = (data, prop) => {
        return data ? data[prop] : null;
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
                data.main.temp_min,
                safeParse(data.wind, "speed"),
                safeParse(data.main, "humidity"),
                safeParse(data.clouds, "all"),
                safeParse(data.rain, "1h"),
                safeParse(data.snow, "1h"),
                data.sys.sunrise,
                data.sys.sunset
            );
            saveSettings("lastCity", [data.name]);
            interactiveMap.setMap(data.coord.lat, data.coord.lon);
            updateDOM((newMessage = true));
        } catch (error) {
            //handle error
            alert(error);
        }
        loading.classList.add("hidden");
    };
    const updateUnit = (selection) => {
        // do nothing if unit is the same
        if (fahrenheit != selection) {
            degree = fahrenheit ? "°C" : "°F";
            metric = fahrenheit ? "m/s" : "mph";
            fahrenheit = selection;
            updateWeather();
            updateDOM();
        }
        saveSettings("lastDegree", [selection]);
    };
    const updateWeather = () => {
        if (!fahrenheit) {
            weather.feels_like = (weather.feels_like - 32) * (5 / 9);
            weather.temp = (weather.temp - 32) * (5 / 9);
            weather.high = (weather.high - 32) * (5 / 9);
            weather.low = (weather.low - 32) * (5 / 9);
            weather.wind_speed = weather.wind_speed / 2.237;
        } else {
            weather.feels_like = weather.feels_like * (9 / 5) + 32;
            weather.temp = weather.temp * (9 / 5) + 32;
            weather.high = weather.high * (9 / 5) + 32;
            weather.low = weather.low * (9 / 5) + 32;
            weather.wind_speed = weather.wind_speed * 2.237;
        }
    };
    const updateDOM = (newMessage) => {
        const city = document.querySelector("#city");
        const country = document.querySelector("#country");
        const weather_icon = document.querySelector("#weather_icon");
        const status = document.querySelector("#status");
        const feels_like = document.querySelector("#temp_feels_like");
        const temp = document.querySelector("#temp");
        const temp_high = document.querySelector("#temp_high");
        const temp_low = document.querySelector("#temp_low");
        const wind_speed = document.querySelector("#wind_speed");
        const humidity = document.querySelector("#humidity");
        const sunrise = document.querySelector("#sunrise");
        const sunset = document.querySelector("#sunset");
        city.textContent = weather.city;
        if (weather.country) {
            country.textContent = `, ` + weather.country;
        }
        weather_icon.src = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        if (newMessage) {
            if (weather.desc) {
                let messages = [
                    `Seems like ${weather.desc} everywhere`,
                    `Oh look... ${weather.desc}`,
                    `Yet another ${weather.desc} day`,
                    `Yet another day of ${weather.desc}`,
                    `Will there ever be a non-${weather.desc} day?`,
                    `If I look outside, maybe there's ${weather.desc}`,
                    `If you wanted ${weather.desc}, you got ${weather.desc}`,
                    `A ${weather.desc} day could be the best day`,
                    `Repeat after me: ${weather.desc} out there`,
                ];
                status.textContent =
                    messages[Math.floor(Math.random() * messages.length)];
            }
        }
        feels_like.innerHTML = `<span class="temp-text">Feels like</span><br><span>${parseFloat(
            weather.feels_like
        ).toFixed(1)} ${degree}</span>`;
        temp.innerHTML = `<span class="temp-text">Current temp</span><br><span>${parseFloat(
            weather.temp
        ).toFixed(1)} ${degree}</span>`;
        temp_high.innerHTML = `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5H11A1 1 0 0 1 12 4Z" />
            </svg><span>${parseFloat(weather.high).toFixed(
                1
            )} ${degree}</span>`;
        temp_low.innerHTML = `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V12H11V5A1 1 0 0 1 12 4Z" />
            </svg><span>${parseFloat(weather.low).toFixed(1)} ${degree}</span>`;
        wind_speed.innerHTML = `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4,10A1,1 0 0,1 3,9A1,1 0 0,1 4,8H12A2,2 0 0,0 14,6A2,2 0 0,0 12,4C11.45,4 10.95,4.22 10.59,4.59C10.2,5 9.56,5 9.17,4.59C8.78,4.2 8.78,3.56 9.17,3.17C9.9,2.45 10.9,2 12,2A4,4 0 0,1 16,6A4,4 0 0,1 12,10H4M19,12A1,1 0 0,0 20,11A1,1 0 0,0 19,10C18.72,10 18.47,10.11 18.29,10.29C17.9,10.68 17.27,10.68 16.88,10.29C16.5,9.9 16.5,9.27 16.88,8.88C17.42,8.34 18.17,8 19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14H5A1,1 0 0,1 4,13A1,1 0 0,1 5,12H19M18,18H4A1,1 0 0,1 3,17A1,1 0 0,1 4,16H18A3,3 0 0,1 21,19A3,3 0 0,1 18,22C17.17,22 16.42,21.66 15.88,21.12C15.5,20.73 15.5,20.1 15.88,19.71C16.27,19.32 16.9,19.32 17.29,19.71C17.47,19.89 17.72,20 18,20A1,1 0 0,0 19,19A1,1 0 0,0 18,18Z" />
            </svg><span>${parseFloat(weather.wind_speed).toFixed(
                1
            )} ${metric}</span>`;
        humidity.innerHTML = `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,3.77L11.25,4.61C11.25,4.61 9.97,6.06 8.68,7.94C7.39,9.82 6,12.07 6,14.23A6,6 0 0,0 12,20.23A6,6 0 0,0 18,14.23C18,12.07 16.61,9.82 15.32,7.94C14.03,6.06 12.75,4.61 12.75,4.61L12,3.77M12,6.9C12.44,7.42 12.84,7.85 13.68,9.07C14.89,10.83 16,13.07 16,14.23C16,16.45 14.22,18.23 12,18.23C9.78,18.23 8,16.45 8,14.23C8,13.07 9.11,10.83 10.32,9.07C11.16,7.85 11.56,7.42 12,6.9Z" />
            </svg><span>${weather.humidity}%</span>`;
        sunrise.innerHTML = `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M12.71,16.3L15.82,19.41C16.21,19.8 16.21,20.43 15.82,20.82C15.43,21.21 14.8,21.21 14.41,20.82L12,18.41L9.59,20.82C9.2,21.21 8.57,21.21 8.18,20.82C7.79,20.43 7.79,19.8 8.18,19.41L11.29,16.3C11.5,16.1 11.74,16 12,16C12.26,16 12.5,16.1 12.71,16.3Z" />
            </svg><span>${new Date(weather.sunrise * 1000).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
            )}</span>`;
        sunset.innerHTML = `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M5,16H19A1,1 0 0,1 20,17A1,1 0 0,1 19,18H5A1,1 0 0,1 4,17A1,1 0 0,1 5,16M17,20A1,1 0 0,1 18,21A1,1 0 0,1 17,22H7A1,1 0 0,1 6,21A1,1 0 0,1 7,20H17M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7Z" />
            </svg><span>${new Date(weather.sunset * 1000).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
            )}</span>`;
    };
    return { checkSelection, fetchWeather, updateUnit };
})();

function parseSearch(search) {
    if (search.value.length < 1) {
        alert("Please enter a city name!");
    } else {
        forecast.fetchWeather(search.value);
    }
}

function loadSettings(key, fallback) {
    const item = JSON.parse(localStorage.getItem(key)) || fallback;
    return item[0];
}

function saveSettings(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
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
        forecast.checkSelection();
        let lastCity = loadSettings("lastCity", ["San Francisco"]);
        search.value = lastCity;
        forecast.fetchWeather(lastCity);
    },
    false
);
