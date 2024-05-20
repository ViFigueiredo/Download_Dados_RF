const inquirer = require('inquirer');

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

module.exports = askFilesToDownload;
