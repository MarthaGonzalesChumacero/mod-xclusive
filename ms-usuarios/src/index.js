const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const usuariosRoutes = require('./routes/usuariosRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/usuarios', usuariosRoutes);

// Manejo de errores básico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor.' });
});

app.listen(PORT, () => {
  console.log(`MS-Usuarios ejecutándose en el puerto ${PORT}`);
});
