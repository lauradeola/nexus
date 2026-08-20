const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const url =
            "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`USGS HTTP ${response.status}`);
        }

        const data = await response.json();

        const earthquakes = data.features.map((item) => {
            const properties = item.properties;
            const coordinates = item.geometry.coordinates;

            return {
                id: item.id,
                magnitude: properties.mag,
                place: properties.place,
                time: properties.time,
                url: properties.url,
                longitude: coordinates[0],
                latitude: coordinates[1],
                depth: coordinates[2]
            };
        });

        res.json({
            status: "online",
            source: "USGS",
            updatedAt: new Date().toISOString(),
            total: earthquakes.length,
            earthquakes
        });

    } catch (error) {
        console.error("Erro ao buscar terremotos:", error);

        res.status(500).json({
            status: "error",
            message: "Não foi possível obter os dados de terremotos."
        });
    }
});

module.exports = router;