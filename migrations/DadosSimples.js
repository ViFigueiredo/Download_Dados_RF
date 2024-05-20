exports.up = (knex) =>
  knex.schema.createTable('dados-simples', (table) => {
    table.string('cnpj_basico');
    table.string('opcao_simples');
    table.string('data_opcao_simples');
    table.string('data_exclusao_simples');
    table.string('opcao_mei');
    table.string('data_opcao_mei');
    table.string('data_exclusao_mei');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('dados-simples');
