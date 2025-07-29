require('dotenv').config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();

// Configuration depuis .env
const TARGET = process.env.TARGET_URL;
const PORT = parseInt(process.env.PROXY_PORT);

app.use(bodyParser.json());

// Middleware pour capturer toutes les routes
app.all('*', (req, res) => {
    const url = new URL(req.originalUrl, TARGET);

    const options = {
        method: req.method,
        headers: req.headers,
    };

    const proxyReq = http.request(url, options, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', err => {
        res.status(500).send('Proxy error: ' + err.message);
    });

    if (req.method === 'POST' && req.is('application/json')) {
        const body = req.body;

        // Remplacer { input: {...} } par {...}
        for (const key in body) {
            if (
                body[key] &&
                typeof body[key] === 'object' &&
                'input' in body[key] &&
                typeof body[key].input === 'object'
            ) {
                body[key] = body[key].input;
            }
        }

        const newBody = JSON.stringify(body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(newBody));
        proxyReq.write(newBody);
        proxyReq.end();
    } else {
        req.pipe(proxyReq);
    }
});

app.listen(PORT, () => {
    console.log(`Proxy running at http://localhost:${PORT}, forwarding to ${TARGET}`);
});
