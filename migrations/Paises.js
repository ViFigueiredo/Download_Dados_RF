exports.up = (knex) =>
  knex.schema.createTable('paises', (table) => {
    table.string('codigo');
    table.string('descricao');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('paises');
