const { runCLIScript } = require('./cli-utils');

function deployToCloudflare(config, folderPath) {
  const commands = `
    cd ${folderPath} &&
    wrangler login &&
    wrangler publish --name ${config.projectName}
  `;

  return runCLIScript(commands);
}

module.exports = {
  deployToCloudflare,
};