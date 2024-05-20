exports.up = (knex) =>
  knex.schema.createTable('estabelecimentos', (table) => {
    table.string('cnpj_basico');
    table.string('cnpj_ordem');
    table.string('cnpj_dv');
    table.string('identificador_matriz_filial');
    table.string('nome_fantasia');
    table.string('situacao_cadastral');
    table.string('motivo_situacai_cadastral');
    table.string('nome_cidade_exterior');
    table.string('pais');
    table.string('data_inicio_atividade');
    table.string('cnae_fiscal_principal');
    table.string('cnae_fiscal_secundaria');
    table.string('tipo_logradouro');
    table.string('logradouro');
    table.string('numero');
    table.string('complemento');
    table.string('bairro');
    table.string('cep');
    table.string('uf');
    table.string('municipio');
    table.string('ddd1');
    table.string('telefone1');
    table.string('ddd2');
    table.string('telefone2');
    table.string('ddd_fax');
    table.string('fax');
    table.string('correio_eletronico');
    table.string('situacao_especial');
    table.string('data_situacao_especial');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('estabelecimentos');
