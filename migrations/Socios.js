exports.up = (knex) =>
  knex.schema.createTable('socios', (table) => {
    table.string('cnpj_basico');
    table.string('identificador_socio');
    table.string('nome_razao_socio');
    table.string('documento_socio');
    table.string('qualificacao_socio');
    table.string('data_entrada_sociedade');
    table.string('pais');
    table.string('representante_legal');
    table.string('nome_representante');
    table.string('qualificacao_representante_legal');
    table.string('faixa_etaria');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('socios');
