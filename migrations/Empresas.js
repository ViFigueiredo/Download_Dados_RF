exports.up = (knex) =>
  knex.schema.createTable('empresas', (table) => {
    table.string('cnpj_basico');
    table.string('razao_social');
    table.string('natureza_juridica');
    table.string('qualificacao_responsavel');
    table.string('capital_social');
    table.string('porte_empresa');
    table.string('ente_federativo');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('empresas');
