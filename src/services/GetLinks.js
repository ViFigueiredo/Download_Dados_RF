const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const retry = require('async-retry');

// Função para obter links de um site
const collectedLinks = [];

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

module.exports = getLinks;
