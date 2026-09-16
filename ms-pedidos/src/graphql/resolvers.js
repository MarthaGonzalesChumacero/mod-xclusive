const { db } = require('../config/firebase');
const axios = require('axios');

const MS_PRODUCTOS_URL =
  process.env.MS_PRODUCTOS_URL ||
  'http://localhost:3002/api/productos';

const esAdministrador = (usuario) =>
  usuario &&
  (usuario.rol === 'administrador' || usuario.rol === 'admin');

const resolvers = {
  Query: {
    // ==========================================
    // LISTAR PEDIDOS
    // ==========================================
    pedidos: async (_, { usuarioId }, context) => {
      if (!context.usuario) {
        throw new Error('No autenticado');
      }

      let query = db.collection('pedidos');

      if (esAdministrador(context.usuario)) {
        // El administrador puede ver todos los pedidos
        // o filtrar por un usuario específico.
        if (usuarioId) {
          query = query.where('usuarioId', '==', usuarioId);
        }
      } else {
        // Un cliente SIEMPRE ve únicamente sus propios pedidos.
        // Se ignora cualquier usuarioId enviado manualmente.
        query = query.where(
          'usuarioId',
          '==',
          context.usuario.id
        );
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    },

    // ==========================================
    // CONSULTAR UN PEDIDO
    // ==========================================
    pedido: async (_, { id }, context) => {
      if (!context.usuario) {
        throw new Error('No autenticado');
      }

      const doc = await db
        .collection('pedidos')
        .doc(id)
        .get();

      if (!doc.exists) {
        throw new Error('Pedido no encontrado');
      }

      const pedido = doc.data();

      // Cliente solo puede consultar sus pedidos.
      if (
        pedido.usuarioId !== context.usuario.id &&
        !esAdministrador(context.usuario)
      ) {
        throw new Error(
          'No autorizado para ver este pedido'
        );
      }

      return {
        id: doc.id,
        ...pedido
      };
    }
  },

  Mutation: {
    // ==========================================
    // CREAR PEDIDO
    // ==========================================
    crearPedido: async (
      _,
      { usuarioId, productos },
      context
    ) => {
      if (!context.usuario) {
        throw new Error('No autenticado');
      }

      if (!productos || productos.length === 0) {
        throw new Error(
          'El pedido debe tener productos'
        );
      }

      /*
       * SEGURIDAD:
       * Un cliente no puede crear un pedido
       * a nombre de otro usuario.
       *
       * Para clientes usamos SIEMPRE el ID
       * contenido en el JWT.
       *
       * Un administrador puede especificar
       * usuarioId si fuera necesario.
       */
      const usuarioPedido = esAdministrador(context.usuario)
        ? (usuarioId || context.usuario.id)
        : context.usuario.id;

      let total = 0;
      const detallesPedido = [];

      // ==========================================
      // VALIDAR PRODUCTOS Y STOCK
      // ==========================================
      for (const item of productos) {
        try {
          if (
            !item.cantidad ||
            item.cantidad <= 0
          ) {
            throw new Error(
              'La cantidad debe ser mayor a 0'
            );
          }

          const response = await axios.get(
            `${MS_PRODUCTOS_URL}/${item.productoId}`
          );

          const productoDb = response.data;

          if (productoDb.stock < item.cantidad) {
            throw new Error(
              `Stock insuficiente para ${productoDb.nombre}`
            );
          }

          const subtotal =
            productoDb.precio * item.cantidad;

          total += subtotal;

          detallesPedido.push({
            productoId: productoDb.id,
            nombre: productoDb.nombre,
            cantidad: item.cantidad,
            precio: productoDb.precio,
            subtotal
          });

        } catch (error) {
          throw new Error(
            `Error en producto ${item.productoId}: ${error.message}`
          );
        }
      }

      // ==========================================
      // DESCONTAR STOCK
      // ==========================================
      /*
       * Primero descontamos el stock.
       * Si falla, NO creamos el pedido.
       */
      for (const item of productos) {
        try {
          await axios.put(
            `${MS_PRODUCTOS_URL}/${item.productoId}/descontar-stock`,
            {
              cantidad: item.cantidad
            },
            {
              headers: {
                Authorization: context.authHeader
              }
            }
          );

          console.log(
            `Stock descontado correctamente del producto ${item.productoId}`
          );

        } catch (err) {
          console.error(
            `Error descontando stock de ${item.productoId}:`,
            err.response?.data || err.message
          );

          throw new Error(
            `No se pudo actualizar el stock del producto ${item.productoId}`
          );
        }
      }

      // ==========================================
      // CREAR PEDIDO
      // ==========================================
      const nuevoPedido = {
        usuarioId: usuarioPedido,
        productos: detallesPedido,
        total,
        estado: 'Pendiente',
        fecha: new Date().toISOString()
      };

      const docRef = await db
        .collection('pedidos')
        .add(nuevoPedido);

      return {
        id: docRef.id,
        ...nuevoPedido
      };
    },

    // ==========================================
    // ACTUALIZAR ESTADO DEL PEDIDO
    // SOLO ADMINISTRADOR
    // ==========================================
    actualizarEstadoPedido: async (
      _,
      { id, estado },
      context
    ) => {
      if (!esAdministrador(context.usuario)) {
        throw new Error(
          'No autorizado, requiere administrador'
        );
      }

      const estadosPermitidos = [
        'Pendiente',
        'Procesando',
        'Enviado',
        'Entregado'
      ];

      if (!estadosPermitidos.includes(estado)) {
        throw new Error(
          'Estado de pedido no válido'
        );
      }

      const pedidoRef = db
        .collection('pedidos')
        .doc(id);

      const doc = await pedidoRef.get();

      if (!doc.exists) {
        throw new Error('Pedido no encontrado');
      }

      await pedidoRef.update({
        estado
      });

      const updatedDoc = await pedidoRef.get();

      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    }
  }
};

module.exports = { resolvers };