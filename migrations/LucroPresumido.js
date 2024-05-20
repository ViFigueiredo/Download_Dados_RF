exports.up = (knex) =>
  knex.schema.createTable('lucro-presumido', (table) => {
    table.string('ano');
    table.string('cnpj');
    table.string('cnpj_scp');
    table.string('forma_tributacao');
    table.string('quantidade_escrituracoes');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('lucro-presumido');
