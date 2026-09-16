const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado, token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_temporal');
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'administrador' || req.usuario.rol === 'admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado, se requiere rol de administrador' });
  }
};

module.exports = { authMiddleware, adminMiddleware };
