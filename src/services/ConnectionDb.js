const knex = require('../config/knex');
const logger = require('./Logger');

// Conexão com Banco da Dados
async function connectionDB() {
  return knex
    .raw('SELECT 1+1 AS result')
    .then(() => {
      console.log('Conexão com o banco de dados estabelecida com sucesso.');
      logger.info('Conexão com o banco de dados estabelecida com sucesso.');
    })
    .catch((err) => {
      console.log('Falha ao conectar ao banco de dados\n');
      console.log(err);
      logger.info('Falha ao conectar ao banco de dados\n');
      logger.info(err);
      return;
    });
}

module.exports = connectionDB;
