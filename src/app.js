const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');
const moment = require('moment');

const url = 'https://dados.rfb.gov.br/CNPJ/';
const dirFiles = path.join('./', 'files');
const lastDownloadFile = path.join(__dirname, 'lastDownload.json');
const utcBR = 'DD-MM-YYYY HH:mm:ss';

let lastDownloadData = {
    date: null,
    fileName: null
};

if (fs.existsSync(lastDownloadFile)) {
    const data = fs.readFileSync(lastDownloadFile, 'utf8');
    lastDownloadData = {
        date: moment(data[0], utcBR),
        fileName: data[1]
    };
}

if (!fs.existsSync(dirFiles)) fs.mkdirSync(dirFiles);

axios.get(url).then(response => {
    const fileData = extractFileData(response.data);

    let dadosEmJson = JSON.stringify(fileData, null, 2);
    fs.writeFile(lastDownloadFile, dadosEmJson, (erro) => {
        if (erro) throw erro;
        console.log('Dados salvos com sucesso!');
    });

    /*fileData.forEach(({ link, lastModified }) => {
        const fileName = path.basename(link);
        const filePath = path.join(dirFiles, fileName);
        const fileLastModifiedDate = moment(lastModified, utcBR);

        if (fileLastModifiedDate.isBefore(lastDownloadData.date)) {
            console.log(`O arquivo ${fileName} já existe e é a versão mais recente.`);
            return;
        }

        const progressBar = new cliProgress.MultiBar({
            clearOnComplete: true,
            hideCursor: true,
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            format: `${fileName}: |` + colors.cyan('{bar}') + '| {percentage}% || ETA: {eta}ms || Vel.: {speed}',
        });

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Arquivo ${fileName} removido.`);
        }

        axios({
            url: link,
            responseType: 'stream',
        }).then(response => {
            const totalLength = response.headers['content-length'];
            let downloadedLength = 0;
            let startTime = Date.now();

            progressBar.create(totalLength, 0, { speed: "N/A" });

            response.data.on('data', (chunk) => {
                downloadedLength += chunk.length;
                const elapsedTime = Date.now() - startTime;
                const speed = ((downloadedLength / elapsedTime) / 1000).toFixed(2) + ' MB/s';
                progressBar.update(downloadedLength, { speed });
            });

            response.data.pipe(fs.createWriteStream(`${dirFiles}/${fileName}`))
                .on('finish', () => {
                    progressBar.stop();
                    fs.writeFileSync(lastDownloadFile, `${moment().format(utcBR)}\n${fileName}`);
                });
        });
    });*/
}).catch(error => console.error(error));

function extractFileData(html) {
    const $ = cheerio.load(html);
    const fileData = [];
    $('table tr').each((index, element) => {
        if (index > 1) { // Ignora as duas primeiras linhas (cabeçalho e linha horizontal)
            const columns = $(element).find('td');
            const linkElement = $(columns[1]).find('a');
            const link = linkElement.attr('href');
            const lastModified = $(columns[2]).text().trim();
            if (link && link.endsWith('.zip')) {
                fileData.push({ filename: link, link: url + link, lastModified });
            }
        }
    });
    return fileData;
}
