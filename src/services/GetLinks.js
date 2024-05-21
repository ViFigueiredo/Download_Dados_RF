const axios = require('axios');
const cheerio = require('cheerio');
const readline = require('readline');

async function getLinks(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const links = [];

  $('table tr').each((i, row) => {
    // Pule o cabeçalho da tabela
    if (i === 0) return;

    const cells = $(row).find('td');
    const linkElement = $(cells[1]).find('a');
    const lastModified = $(cells[2]).text().trim();
    const href = linkElement.attr('href');

    const link = {
      url: href,
      lastModified,
    };

    if (
      link.url == '/' ||
      link.url == 'regime_tributario/' ||
      link.url == '/CNPJ/' ||
      link.url == undefined ||
      link.url.endsWith('.pdf') ||
      link.url.endsWith('.odt')
    )
      return;

    link.url = url + href;
    links.push(link);
  });

  return links
}

async function askUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('O link é mais recente. Você deseja substituir? (s/n) ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 's');
    });
  });
}

module.exports = { getLinks, askUser };
