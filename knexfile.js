const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    client: process.env.DATABASE_DIALECT,
    connection: {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      pool: {
        max: 20, // Aumente o valor máximo
        min: 3,
        acquireTimeout: 60 * 1000,
      },
      migrations: {
        directory: './migrations/', // Diretório onde as migrações serão armazenadas
      },
    },
  },
};
