const { format, createLogger, transports } = require("winston");
const { timestamp, combine, printf } = format;
require("winston-daily-rotate-file");
const fs = require("fs");

function buildTransportWithLevel(level) {
  var transport = new transports.DailyRotateFile({
    name: level + "-file",
    level,
    datePattern: "YYYY-MM-DD",
    dirname: "logs",
    filename: level + "s-%DATE%.log",
    json: false,
    prepend: true,
  });
  return transport;
}

var errorsTransport = buildTransportWithLevel("error");

var warnsTransport = buildTransportWithLevel("warn");

var infosTransport = buildTransportWithLevel("info");

const logFormat = printf(({ level, message, timestamp, stack }) => {
  if (!stack) {
    return `${timestamp} ${level}: ${message}`;
  } else {
    return `${timestamp} ${level}: ${message}\n${stack}`;
  }
});

function loggerCreator(level) {
  let tempLogger = createLogger({
    format: combine(
      format.colorize(),
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.errors({
        stack: true,
      }),
      logFormat
    ),
    transports: [
      new transports.Console({
        level,
      }),
      level === "error"
        ? errorsTransport
        : level === "warn"
        ? warnsTransport
        : infosTransport,
    ],
  });
  return tempLogger;
}

const errorLogger = loggerCreator("error");

const warnLogger = loggerCreator("warn");

const infoLogger = loggerCreator("info");

function isFileEmpty(fileName, ignoreWhitespace = true) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(
        (!ignoreWhitespace && data.length === 0) ||
          (ignoreWhitespace && !!String(data).match(/^\s*$/))
      );
    });
  });
}

function doOnRotate(level, oldFileName) {
  try {
    infoLogger.info(level + " logger has been rotated.");
    var file = oldFileName.substr(0, 5);
    file = __dirname + "\\" + oldFileName;
    isFileEmpty(file)
      .then((isEmpty) => {
        if (isEmpty) {
          fs.unlinkSync(file);
          infoLogger.info(
            "Previous " + level + " log file deleted successfully."
          );
        }
      })
      .catch((err) => {
        errorLogger.error(
          "The rotation of the " + level + " logger has errors: " + err
        );
      });
  } catch (error) {
    errorLogger.error(
      "The rotation of the " + level + " logger has errors: " + error
    );
  }
}

errorsTransport.on("rotate", (oldFileName) => {
  doOnRotate("error", oldFileName);
});

warnsTransport.on("rotate", (oldFileName) => {
  doOnRotate("warn", oldFileName);
});

infosTransport.on("rotate", (oldFileName) => {
  doOnRotate("info", oldFileName);
});

module.exports = {
  errorLogger,
  warnLogger,
  infoLogger,
};
