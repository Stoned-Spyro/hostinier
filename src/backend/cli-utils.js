const { exec } = require('child_process');

function runCLIScript(commands) {
  return new Promise((resolve, reject) => {
    exec(commands, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = {
  runCLIScript,
};