fs = require('fs')
fs.readFile('pid.pid', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  process.kill(data);
});