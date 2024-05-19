exports.up = (knex) =>
  knex.schema.createTable('', (table) => {
    table.string('origem');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('');
