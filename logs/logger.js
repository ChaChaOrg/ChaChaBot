const winston = require('winston');
const { format } = require('winston');

const logger = winston.createLogger({
    level: 'debug',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(debug => `${debug.timestamp} ${debug.level}: ${debug.message}` + (debug.splat !== undefined ? `${debug.splat}` : " "))
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.Console({level: 'debug'}),
        new winston.transports.File({ filename: './error.log', level: 'error' }),
        new winston.transports.File({ filename: './combined.log' }),
    ],
});

module.exports = logger;
