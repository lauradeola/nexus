let map = null;

let earthquakeMarkers = null;



// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "NEXUS FRONTEND INITIALIZING..."
        );


        initializeMap();

        loadBackendStatus();

        loadWeather();

        loadEarthquakes();


        // Atualização automática

        setInterval(
            loadWeather,
            5 * 60 * 1000
        );


        setInterval(
            loadEarthquakes,
            5 * 60 * 1000
        );

    }
);



// ======================================================
// MAPA
// ======================================================

function initializeMap() {

    const mapElement =
        document.getElementById(
            "map"
        );


    if (!mapElement) {

        console.error(
            "Elemento #map não encontrado."
        );

        return;

    }


    map =
        L.map(
            "map"
        ).setView(
            [
                10,
                0
            ],
            2
        );


    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {

            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap &copy; CARTO"

        }
    ).addTo(map);


    earthquakeMarkers =
        L.layerGroup().addTo(map);


    console.log(
        "MAP INITIALIZED"
    );

}



// ======================================================
// BACKEND STATUS
// ======================================================

async function loadBackendStatus() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/"
            );


        if (!response.ok) {

            throw new Error(
                "Backend offline"
            );

        }


        const data =
            await response.json();


        console.log(
            "BACKEND:",
            data
        );


        setText(
            "systemStatus",
            "ONLINE"
        );


    } catch (error) {

        console.error(
            "BACKEND ERROR:",
            error
        );


        setText(
            "systemStatus",
            "OFFLINE"
        );

    }

}



// ======================================================
// WEATHER
// ======================================================

async function loadWeather() {

    try {

        console.log(
            "Loading weather..."
        );


        const data =
            await getWeather();


        console.log(
            "WEATHER DATA:",
            data
        );


        if (
            !data ||
            !data.current
        ) {

            throw new Error(
                "Resposta de clima inválida."
            );

        }


        const current =
            data.current;


        const temperature =
            current.temperature_2m;


        const feels =
            current.apparent_temperature;


        const humidity =
            current.relative_humidity_2m;


        const wind =
            current.wind_speed_10m;


        const code =
            current.weather_code;


        setText(
            "temperature",
            `${round(temperature)}°C`
        );


        setText(
            "weatherTemp",
            `${round(temperature)}°C`
        );


        setText(
            "weatherFeels",
            `${round(feels)}°C`
        );


        setText(
            "weatherHumidity",
            `${round(humidity)}%`
        );


        setText(
            "weatherWind",
            `${round(wind)} km/h`
        );


        setText(
            "weatherDescription",
            weatherDescription(code)
        );


        if (current.time) {

            const date =
                new Date(
                    current.time
                );


            setText(
                "weatherTime",
                date.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
            );

        }


    } catch (error) {

        console.error(
            "WEATHER ERROR:",
            error
        );


        setText(
            "weatherDescription",
            "API indisponível"
        );

    }

}



// ======================================================
// EARTHQUAKES
// ======================================================

async function loadEarthquakes() {

    try {

        console.log(
            "Loading earthquakes..."
        );


        const data =
            await getEarthquakes();


        console.log(
            "EARTHQUAKE DATA:",
            data
        );


        if (
            !data ||
            !Array.isArray(
                data.earthquakes
            )
        ) {

            throw new Error(
                "Resposta de terremotos inválida."
            );

        }


        const earthquakes =
            data.earthquakes;


        setText(
            "earthquakeCount",
            earthquakes.length
        );


        updateThreat(
            earthquakes
        );


        renderMapMarkers(
            earthquakes
        );


        renderEvents(
            earthquakes
        );


    } catch (error) {

        console.error(
            "EARTHQUAKE ERROR:",
            error
        );


        setText(
            "earthquakeCount",
            "--"
        );


        const events =
            document.getElementById(
                "events"
            );


        if (events) {

            events.innerHTML = `
                <div class="loading error">
                    Não foi possível carregar os eventos.
                </div>
            `;

        }

    }

}



// ======================================================
// MAP MARKERS
// ======================================================

