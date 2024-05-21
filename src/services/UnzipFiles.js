const path = require('path');
const fs = require('fs');
const extract = require('extract-zip');
const logger = require('./Logger');

// Cria os diretórios necessários antes de iniciar o processo de download e extração
function initDirs() {
  if (!fs.existsSync('./arquivos-zip')) fs.mkdirSync('./arquivos-zip', { recursive: true });
  if (!fs.existsSync('./arquivos-csv')) fs.mkdirSync('./arquivos-csv', { recursive: true });
  if (!fs.existsSync('./logs')) fs.mkdirSync('./logs', { recursive: true });
}

// Função para adicionar a extensão .csv aos arquivos
async function addCSVExtension(directoryPath) {
  fs.readdirSync(directoryPath).forEach((file) => {
    if (path.extname(file) !== '.csv') {
      const oldPath = path.join(directoryPath, file);
      const newPath = path.join(directoryPath, file + '.csv');
      fs.renameSync(oldPath, newPath);
    }
  });
}

// Função para descompactar um arquivo
async function unzipFile(inputPath, outputPath) {
  try {
    const absoluteOutputPath = path.resolve(outputPath);

    // Verifica se o arquivo já existe e o exclui antes de extrair novamente
    const files = fs.readdirSync(absoluteOutputPath);
    files.forEach((file) => {
      if (file === path.basename(inputPath, '.csv')) {
        fs.unlinkSync(path.join(absoluteOutputPath, file));
      }
    });

    await extract(inputPath, { dir: absoluteOutputPath });
    console.log(`Extracted ${inputPath} to ${absoluteOutputPath}`);
    logger.info(`Extracted ${inputPath} to ${absoluteOutputPath}`);
  } catch (err) {
    console.log(`Error extracting ${inputPath}: ${err}`);
    logger.info(`Error extracting ${inputPath}: ${err}`);
  }
}

module.exports = { initDirs, unzipFile, addCSVExtension };
