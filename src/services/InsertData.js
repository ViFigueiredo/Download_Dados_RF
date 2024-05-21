const path = require('path');
const fs = require('fs');
const knex = require('../config/knex');
const csvParser = require('csv-parser');
const iconv = require('iconv-lite');
const { fileToTableMapping } = require('./MapFiles');
const logger = require('./Logger');

// Função para importar um arquivo CSV para uma tabela
async function importCsvToTable(key, fileNames) {
  const mapping = fileToTableMapping[key];
  if (!mapping) {
    console.log(`No mapping found for key ${key}`);
    logger.info(`No mapping found for key ${key}`);
    return;
  }

  const originalFileName = fileNames[key];
  const filePath = path.join('./arquivos-csv', originalFileName + '.csv');
  const fileStream = fs.createReadStream(filePath);
  const { table, collumns } = mapping;

  // Limpa a tabela
  await knex(table)
    .truncate()
    .then(() => {
      console.log(`Tabela ${table} limpa com sucesso.`);
      logger.info(`Tabela ${table} limpa com sucesso.`);
    })
    .catch((err) => {
      console.log(`Erro ao limpar a tabela ${table}: ${err}`);
      logger.info(`Erro ao limpar a tabela ${table}: ${err}`);
    });

  fileStream
    .pipe(iconv.decodeStream('latin1')) // Converte o stream de 'latin1' para 'utf8'
    .pipe(csvParser({ separator: ';', headers: collumns })) // Passa os nomes das colunas para o csv-parser
    .on('data', (row) => {
      // Insere cada linha do arquivo CSV na tabela
      knex(table)
        .insert(row)
        .catch((err) => {
          console.log(`Erro ao inserir linha na tabela ${table}: ${err}`);
          logger.info(`Erro ao inserir linha na tabela ${table}: ${err}`);
        });
    })
    .on('end', () => {
      console.log(`Arquivo ${originalFileName} importado com sucesso para a tabela ${table}.`);
      logger.info(`Arquivo ${originalFileName} importado com sucesso para a tabela ${table}.`);
    });
}

module.exports = importCsvToTable;
