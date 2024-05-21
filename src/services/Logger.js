const winston = require('winston');
require('winston-daily-rotate-file');

const logDir = 'logs';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'DD-MM-YYYY HH:mm:ss',
    }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: `${logDir}/%DATE%-results.log`,
      datePattern: 'DD-MM-YYYY',
    }),
  ],
});

module.exports = logger;