function renderMapMarkers(
    earthquakes
) {

    if (
        !map ||
        !earthquakeMarkers
    ) {

        return;

    }


    earthquakeMarkers.clearLayers();


    earthquakes
        .filter(
            earthquake =>
                Number.isFinite(
                    earthquake.latitude
                ) &&
                Number.isFinite(
                    earthquake.longitude
                )
        )
        .slice(
            0,
            200
        )
        .forEach(
            earthquake => {


                const magnitude =
                    Number(
                        earthquake.magnitude
                    ) || 0;


                const radius =
                    Math.max(
                        4,
                        Math.min(
                            18,
                            magnitude * 2.5
                        )
                    );


                const color =
                    getMagnitudeColor(
                        magnitude
                    );


                const marker =
                    L.circleMarker(
                        [
                            earthquake.latitude,
                            earthquake.longitude
                        ],
                        {

                            radius,

                            color,

                            fillColor: color,

                            fillOpacity: 0.55,

                            weight: 1

                        }
                    );


                marker.bindPopup(`
                    <div style="
                        font-family: Arial;
                        min-width: 180px;
                    ">

                        <strong>
                            Magnitude ${magnitude}
                        </strong>

                        <br><br>

                        ${escapeHTML(
                            earthquake.place ||
                            "Unknown location"
                        )}

                        <br><br>

                        Depth:
                        ${round(
                            earthquake.depth
                        )} km

                    </div>
                `);


                marker.addTo(
                    earthquakeMarkers
                );

            }
        );

}



// ======================================================
// EVENT LIST
// ======================================================

function renderEvents(
    earthquakes
) {

    const container =
        document.getElementById(
            "events"
        );


    if (!container) {

        return;

    }


    if (
        earthquakes.length === 0
    ) {

        container.innerHTML = `
            <div class="loading">
                Nenhum evento registrado nas últimas 24 horas.
            </div>
        `;

        return;

    }


    const visible =
        earthquakes.slice(
            0,
            15
        );


    container.innerHTML =
        visible.map(
            earthquake => {


                const magnitude =
                    Number(
                        earthquake.magnitude
                    ) || 0;


                const severity =
                    getSeverity(
                        magnitude
                    );


                return `

                    <div class="event-row">

                        <div
                            class="event-indicator ${severity}"
                        ></div>


                        <div class="event-info">

                            <strong>
                                SEISMIC EVENT
                            </strong>

                            <span>
                                ${escapeHTML(
                                    earthquake.place ||
                                    "Unknown location"
                                )}
                            </span>

                        </div>


                        <div class="event-magnitude">

                            <strong>
                                M ${magnitude}
                            </strong>

                            <span>
                                ${formatTime(
                                    earthquake.time
                                )}
                            </span>

                        </div>

                    </div>

                `;

            }
        ).join("");

}



// ======================================================
// THREAT LEVEL
// ======================================================

function updateThreat(
    earthquakes
) {

    const threat =
        document.getElementById(
            "threatLevel"
        );


    if (!threat) {

        return;

    }


    const critical =
        earthquakes.some(
            earthquake =>
                Number(
                    earthquake.magnitude
                ) >= 6
        );


    const elevated =
        earthquakes.some(
            earthquake =>
                Number(
                    earthquake.magnitude
                ) >= 5
        );


    if (critical) {

        threat.textContent =
            "CRITICAL";

        threat.className =
            "stat-number critical";

    } else if (elevated) {

        threat.textContent =
            "ELEVATED";

        threat.className =
            "stat-number warning";

    } else {

        threat.textContent =
            "LOW";

        threat.className =
            "stat-number online";

    }

}



// ======================================================
// HELPERS
// ======================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}



function round(
    value
) {

    const number =
        Number(value);


    if (
        Number.isNaN(
            number
        )
    ) {

        return "--";

    }


    return number.toFixed(1);

}



function formatTime(
    timestamp
) {

    if (!timestamp) {

        return "--";

    }


    const date =
        new Date(
            timestamp
        );


    return date.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}



function weatherDescription(
    code
) {

    const descriptions = {

        0: "Céu limpo",

        1: "Principalmente limpo",

        2: "Parcialmente nublado",

        3: "Nublado",

        45: "Neblina",

        48: "Neblina",

        51: "Garoa leve",

        53: "Garoa moderada",

        55: "Garoa intensa",

        61: "Chuva leve",

        63: "Chuva moderada",

        65: "Chuva forte",

        71: "Neve leve",

        73: "Neve moderada",

        75: "Neve forte",

        80: "Pancadas leves",

        81: "Pancadas moderadas",

        82: "Pancadas fortes",

        95: "Trovoada",

        96: "Trovoada com granizo",

        99: "Trovoada forte"

    };


    return (
        descriptions[code] ||
        "Condição desconhecida"
    );

}



function getSeverity(
    magnitude
) {

    if (
        magnitude >= 6
    ) {

        return "critical";

    }


    if (
        magnitude >= 4
    ) {

        return "warning";

    }


    return "normal";

}



function getMagnitudeColor(
    magnitude
) {

    if (
        magnitude >= 6
    ) {

        return "#ff5d6c";

    }


    if (
        magnitude >= 4
    ) {

        return "#f3b94f";

    }


    return "#4da3ff";

}



function escapeHTML(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value || "";


    return element.innerHTML;

}