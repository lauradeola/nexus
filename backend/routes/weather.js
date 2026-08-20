const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const latitude = -15.7939;
        const longitude = -47.8828;

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
            `&timezone=America%2FSao_Paulo`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Open-Meteo HTTP ${response.status}`);
        }

        const data = await response.json();

        res.json({
            status: "online",
            location: "Brasília",
            latitude,
            longitude,
            timezone: data.timezone,
            current: data.current
        });

    } catch (error) {
        console.error("Erro ao buscar clima:", error);

        res.status(500).json({
            status: "error",
            message: "Não foi possível obter os dados meteorológicos."
        });
    }
});

module.exports = router;