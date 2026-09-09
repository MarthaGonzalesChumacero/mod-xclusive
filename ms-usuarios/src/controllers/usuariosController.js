const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar si el usuario ya existe
    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef.where('email', '==', email).get();

    if (!snapshot.empty) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = {
      nombre,
      apellido,
      email,
      rol: rol || 'cliente',
      passwordHash,
      createdAt: new Date().toISOString()
    };

    const docRef = await usuariosRef.add(nuevoUsuario);

    res.status(201).json({ 
      mensaje: 'Usuario registrado exitosamente', 
      usuarioId: docRef.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario', detalle: error.message });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuarioDoc = snapshot.docs[0];
    const usuario = usuarioDoc.data();

    const isMatch = await bcrypt.compare(password, usuario.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuarioDoc.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_temporal',
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuarioDoc.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el login', detalle: error.message });
  }
};

const consultarPerfil = async (req, res) => {
  try {
    const { id } = req.usuario;
    const usuarioDoc = await db.collection('usuarios').doc(id).get();

    if (!usuarioDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const data = usuarioDoc.data();
    delete data.passwordHash; // Nunca devolver el hash en respuestas

    res.json({ id: usuarioDoc.id, ...data });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar perfil' });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { id } = req.usuario;
    const { nombre, apellido } = req.body;

    await db.collection('usuarios').doc(id).update({
      nombre,
      apellido,
      updatedAt: new Date().toISOString()
    });

    res.json({ mensaje: 'Perfil actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  consultarPerfil,
  actualizarPerfil
};
