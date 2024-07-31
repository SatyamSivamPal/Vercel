const express = require('express')
const httpProxy = require('http-proxy')

const app = express();
const PORT = 4000
const BASE_PATH = "https://s3.amazonaws.com/vercel-clone.sspnow.xyz/__outputs"


const proxy = httpProxy.createProxyServer({});

app.use((req, res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    const resolveTo = `${BASE_PATH}/${subdomain}`

    proxy.web(req, res, { target: resolveTo, changeOrigin: true }, (err) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error occurred.');
    });
})

proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;

    if(url === '/' )
    {
        proxyReq.path += 'index.html';
    }
})

app.listen(PORT, () => console.log(`Reverse Proxy is runnig ... ${PORT}`))