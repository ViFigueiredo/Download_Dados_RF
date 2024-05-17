const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const retry = require('async-retry');
const cliProgress = require('cli-progress');
const extract = require('extract-zip');

const baseURL = 'https://dados.rfb.gov.br/CNPJ/';
const collectedLinks = [];

// Função para formatar o tempo em hh:mm:ss
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function getLinks(baseUrl) {
  const { data } = await retry(async bail => {
    const response = await axios.get(baseUrl);
    if (response.status === 404 || response.status.toString().startsWith('5')) bail(new Error('Failed to fetch page'));
    return response;
  }, {
    retries: 5,
  });

  const $ = cheerio.load(data);
  const linkElements = $('a').toArray();

  await Promise.all(linkElements.map(async (element) => {
    const link = $(element).attr('href');
    const fullUrl = url.resolve(baseUrl, link);
    if (fullUrl.endsWith('.zip')) {
      collectedLinks.push(fullUrl);
    }
  }));

  return collectedLinks;
}

async function downloadFile(fileUrl, outputLocationPath) {
  const writer = fs.createWriteStream(outputLocationPath);
  const response = await axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  });

  const totalLength = response.headers['content-length'];
  let downloadedLength = 0;

  const progressBar = new cliProgress.SingleBar({
    format: 'Downloading |' + '{bar}' + '| {percentage}% || ETA: {eta_formatted}',
    barCompleteChar: '=',
    barIncompleteChar: ' ',
    hideCursor: true
  });

  progressBar.start(100, 0, {
    eta_formatted: "calculando..."
  });

  const startTime = process.uptime();

  response.data.on('data', (chunk) => {
    downloadedLength += chunk.length;
    const remainingLength = totalLength - downloadedLength;
    const speed = downloadedLength / (process.uptime() - startTime); // bytes per second
    const eta = Math.round(remainingLength / speed); // estimated time remaining in seconds

    progressBar.update(downloadedLength / totalLength * 100, {
      eta_formatted: formatTime(eta)
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

async function unzipFile(inputPath, outputPath) {
  try {
    const absoluteOutputPath = path.resolve(outputPath);
    await extract(inputPath, { dir: absoluteOutputPath });
    console.log(`Extracted ${inputPath} to ${absoluteOutputPath}`);

    fs.readdirSync(absoluteOutputPath).forEach(file => {
      const oldPath = path.join(absoluteOutputPath, file);
      const newPath = path.join(absoluteOutputPath, file + '.csv');
      fs.renameSync(oldPath, newPath);
    });

  } catch (err) {
    console.error(`Error extracting ${inputPath}: ${err}`);
  }
}

getLinks(baseURL)
  .then(() => getLinks(baseURL + 'regime_tributario/'))
  .then(async (links) => {
    // console.log(links);
    for (const link of links) {
      const fileName = link.split('/').pop();
      const downloadPath = `./arquivos-zip/${fileName}`;
      console.log(`Starting download of ${fileName}`);
      await downloadFile(link, downloadPath);
      console.log(`Finished download of ${fileName}`);
      console.log(`Starting extraction of ${fileName}`);
      await unzipFile(downloadPath, './arquivos-csv');
      console.log(`Finished extraction of ${fileName}`);
    }
    console.log('All files downloaded and extracted successfully.');
  });
