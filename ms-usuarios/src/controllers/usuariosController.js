const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

// ==========================================
// REGISTRAR USUARIO
// ==========================================
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios'
      });
    }

    // Verificar si el usuario ya existe
    const usuariosRef = db.collection('usuarios');

    const snapshot = await usuariosRef
      .where('email', '==', email)
      .get();

    if (!snapshot.empty) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = {
      nombre,
      apellido,
      email,
      rol: 'cliente',
      passwordHash,
      createdAt: new Date().toISOString()
    };

    const docRef = await usuariosRef.add(nuevoUsuario);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuarioId: docRef.id
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al registrar usuario',
      detalle: error.message
    });
  }
};


// ==========================================
// LOGIN DE USUARIO
// ==========================================
const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar antes de consultar Firestore
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios'
      });
    }

    const usuariosRef = db.collection('usuarios');

    const snapshot = await usuariosRef
      .where('email', '==', email)
      .get();

    // No existe el usuario
    if (snapshot.empty) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const usuarioDoc = snapshot.docs[0];
    const usuario = usuarioDoc.data();

    // Comparar contraseña
    const isMatch = await bcrypt.compare(
      password,
      usuario.passwordHash
    );

    if (!isMatch) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: usuarioDoc.id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || 'secreto_temporal',
      {
        expiresIn: '24h'
      }
    );

    // Respuesta del login
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
    res.status(500).json({
      error: 'Error en el login',
      detalle: error.message
    });
  }
};


// ==========================================
// CONSULTAR PERFIL
// ==========================================
const consultarPerfil = async (req, res) => {
  try {
    const { id } = req.usuario;

    const usuarioDoc = await db
      .collection('usuarios')
      .doc(id)
      .get();

    if (!usuarioDoc.exists) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const data = usuarioDoc.data();

    // Nunca devolver el hash de la contraseña
    delete data.passwordHash;

    res.json({
      id: usuarioDoc.id,
      ...data
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al consultar perfil',
      detalle: error.message
    });
  }
};


// ==========================================
// ACTUALIZAR PERFIL
// ==========================================
const actualizarPerfil = async (req, res) => {
  try {
    const { id } = req.usuario;
    const { nombre, apellido } = req.body;

    // Validar que se envíe al menos un dato
    if (!nombre && !apellido) {
      return res.status(400).json({
        error: 'Debe proporcionar nombre o apellido para actualizar'
      });
    }

    const datosActualizar = {
      updatedAt: new Date().toISOString()
    };

    // Evitar guardar undefined en Firestore
    if (nombre !== undefined) {
      datosActualizar.nombre = nombre;
    }

    if (apellido !== undefined) {
      datosActualizar.apellido = apellido;
    }

    await db
      .collection('usuarios')
      .doc(id)
      .update(datosActualizar);

    res.json({
      mensaje: 'Perfil actualizado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al actualizar perfil',
      detalle: error.message
    });
  }
};


// ==========================================
// EXPORTAR CONTROLADORES
// ==========================================
module.exports = {
  registrarUsuario,
  loginUsuario,
  consultarPerfil,
  actualizarPerfil
};