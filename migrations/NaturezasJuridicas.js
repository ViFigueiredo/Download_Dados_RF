exports.up = (knex) =>
  knex.schema.createTable('naturezas-juridicas', (table) => {
    table.string('codigo');
    table.string('descricao');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('naturezas-juridicas');
