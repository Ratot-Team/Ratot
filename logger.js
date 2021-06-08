const { format, createLogger, transports } = require("winston");
const { timestamp, combine, printf } = format;
require('winston-daily-rotate-file');
const fs = require('fs');

var errorsTransport = new transports.DailyRotateFile({
    name: 'error-file',
    level: 'error',
    datePattern: 'YYYY-MM-DD',
    dirname: 'logs',
    filename: 'errors-%DATE%.log',
    json: false,
    prepend: true
});

var warnsTransport = new transports.DailyRotateFile({
    name: 'warn-file',
    level: 'warn',
    datePattern: 'YYYY-MM-DD',
    dirname: 'logs',
    filename: 'warns-%DATE%.log',
    json: false,
    prepend: true
});

var infosTransport = new transports.DailyRotateFile({
    name: 'info-file',
    level: 'info',
    datePattern: 'YYYY-MM-DD',
    dirname: 'logs',
    filename: 'infos-%DATE%.log',
    json: false,
    prepend: true
});

const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const errorLogger = createLogger({
    format: combine(
        format.colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        logFormat
    ),
    transports: [
        new transports.Console({ level: 'error' }),
        errorsTransport
    ],
});

const warnLogger = createLogger({
    format: combine(
        format.colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        logFormat
    ),
    transports: [
        new transports.Console({ level: 'warn' }),
        warnsTransport
    ],
});

const infoLogger = createLogger({
    format: combine(
        format.colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        logFormat
    ),
    transports: [
        infosTransport
    ],
});

function isFileEmpty(fileName, ignoreWhitespace = true) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve((!ignoreWhitespace && data.length == 0) || (ignoreWhitespace && !!String(data).match(/^\s*$/)))
        });
    })
}

errorsTransport.on('rotate', (oldFileName, newFileName) => {
    try {
        infoLogger.info("Error logger has been rotated.");
        var file = oldFileName.substr(0, 5);
        file = __dirname + "\\" + oldFileName;
        isFileEmpty(file)
            .then((isEmpty) => {
                if (isEmpty) {
                    fs.unlinkSync(file);
                    infoLogger.info("Previous file deleted successfully.");
                }
            })
            .catch((err) => {
                errorLogger.error("The rotation of the error logger has errors: " + err);
            });
    } catch (error) {
        errorLogger.error("The rotation of the error logger has errors: " + error);
    }
})

warnsTransport.on('rotate', (oldFileName, newFileName) => {
    try {
        infoLogger.info("Warn logger has been rotated.");
        var file = oldFileName.substr(0, 5);
        file = __dirname + "\\" + oldFileName;
        isFileEmpty(file)
            .then((isEmpty) => {
                if (isEmpty) {
                    fs.unlinkSync(file);
                    infoLogger.info("Previous file deleted successfully.");
                }
            })
            .catch((err) => {
                errorLogger.error("The rotation of the info logger has errors: " + err);
            });
    } catch (error) {
        errorLogger.error("The rotation of the info logger has errors: " + error);
    }
})

infosTransport.on('rotate', (oldFileName, newFileName) => {
    try {
        infoLogger.info("Info logger has been rotated.");
        var file = oldFileName.substr(0, 5);
        file = __dirname + "\\" + oldFileName;
        isFileEmpty(file)
            .then((isEmpty) => {
                if (isEmpty) {
                    fs.unlinkSync(file);
                    infoLogger.info("Previous file deleted successfully.");
                }
            })
            .catch((err) => {
                errorLogger.error("The rotation of the info logger has errors: " + err);
            });
    } catch (error) {
        errorLogger.error("The rotation of the info logger has errors: " + error);
    }
})

module.exports = {
    errorLogger,
    warnLogger,
    infoLogger
}