const axios = require("axios");


async function getEarthquakeData() {

    try {

        const response = await axios.get(
            "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
        );


        const events = response.data.features.map(event => {

            return {

                id: event.id,

                magnitude:
                event.properties.mag,

                place:
                event.properties.place,

                time:
                new Date(
                    event.properties.time
                ).toISOString(),

                coordinates: {

                    longitude:
                    event.geometry.coordinates[0],

                    latitude:
                    event.geometry.coordinates[1],

                    depth:
                    event.geometry.coordinates[2]

                }

            };

        });


        return {

            source: "USGS",

            total: events.length,

            events

        };


    } catch(error) {

        console.error(
            "Erro terremotos:",
            error.message
        );

        throw error;

    }

}


module.exports = {
    getEarthquakeData
};