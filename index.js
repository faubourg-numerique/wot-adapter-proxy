require('dotenv').config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();

// Configuration depuis .env
const TARGET = process.env.TARGET_URL;
const PORT = parseInt(process.env.PROXY_PORT);

const wotUrls = process.env.WOT_URLS ? process.env.WOT_URLS.split(',') : [];

app.use(bodyParser.json());

// Middleware pour capturer toutes les routes et méthodes
app.use((req, res) => {
    console.log('\n=== NOUVELLE REQUÊTE ===');
    console.log(`📋 Méthode: ${req.method}`);
    console.log(`🔗 URL originale: ${req.originalUrl}`);
    console.log(`🌐 Headers reçus:`, JSON.stringify(req.headers, null, 2));
    
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`📦 Body reçu:`, JSON.stringify(req.body, null, 2));
    }
    
    const url = new URL(req.originalUrl, TARGET);
    console.log(`🎯 URL cible: ${url.toString()}`);

    const options = {
        method: req.method,
        headers: req.headers,
    };

    const proxyReq = http.request(url, options, proxyRes => {
        console.log(`✅ Réponse du serveur cible:`);
        console.log(`   Status: ${proxyRes.statusCode}`);
        console.log(`   Headers:`, JSON.stringify(proxyRes.headers, null, 2));
        
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        
        let responseData = '';
        proxyRes.on('data', chunk => {
            responseData += chunk;
        });
        
        proxyRes.on('end', () => {
            if (responseData) {
                console.log(`📤 Réponse envoyée au client:`, responseData);
            }
        });
        
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', err => {
        console.error(`❌ Erreur proxy: ${err.message}`);
        if (!res.headersSent) {
            res.status(500).send('Proxy error: ' + err.message);
        }
    });

        console.log("req.body", req.body);
    if (req.method === 'GET' && req.body) {
        let bodyString = JSON.stringify(req.body);
        console.log("bodyString", bodyString);

        for (const wotUrl of wotUrls) {
            bodyString = bodyString.replaceAll(wotUrl, TARGET);
        }

        console.log(`🔄 Transformation du body GET...`);
        console.log(`   Body après transformation:`, bodyString);
        
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyString));
        proxyReq.write(bodyString);
        proxyReq.end();
    } else if (req.method === 'POST' && req.is('application/json')) {
        const body = req.body;
        console.log(`🔄 Transformation du body JSON...`);
        console.log(`   Body avant transformation:`, JSON.stringify(body, null, 2));

        // Remplacer { input: {...} } par {...}
        for (const key in body) {
            if (
                body[key] &&
                typeof body[key] === 'object' &&
                'input' in body[key] &&
                typeof body[key].input === 'object'
            ) {
                console.log(`   🔧 Transformation de la clé "${key}"`);
                body[key] = body[key].input;
            }
        }

        const newBody = JSON.stringify(body);
        console.log(`   Body après transformation:`, newBody);
        console.log(`   📏 Taille du body: ${Buffer.byteLength(newBody)} bytes`);
        
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(newBody));
        proxyReq.write(newBody);
        proxyReq.end();
    } else {
        console.log(`📤 Pipe direct de la requête vers le serveur cible`);
        req.pipe(proxyReq, { end: true });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Proxy démarré avec succès!`);
    console.log(`📍 Écoute sur: http://localhost:${PORT}`);
    console.log(`🎯 Redirige vers: ${TARGET}`);
    console.log(`⏰ Démarré à: ${new Date().toLocaleString()}`);
    console.log(`\n⚡ En attente des requêtes...\n`);
});
