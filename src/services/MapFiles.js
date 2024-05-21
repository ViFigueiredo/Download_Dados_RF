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

module.exports = getFileNames;
