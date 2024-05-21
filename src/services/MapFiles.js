const fs = require('fs');

// Função para extrair o nome/assunto do arquivo
function extractFileName(fullFileName) {
  const match = fullFileName.match(/(?:.*\.)?(.*)\.csv$/);
  return match ? match[1] : null;
}

// Função para obter os nomes dos arquivos no diretório
function getFileNames(directoryPath) {
  const fileNames = fs.readdirSync(directoryPath);
  const mapping = {};

  for (const fullFileName of fileNames) {
    const extractedName = extractFileName(fullFileName);
    if (extractedName !== null) {
      mapping[extractedName] = fullFileName.slice(0, -4); // remove a extensão .csv
    }
  }

  return mapping;
}

// Mapeamento de arquivos para o banco de dados
const fileToTableMapping = {
  CNAECSV: {
    table: 'cnaes',
    collumns: ['codigo', 'descricao'],
  },
  SIMPLES: {
    table: 'dados-simples',
    collumns: [
      'cnpj_basico',
      'opcao_simples',
      'data_opcao_simples',
      'data_exclusao_simples',
      'opcao_mei',
      'data_opcao_mei',
      'data_exclusao_mei',
    ],
  },
  EMPRECSV: {
    table: 'empresas',
    collumns: [
      'cnpj_basico',
      'razao_social',
      'natureza_juridica',
      'qualificacao_responsavel',
      'capital_social',
      'porte_empresa',
      'ente_federativo',
    ],
  },
  ESTABELE: {
    table: 'estabelecimentos',
    collumns: [
      'cnpj_basico',
      'cnpj_ordem',
      'cnpj_dv',
      'identificador_matriz_filial',
      'nome_fantasia',
      'situacao_cadastral',
      'motivo_situacai_cadastral',
      'nome_cidade_exterior',
      'pais',
      'data_inicio_atividade',
      'cnae_fiscal_principal',
      'cnae_fiscal_secundaria',
      'tipo_logradouro',
      'logradouro',
      'numero',
      'complemento',
      'bairro',
      'cep',
      'uf',
      'municipio',
      'ddd1',
      'telefone1',
      'ddd2',
      'telefone2',
      'ddd_fax',
      'fax',
      'correio_eletronico',
      'situacao_especial',
      'data_situacao_especial',
    ],
  },
  MOTIVCSV: {
    table: 'motivos',
    collumns: ['codigo', 'descricao'],
  },
  MUNICCSV: {
    table: 'municipios',
    collumns: ['codigo', 'descricao'],
  },
  NATJUCSV: {
    table: 'naturezas-juridicas',
    collumns: ['codigo', 'descricao'],
  },
  PAISCSV: {
    table: 'paises',
    collumns: ['codigo', 'descricao'],
  },
  QUALSCSV: {
    table: 'qualificacao-socios',
    collumns: ['codigo', 'descricao'],
  },
  SOCIOCSV: {
    tabl: 'socios',
    collumns: [
      'cnpj_basico',
      'identificador_socio',
      'nome_razao_socio',
      'documento_socio',
      'qualificacao_socio',
      'data_entrada_sociedade',
      'pais',
      'representante_legal',
      'nome_representante',
      'qualificacao_representante_legal',
      'faixa_etaria',
    ],
  },
  'Imunes e isentas': {
    table: 'imunes-isentas',
    collumns: ['ano', 'cnpj', 'cnpj_scp', 'forma_tributacao', 'quantidade_escrituracoes'],
  },
  'Lucro Arbitrado': {
    table: 'lucro-arbitrado',
    collumns: ['ano', 'cnpj', 'cnpj_scp', 'forma_tributacao', 'quantidade_escrituracoes'],
  },
  'Lucro Presumido': {
    table: 'lucro-presumido',
    collumns: ['ano', 'cnpj', 'cnpj_scp', 'forma_tributacao', 'quantidade_escrituracoes'],
  },
  'Lucro Real': {
    table: 'lucro-real',
    collumns: ['ano', 'cnpj', 'cnpj_scp', 'forma_tributacao', 'quantidade_escrituracoes'],
  },
};

module.exports = { getFileNames, fileToTableMapping };
