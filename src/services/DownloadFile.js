const fs = require('fs');
const axios = require('axios');
const cliProgress = require('cli-progress');

// Função para formatar o tempo em hh:mm:ss
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

module.exports = downloadFile;
