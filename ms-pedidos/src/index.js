const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs } = require('./graphql/typeDefs');
const { resolvers } = require('./graphql/resolvers');
const { authMiddleware } = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // El middleware extrae el usuario del token y lo inyecta en req.usuario
  app.use(
    '/graphql',
    authMiddleware,
    expressMiddleware(server, {
      context: async ({ req }) => ({ 
        usuario: req.usuario,
        authHeader: req.header('Authorization')
      }),
    })
  );

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal en ms-pedidos.' });
  });

  app.listen(PORT, () => {
    console.log(`MS-Pedidos (GraphQL) ejecutándose en el puerto ${PORT}`);
  });
};

startServer();
