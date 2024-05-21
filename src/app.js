const getLinks = require('./services/GetLinks');
const askFilesToDownload = require('./services/TerminalQuestions');
const downloadFile = require('./services/DownloadFile');
const { initDirs, unzipFile, addCSVExtension } = require('./services/UnzipFiles');
const { getFileNames } = require('./services/MapFiles');
const connectionDB = require('./services/ConnectionDb');
const importCsvToTable = require('./services/InsertData');
const logger = require('./services/Logger');

const baseURL = 'https://dados.rfb.gov.br/CNPJ/';

initDirs();

// Inicia o processo de obtenção de links, download e extração
getLinks(baseURL)
  .then(() => getLinks(baseURL + 'regime_tributario/'))
  .then(async (links) => {
    const filesToDownload = await askFilesToDownload(links);
    for (const link of filesToDownload) {
      const fileName = link.split('/').pop();
      const downloadPath = `./arquivos-zip/${fileName}`;

      logger.info(`Starting download of ${fileName}`);
      await downloadFile(link, downloadPath);
      logger.info(`Finished download of ${fileName}`);

      logger.info(`Starting extraction of ${fileName}`);
      await unzipFile(downloadPath, './arquivos-csv');
      logger.info(`Finished extraction of ${fileName}`);
    }
  })
  .then(() => logger.info('All files downloaded and extracted successfully.'))
  .then(() => addCSVExtension('./arquivos-csv'))
  .then(() => logger.info('All files downloaded, extracted and renamed successfully.'))
  .then(() => connectionDB())
  .then(() => {
    const fileNames = getFileNames('./arquivos-csv');
    logger.info(fileNames);
    Object.keys(fileNames).forEach((fileName) => {
      importCsvToTable(fileName, fileNames);
    });
  })
  .catch((err) => logger.info(err));
