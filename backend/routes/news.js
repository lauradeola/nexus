const express = require("express");
const Parser = require("rss-parser");

const router = express.Router();
const parser = new Parser({
    timeout: 10000
});

const feeds = [
    {
        name: "The Hacker News",
        url: "https://feeds.feedburner.com/TheHackersNews"
    },
    {
        name: "BleepingComputer",
        url: "https://www.bleepingcomputer.com/feed/"
    }
];

router.get("/", async (req, res) => {
    try {
        const results = [];

        for (const feed of feeds) {
            try {
                const parsed = await parser.parseURL(feed.url);

                const articles = parsed.items.slice(0, 8).map(article => ({
                    title: article.title || "Sem título",
                    description: article.contentSnippet || "",
                    link: article.link || "#",
                    published: article.pubDate || article.isoDate || null,
                    source: feed.name
                }));

                results.push(...articles);
            } catch (error) {
                console.error(`Erro ao carregar ${feed.name}:`, error.message);
            }
        }

        results.sort((a, b) => {
            return new Date(b.published || 0) - new Date(a.published || 0);
        });

        res.json({
            status: "online",
            updatedAt: new Date().toISOString(),
            total: results.length,
            articles: results.slice(0, 15)
        });

    } catch (error) {
        console.error("Erro no feed de notícias:", error);

        res.status(500).json({
            status: "error",
            message: "Não foi possível carregar as notícias."
        });
    }
});

module.exports = router;