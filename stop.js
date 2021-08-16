const { errorLogger } = require("./logger");
var fs = require("fs");
fs.readFile("pid.pid", "utf8", function(err, data) {
    if (err) {
        return errorLogger.error("Erro on stop command. Errors:", err);
    }
    process.kill(data);
});