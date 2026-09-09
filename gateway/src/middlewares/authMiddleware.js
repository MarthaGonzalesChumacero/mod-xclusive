const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      // Validar JWT a nivel de Gateway (si es inválido, rechaza antes de llegar a los microservicios)
      jwt.verify(token, process.env.JWT_SECRET || 'secreto_temporal');
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido detectado por el Gateway' });
    }
  }

  // Si no hay token o es válido, deja pasar la petición.
  // Las rutas que requieran autenticación obligatoria serán bloqueadas por los microservicios.
  next();
};

module.exports = { authMiddleware };
