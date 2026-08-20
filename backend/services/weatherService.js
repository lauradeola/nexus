const axios = require("axios");


async function getWeatherData(latitude, longitude) {

    try {

        const response = await axios.get(
            "https://api.open-meteo.com/v1/forecast",
            {
                params: {

                    latitude,

                    longitude,

                    current:
                    "temperature_2m,relative_humidity_2m,wind_speed_10m",

                    timezone:
                    "auto"

                }

            }
        );


        return response.data;


    } catch(error) {

        console.error(
            "Erro clima:",
            error.message
        );

        throw error;

    }

}


module.exports = {
    getWeatherData
};