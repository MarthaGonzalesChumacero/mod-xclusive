const typeDefs = `#graphql
  type Pedido {
    id: ID!
    usuarioId: String!
    productos: [DetallePedido!]!
    total: Float!
    estado: String!
    fecha: String!
  }

  type DetallePedido {
    productoId: String!
    nombre: String!
    cantidad: Int!
    precio: Float!
    subtotal: Float!
  }

  input ProductoInput {
    productoId: String!
    cantidad: Int!
  }

  type Query {
    pedidos(usuarioId: ID): [Pedido]
    pedido(id: ID!): Pedido
  }

  type Mutation {
    crearPedido(usuarioId: ID!, productos: [ProductoInput!]!): Pedido
    actualizarEstadoPedido(id: ID!, estado: String!): Pedido
  }
`;

module.exports = { typeDefs };
