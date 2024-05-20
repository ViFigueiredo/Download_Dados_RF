exports.up = (knex) =>
  knex.schema.createTable('cnaes', (table) => {
    table.string('codigo');
    table.string('descricao');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('cnaes');
