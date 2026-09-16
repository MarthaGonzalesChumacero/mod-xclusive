const { db } = require('../config/firebase');
const axios = require('axios');

const MS_PRODUCTOS_URL = process.env.MS_PRODUCTOS_URL || 'http://localhost:3002/api/productos';

const resolvers = {
  Query: {
    pedidos: async (_, { usuarioId }, context) => {
      if (!context.usuario) throw new Error('No autenticado');

      let query = db.collection('pedidos');
      if (usuarioId) {
        query = query.where('usuarioId', '==', usuarioId);
      } else {
        // Si no especifica usuarioId, un cliente normal solo ve los suyos
        if (context.usuario.rol !== 'administrador' && context.usuario.rol !== 'admin') {
          query = query.where('usuarioId', '==', context.usuario.id);
        }
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    pedido: async (_, { id }, context) => {
      if (!context.usuario) throw new Error('No autenticado');

      const doc = await db.collection('pedidos').doc(id).get();
      if (!doc.exists) throw new Error('Pedido no encontrado');

      const pedido = doc.data();
      if (pedido.usuarioId !== context.usuario.id && context.usuario.rol !== 'administrador' && context.usuario.rol !== 'admin') {
        throw new Error('No autorizado para ver este pedido');
      }

      return { id: doc.id, ...pedido };
    }
  },
  Mutation: {
    crearPedido: async (_, { usuarioId, productos }, context) => {
      if (!context.usuario) throw new Error('No autenticado');
      if (!productos || productos.length === 0) throw new Error('El pedido debe tener productos');

      let total = 0;
      const detallesPedido = [];

      // Validar productos, stock y calcular totales
      for (const item of productos) {
        try {
          const response = await axios.get(`${MS_PRODUCTOS_URL}/${item.productoId}`);
          const productoDb = response.data;

          if (productoDb.stock < item.cantidad) {
            throw new Error(`Stock insuficiente para ${productoDb.nombre}`);
          }

          const subtotal = productoDb.precio * item.cantidad;
          total += subtotal;

          detallesPedido.push({
            productoId: productoDb.id,
            nombre: productoDb.nombre,
            cantidad: item.cantidad,
            precio: productoDb.precio,
            subtotal
          });
        } catch (error) {
          throw new Error(`Error en producto ${item.productoId}: ${error.message}`);
        }
      }

      const nuevoPedido = {
        usuarioId,
        productos: detallesPedido,
        total,
        estado: 'Pendiente',
        fecha: new Date().toISOString()
      };

      const docRef = await db.collection('pedidos').add(nuevoPedido);

      // Intentar descontar stock
      for (const item of productos) {
        const response = await axios.get(`${MS_PRODUCTOS_URL}/${item.productoId}`);
        const productoDb = response.data;
        const nuevoStock = productoDb.stock - item.cantidad;
        
        try {
           await axios.put(
             `${MS_PRODUCTOS_URL}/${item.productoId}`, 
             { stock: nuevoStock }, 
             { headers: { Authorization: context.authHeader } } // Pasa el token para autorización
           );
        } catch (err) {
           console.error(`Error descontando stock de ${item.productoId}:`, err.message);
        }
      }

      return { id: docRef.id, ...nuevoPedido };
    },

    actualizarEstadoPedido: async (_, { id, estado }, context) => {
      const esAdmin = context.usuario && (context.usuario.rol === 'administrador' || context.usuario.rol === 'admin');
      if (!esAdmin) {
        throw new Error('No autorizado, requiere administrador');
      }

      const pedidoRef = db.collection('pedidos').doc(id);
      const doc = await pedidoRef.get();

      if (!doc.exists) throw new Error('Pedido no encontrado');

      await pedidoRef.update({ estado });
      
      const updatedDoc = await pedidoRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    }
  }
};

module.exports = { resolvers };
