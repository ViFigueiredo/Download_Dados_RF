const getLinks = require('./services/GetLinks');
const askFilesToDownload = require('./services/TerminalQuestions');
const downloadFile = require('./services/DownloadFile');
const { initDirs, unzipFile, addCSVExtension } = require('./services/UnzipFiles');
const { getFileNames } = require('./services/MapFiles');
const connectionDB = require('./services/ConnectionDb');

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
  .then(() => {
    const fileNames = getFileNames('./arquivos-csv');
    console.log(fileNames);
  })
  .then(() => connectionDB())
  .catch((err) => console.log(err));
