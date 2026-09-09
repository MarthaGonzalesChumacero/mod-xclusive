const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_temporal');
      req.usuario = decoded;
    } catch (error) {
      console.warn('Token GraphQL inválido');
    }
  }
  
  // En GraphQL dejamos pasar la request y bloqueamos desde los Resolvers si no hay req.usuario
  next();
};

module.exports = { authMiddleware };
