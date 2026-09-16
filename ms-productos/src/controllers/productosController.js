const { db } = require('../config/firebase');

// ==========================================
// LISTAR PRODUCTOS
// ==========================================
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
        if (
          data.nombre
            .toLowerCase()
            .includes(buscar.toLowerCase())
        ) {
          productos.push({
            id: doc.id,
            ...data
          });
        }
      } else {
        productos.push({
          id: doc.id,
          ...data
        });
      }
    });

    res.json(productos);

  } catch (error) {
    res.status(500).json({
      error: 'Error al listar productos',
      detalle: error.message
    });
  }
};


// ==========================================
// CONSULTAR PRODUCTO POR ID
// ==========================================
const consultarProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db
      .collection('productos')
      .doc(id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    res.json({
      id: doc.id,
      ...doc.data()
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al consultar producto',
      detalle: error.message
    });
  }
};


// ==========================================
// REGISTRAR PRODUCTO
// ==========================================
const registrarProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      precio,
      stock,
      imagen
    } = req.body;

    if (
      !nombre ||
      precio === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        error:
          'Faltan campos obligatorios (nombre, precio, stock)'
      });
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

    const docRef = await db
      .collection('productos')
      .add(nuevoProducto);

    res.status(201).json({
      mensaje: 'Producto registrado exitosamente',
      productoId: docRef.id
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al registrar producto',
      detalle: error.message
    });
  }
};


// ==========================================
// ACTUALIZAR PRODUCTO
// ==========================================
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const data = req.body;

    data.updatedAt = new Date().toISOString();

    const productoRef = db
      .collection('productos')
      .doc(id);

    const doc = await productoRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    await productoRef.update(data);

    res.json({
      mensaje: 'Producto actualizado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al actualizar producto',
      detalle: error.message
    });
  }
};


// ==========================================
// DESCONTAR STOCK AL REALIZAR UN PEDIDO
// ==========================================
const descontarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    const cantidadNumero = Number(cantidad);

    if (
      !Number.isInteger(cantidadNumero) ||
      cantidadNumero <= 0
    ) {
      return res.status(400).json({
        error: 'La cantidad debe ser mayor a 0'
      });
    }

    const productoRef = db
      .collection('productos')
      .doc(id);

    let nuevoStock;

    await db.runTransaction(
      async transaction => {

        const doc = await transaction.get(
          productoRef
        );

        if (!doc.exists) {
          throw new Error(
            'Producto no encontrado'
          );
        }

        const producto = doc.data();

        const stockActual =
          Number(producto.stock);

        if (stockActual < cantidadNumero) {
          throw new Error(
            'Stock insuficiente'
          );
        }

        nuevoStock =
          stockActual - cantidadNumero;

        transaction.update(
          productoRef,
          {
            stock: nuevoStock,
            updatedAt:
              new Date().toISOString()
          }
        );
      }
    );

    res.json({
      mensaje:
        'Stock descontado exitosamente',
      productoId: id,
      stock: nuevoStock
    });

  } catch (error) {

    if (
      error.message ===
      'Producto no encontrado'
    ) {
      return res.status(404).json({
        error: error.message
      });
    }

    if (
      error.message ===
      'Stock insuficiente'
    ) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Error al descontar stock',
      detalle: error.message
    });
  }
};


// ==========================================
// ELIMINAR PRODUCTO
// ==========================================
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const productoRef = db
      .collection('productos')
      .doc(id);

    const doc = await productoRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    await productoRef.delete();

    res.json({
      mensaje: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al eliminar producto',
      detalle: error.message
    });
  }
};


// ==========================================
// EXPORTAR CONTROLADORES
// ==========================================
module.exports = {
  listarProductos,
  consultarProductoPorId,
  registrarProducto,
  actualizarProducto,
  descontarStock,
  eliminarProducto
};