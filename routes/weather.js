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
router.post("/weather", async (req, res) => {

    const city = req.body.city;

    if (!city) {
        return res.render("index", {
            weather: null,
            error: "Please enter city name"
        });
    }

    try {

        const apiURL = 
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;


        const response = await axios.get(apiURL);

        const weatherData = response.data;


        res.render("index", {
            weather: weatherData,
            error: null
        });


    } catch (error) {

        console.log("Weather API Error:", error.message);

        res.render("index", {
            weather: null,
            error: "Unable to fetch weather. Check city name or API key."
        });

    }

});


module.exports = router;