const express = require("express");
const cors = require("cors");

const weatherRoutes = require("./routes/weather");
const earthquakeRoutes = require("./routes/earthquakes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "online",
        system: "NEXUS",
        version: "2.0"
    });
});

app.use("/api/weather", weatherRoutes);
app.use("/api/earthquakes", earthquakeRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Rota não encontrada"
    });
});

app.use((err, req, res, next) => {
    console.error("Erro no servidor:", err);

    res.status(500).json({
        status: "error",
        message: "Erro interno do servidor"
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Nexus Backend Online na porta ${PORT}`);
});