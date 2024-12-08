const { exec } = require('child_process');
const { runCLIScript } = require('./cli-utils');

function checkAWSCLI() {
  return new Promise((resolve, reject) => {
    exec('aws --version', (error) => {
      if (error) {
        reject(new Error('AWS CLI is not installed. Please install it.'));
      } else {
        resolve();
      }
    });
  });
}

function deployToAWS(config, folderPath) {
  const commands = `
    aws configure set aws_access_key_id ${config.accessKey} &&
    aws configure set aws_secret_access_key ${config.secretKey} &&
    aws s3 sync ${folderPath} s3://${config.bucketName} --region ${config.region}
  `;

  return runCLIScript(commands);
}

module.exports = {
  checkAWSCLI,
  deployToAWS,
};