const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { authMiddleware } = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const MS_USUARIOS = process.env.URL_MS_USUARIOS || 'http://localhost:3001';
const MS_PRODUCTOS = process.env.URL_MS_PRODUCTOS || 'http://localhost:3002';
const MS_PEDIDOS = process.env.URL_MS_PEDIDOS || 'http://localhost:3003';

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

// ── Helper: proxy genérico ────────────────────────────────────────────────────
async function proxyRequest(targetUrl, req, res) {
  console.log(`[Gateway] ${req.method} → ${targetUrl}`);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;

    const fetchOptions = { method: req.method, headers };
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || 'application/json';
    const data = await response.text();

    res.status(response.status)
       .set('Content-Type', contentType)
       .set('Access-Control-Allow-Origin', '*')
       .send(data);

  } catch (error) {
    console.error(`[Gateway] Error conectando a ${targetUrl}:`, error.message);
    res.status(503).json({ error: `Servicio no disponible: ${error.message}` });
  }
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', gateway: 'MOD XCLUSIVE API Gateway' });
});

// ── Rutas Proxy ───────────────────────────────────────────────────────────────

// Usuarios
app.all('/api/usuarios', (req, res) => proxyRequest(`${MS_USUARIOS}/api/usuarios`, req, res));
app.all('/api/usuarios/*', (req, res) => proxyRequest(`${MS_USUARIOS}${req.path}`, req, res));

// Productos
app.get('/api/productos', (req, res) => proxyRequest(`${MS_PRODUCTOS}/api/productos`, req, res));
app.post('/api/productos', (req, res) => proxyRequest(`${MS_PRODUCTOS}/api/productos`, req, res));
app.get('/api/productos/:id', (req, res) => proxyRequest(`${MS_PRODUCTOS}/api/productos/${req.params.id}`, req, res));
app.put('/api/productos/:id', (req, res) => proxyRequest(`${MS_PRODUCTOS}/api/productos/${req.params.id}`, req, res));
app.delete('/api/productos/:id', (req, res) => proxyRequest(`${MS_PRODUCTOS}/api/productos/${req.params.id}`, req, res));

// Pedidos (GraphQL) — pasa todo a /graphql del ms-pedidos
app.all('/graphql', (req, res) => proxyRequest(`${MS_PEDIDOS}/graphql`, req, res));

// ── Manejo de errores ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Gateway] Error:', err.stack);
  res.status(500).json({ error: 'Algo salió mal en el API Gateway.' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway ejecutándose en el puerto ${PORT}`);
  console.log(`   → Usuarios:  ${MS_USUARIOS}`);
  console.log(`   → Productos: ${MS_PRODUCTOS}`);
  console.log(`   → Pedidos:   ${MS_PEDIDOS}`);
});
