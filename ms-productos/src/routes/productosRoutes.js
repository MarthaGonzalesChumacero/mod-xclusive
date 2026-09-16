const express = require('express');

const router = express.Router();

const productosController = require('../controllers/productosController');

const {
  authMiddleware,
  adminMiddleware
} = require('../middlewares/authMiddleware');

// Rutas públicas o para clientes
router.get('/', productosController.listarProductos);

router.get('/:id', productosController.consultarProductoPorId);

// Rutas protegidas (solo administrador)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  productosController.registrarProducto
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  productosController.actualizarProducto
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  productosController.eliminarProducto
);

// Ruta para descontar stock al realizar un pedido
router.put(
  '/:id/descontar-stock',
  authMiddleware,
  productosController.descontarStock
);

module.exports = router;