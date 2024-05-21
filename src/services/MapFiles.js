const fs = require('fs');

// Função para extrair o nome/assunto do arquivo
function extractFileName(fullFileName) {
  const match = fullFileName.match(/(?:.*\.)?(.*)\.csv$/);
  return match ? match[1] : null;
}

// Função para obter os nomes dos arquivos no diretório
function getFileNames(directoryPath) {
  const fileNames = fs.readdirSync(directoryPath);
  const extractedNames = fileNames.map((fullFileName) =>
    extractFileName(fullFileName)
  );
  return extractedNames.filter((name) => name !== null); // Filtra os nomes que não são null
}

// Mapeamento de arquivos para o banco de dados
const fileToTableMapping = {
  CNAECSV: 'cnaes',
  SIMPLES: 'dados-simples',
  EMPRECSV: 'empresas',
  ESTABELE: 'estabelecimentos',
  MOTIVCSV: 'motivos',
  MONICCSV: 'municipios',
  NATJUCSV: 'naturezas-juridicas',
  PAISCSV: 'paises',
  QUALSCSV: 'qualificacao-socios',
  SOCIOCSV: 'socios',
  'Imunes e isentas': 'imunes-isentas',
  'Lucro Arbitrado': 'lucro-arbitrado',
  'Lucro Presumido': 'lucro-presumido',
  'Lucro Real': 'lucro-real',
  // adicione mais mapeamentos conforme necessário
};

module.exports = { getFileNames, fileToTableMapping };
