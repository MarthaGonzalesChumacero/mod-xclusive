const { db } = require('../config/firebase');

const listarProductos = async (req, res) => {
  try {
    const { categoria, buscar } = req.query;
    let query = db.collection('productos');

    if (categoria) {
      query = query.where('categoria', '==', categoria);
    }

    const snapshot = await query.get();
    let productos = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // Filtro en memoria para búsqueda de texto
      if (buscar) {
        if (data.nombre.toLowerCase().includes(buscar.toLowerCase())) {
          productos.push({ id: doc.id, ...data });
        }
      } else {
        productos.push({ id: doc.id, ...data });
      }
    });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar productos', detalle: error.message });
  }
};

const consultarProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('productos').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar producto', detalle: error.message });
  }
};

const registrarProducto = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, precio, stock, imagen } = req.body;

    if (!nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, precio, stock)' });
    }

    const nuevoProducto = {
      nombre,
      descripcion: descripcion || '',
      categoria: categoria || 'Sin Categoría',
      precio: parseFloat(precio),
      stock: parseInt(stock, 10),
      imagen: imagen || '',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('productos').add(nuevoProducto);

    res.status(201).json({ 
      mensaje: 'Producto registrado exitosamente', 
      productoId: docRef.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar producto', detalle: error.message });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    data.updatedAt = new Date().toISOString();

    const productoRef = db.collection('productos').doc(id);
    const doc = await productoRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await productoRef.update(data);
    res.json({ mensaje: 'Producto actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto', detalle: error.message });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const productoRef = db.collection('productos').doc(id);
    const doc = await productoRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await productoRef.delete();
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto', detalle: error.message });
  }
};

module.exports = {
  listarProductos,
  consultarProductoPorId,
  registrarProducto,
  actualizarProducto,
  eliminarProducto
};
