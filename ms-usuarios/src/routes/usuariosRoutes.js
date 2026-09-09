const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/registro', usuariosController.registrarUsuario);
router.post('/login', usuariosController.loginUsuario);
router.get('/perfil', authMiddleware, usuariosController.consultarPerfil);
router.put('/perfil', authMiddleware, usuariosController.actualizarPerfil);

module.exports = router;
