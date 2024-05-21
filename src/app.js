const fs = require('fs');
const { getLinks, askUser } = require('./services/GetLinks');
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
// let allLinks = [];
// getLinks(baseURL)
//   .then((links) => {
//     allLinks = allLinks.concat(links);
//     return getLinks(baseURL + 'regime_tributario/');
//   })
//   .then((links) => {
//     allLinks = allLinks.concat(links);

//     // Escreva todos os links em um arquivo JSON na raiz do projeto
//     fs.writeFile('./src/links.json', JSON.stringify(allLinks, null, 2), (err) => {
//       if (err) throw err;
//       logger.info('Arquivo salvo com sucesso!');
//       console.log('Arquivo salvo com sucesso!');
//     });
//   })
//   .then(async () => {
//     //   const filesToDownload = await askFilesToDownload(links);
//     //   for (const link of filesToDownload) {
//     //     const fileName = link.split('/').pop();
//     //     const downloadPath = `./arquivos-zip/${fileName}`;
//     //     logger.info(`Starting download of ${fileName}`);
//     //     await downloadFile(link, downloadPath);
//     //     logger.info(`Finished download of ${fileName}`);
//     //     logger.info(`Starting extraction of ${fileName}`);
//     //     await unzipFile(downloadPath, './arquivos-csv');
//     //     logger.info(`Finished extraction of ${fileName}`);
//     //   }
//     // })
//     // .then(() => logger.info('All files downloaded and extracted successfully.'))
//     // .then(() => addCSVExtension('./arquivos-csv'))
//     // .then(() => logger.info('All files downloaded, extracted and renamed successfully.'))
//     // .then(() => connectionDB())
//     // .then(() => {
//     //   const fileNames = getFileNames('./arquivos-csv');
//     //   logger.info(fileNames);
//     //   Object.keys(fileNames).forEach((fileName) => {
//     //     importCsvToTable(fileName, fileNames);
//     //   });
//   })
//   .catch((err) => logger.info(err));

async function main() {
  const links1 = await getLinks(baseURL);
  const links2 = await getLinks(baseURL + 'regime_tributario/');
  const allLinks = links1.concat(links2);

  let existingLinks;
  try {
    existingLinks = JSON.parse(fs.readFileSync('./src/links.json'));
  } catch (err) {
    existingLinks = [];
    console.log(err);
    logger.info(err);
  }

  for (const link of allLinks) {
    const existingLink = existingLinks.find((l) => l.url === link.url);

    if (existingLink) {
      if (new Date(link.lastModified) > new Date(existingLink.lastModified)) {
        console.log(`O link ${link.url} é mais recente.`);

        const replace = await askUser();
        if (replace) {
          existingLink.lastModified = link.lastModified;
        }
      }
    } else {
      existingLinks.push(link);
    }
  }

  fs.writeFile('./src/links.json', JSON.stringify(existingLinks, null, 2), (err) => {
    if (err) throw err;
    console.log('Arquivo salvo com sucesso!');
  });
}

main().catch(console.error);
