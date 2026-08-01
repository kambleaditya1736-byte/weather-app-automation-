const express = require("express");
const axios = require("axios");

const router = express.Router();

const API_KEY = process.env.OPENWEATHER_API_KEY;


// Home Page
router.get("/", (req, res) => {
    res.render("index", {
        weather: null,
        error: null
    });
});


// Search Weather
router.get("/api/weather", async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({
            error: "City is required"
        });
    }

    try {

        const apiURL =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

        const response = await axios.get(apiURL);

        const data = response.data;

        res.json({
            weather: {
                city: data.name,
                description: data.weather[0].description,
                temperature: data.main.temp,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                lat: data.coord.lat,
                lon: data.coord.lon,
                icon: "🌤️",
                lastUpdated: new Date()
            }
        });

    } catch (err) {

        res.status(500).json({
            error: "Unable to fetch weather",
            errorDetails: err.message
        });

    }
});


module.exports = router;