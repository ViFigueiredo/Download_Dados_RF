const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const retry = require('async-retry');
const cliProgress = require('cli-progress');
const extract = require('extract-zip');
const knex = require('./services/knex');
const inquirer = require('inquirer');

const baseURL = 'https://dados.rfb.gov.br/CNPJ/';
const collectedLinks = [];

// Conexão com Banco da Dados
async function connectionDB() {
  return knex.raw('SELECT 1+1 AS result')
    .then(() => {
      console.log('Conexão com o banco de dados estabelecida com sucesso.');
    })
    .catch((err) => {
      console.log('Falha ao conectar ao banco de dados\n');
      console.log(err);
      return
    });
}

// Função para formatar o tempo em hh:mm:ss
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Função para obter links de um site
async function getLinks(baseUrl) {
  const { data } = await retry(
    async (bail) => {
      const response = await axios.get(baseUrl);
      if (response.status === 404 || response.status.toString().startsWith('5'))
        bail(new Error('Failed to fetch page'));
      return response;
    },
    {
      retries: 5,
    }
  );

  const $ = cheerio.load(data);
  const linkElements = $('a').toArray();

  // Para cada link encontrado, se terminar com '.zip', adicione à lista de links coletados
  await Promise.all(
    linkElements.map(async (element) => {
      const link = $(element).attr('href');
      const fullUrl = url.resolve(baseUrl, link);
      if (fullUrl.endsWith('.zip')) {
        collectedLinks.push(fullUrl);
      }
    })
  );

  return collectedLinks;
}

// Função para baixar um arquivo
async function downloadFile(fileUrl, outputLocationPath) {
  // Verifica se o arquivo já existe e o exclui antes de baixar novamente
  if (fs.existsSync(outputLocationPath)) {
    fs.unlinkSync(outputLocationPath);
  }

  const writer = fs.createWriteStream(outputLocationPath);
  const response = await axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  });

  const totalLength = response.headers['content-length'];
  let downloadedLength = 0;

  const progressBar = new cliProgress.SingleBar({
    format:
      'Downloading |' + '{bar}' + '| {percentage}% || ETA: {eta_formatted}',
    barCompleteChar: '=',
    barIncompleteChar: ' ',
    hideCursor: true,
  });

  const startTime = process.uptime();

  progressBar.start(100, 0, {
    eta_formatted: 'calculando...',
  });

  // Atualiza a barra de progresso a cada pedaço de dados recebido
  response.data.on('data', (chunk) => {
    downloadedLength += chunk.length;
    const remainingLength = totalLength - downloadedLength;
    const speed = downloadedLength / (process.uptime() - startTime); // bytes per second
    const eta = Math.round(remainingLength / speed); // estimated time remaining in seconds

    progressBar.update((downloadedLength / totalLength) * 100, {
      eta_formatted: formatTime(eta),
    });
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      progressBar.stop();
      resolve();
    });
    writer.on('error', reject);
  });
}

// Função para descompactar um arquivo
async function unzipFile(inputPath, outputPath) {
  try {
    const absoluteOutputPath = path.resolve(outputPath);

    // Verifica se o arquivo já existe e o exclui antes de extrair novamente
    const files = fs.readdirSync(absoluteOutputPath);
    files.forEach(file => {
      if (file === path.basename(inputPath, '.csv')) {
        fs.unlinkSync(path.join(absoluteOutputPath, file));
      }
    });

    await extract(inputPath, { dir: absoluteOutputPath });
    console.log(`Extracted ${inputPath} to ${absoluteOutputPath}`);
  } catch (err) {
    console.error(`Error extracting ${inputPath}: ${err}`);
  }
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

// Função para selecionar o que baixar
async function askFilesToDownload(links) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'downloadOption',
      message: 'Quais arquivos você gostaria de baixar?',
      choices: ['Tudo', 'Selecionar'],
    },
  ]);

  if (answers.downloadOption === 'Tudo') {
    return links;
  } else {
    const fileSelectionAnswers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedFiles',
        message: 'Selecione os arquivos que você gostaria de baixar:',
        choices: links,
      },
    ]);
    return fileSelectionAnswers.selectedFiles;
  }
}

// Cria os diretórios necessários antes de iniciar o processo de download e extração
if (!fs.existsSync('./arquivos-zip'))
  fs.mkdirSync('./arquivos-zip', { recursive: true });
if (!fs.existsSync('./arquivos-csv'))
  fs.mkdirSync('./arquivos-csv', { recursive: true });

// Inicia o processo de obtenção de links, download e extração
getLinks(baseURL)
  .then(() => getLinks(baseURL + 'regime_tributario/'))
  .then(async (links) => {
    const filesToDownload = await askFilesToDownload(links);
    for (const link of filesToDownload) {
      const fileName = link.split('/').pop();
      const downloadPath = `./arquivos-zip/${fileName}`;
      console.log(`Starting download of ${fileName}`);
      await downloadFile(link, downloadPath);
      console.log(`Finished download of ${fileName}`);
      console.log(`Starting extraction of ${fileName}`);
      await unzipFile(downloadPath, './arquivos-csv');
      console.log(`Finished extraction of ${fileName}`);
    }
  })
  .then(() => console.log('All files downloaded and extracted successfully.'))
  .then(() => addCSVExtension('./arquivos-csv'))
  .then(() => console.log('All files downloaded, extracted and renamed successfully.'))
  .then(() => connectionDB())
  .catch((err) => console.log(err));
