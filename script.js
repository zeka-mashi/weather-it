document.addEventListener(
    "DOMContentLoaded",
    function () {
        var map = L.map("map").setView([37.7749, -122.4194], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
        }).addTo(map);
        L.marker([37.7749, -122.4194]).addTo(map);
        getWeather();
    },
    false
);

async function getWeather() {
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
    } catch (error) {
        //handle error
        console.log(error);
    }
}
