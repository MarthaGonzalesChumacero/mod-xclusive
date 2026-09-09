const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productosRoutes = require('./routes/productosRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/productos', productosRoutes);

// Manejo de errores básico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en ms-productos.' });
});

app.listen(PORT, () => {
  console.log(`MS-Productos ejecutándose en el puerto ${PORT}`);
});
