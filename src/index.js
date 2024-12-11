const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

// require('electron-reload')(path.join(__dirname, '../'), {
//   electron: path.join(__dirname, '../node_modules/.bin/electron'),
//   hardResetMethod: 'exit',
// });


function execPromise(command, customError) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`${customError}: ${stderr || error.message}`);
      } else {
        resolve(stdout);
      }
    });
  });
}


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1f212b',
      symbolColor: '#74b1be',
      height: 20

    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Ensure context isolation is enabled
      nodeIntegration: false, // Ensure nodeIntegration is disabled for security
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '/ui/index.html'));
  mainWindow.on('closed', () => (mainWindow = null));
  // mainWindow.webContents.openDevTools() 
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});


ipcMain.handle('choose-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('choose-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'HTML Files', extensions: ['html'] }],
  });

  if (result.canceled) {
    return null;
  }
  const filePath = result.filePaths[0];
  const fileName = filePath.replace(/^.*[\\\/]/, "");
  return fileName;
});

ipcMain.handle('choose-custom-policy', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  });

  if (result.canceled) {
    return null;
  }
  const filePath = result.filePaths[0];
  return filePath;
});

ipcMain.handle('check-aws-cli', async () => {
  try {

    await execPromise('aws --version', 'AWS CLI is not installed')
    await execPromise('aws sts get-caller-identity', 'AWS CLI is not configured. Please run "aws configure".')
    return { success: true, message: 'AWS CLI is installed and configured.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('deploy-to-s3', async (event, { bucketName, region, indexFilePath, errorFilePath, projectPath, allowPublicAccess, customPolicy }) => {

  try {

    await execPromise(`aws s3api create-bucket --bucket ${bucketName} --region ${region}`, 'Create bucket error')

    await execPromise(`aws s3api delete-public-access-block --bucket ${bucketName}`, 'delete Public Access block error')

    if(allowPublicAccess && !customPolicy){
      const bucketPolicy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`,
          },
        ],
      });
      const escapedPolicy = bucketPolicy.replace(/"/g, '\\"');

      await execPromise(`aws s3api put-bucket-policy --bucket ${bucketName} --policy "${escapedPolicy}"`, 'Apply policy error')
    }

    if(!allowPublicAccess && customPolicy){
      await execPromise(`aws s3api put-bucket-policy --bucket ${bucketName} --policy file://${customPolicy}`, 'Apply custom policy error')
    }
    await execPromise(`aws s3 sync "${projectPath}" s3://${bucketName}/`, 'Upload folder error' )
    await execPromise(`aws s3 website s3://${bucketName}/ --index-document ${indexFilePath} ${errorFilePath ? `--error-document ${errorFilePath}` : ''}`,'Website configuration error');

    return { success: true, message: 'Folder was deployed' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-cloudflare-requirements', async () => {
  try {
    // Check if Wrangler CLI is installed
    const checkWranglerCommand = 'wrangler --version';
    const wranglerOutput = await execPromise(checkWranglerCommand, 'Wrangler is not isntalled');

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('deploy-to-cloudflare', async (event, { projectName, accountId, apiToken, projectPath }) => {
  try {
    const indexFilePath = path.join(projectPath, 'cloudfareIndex.js');
    const indexFileContent = `
    export default {
      async fetch(request, env, ctx) {
        const { pathname } = new URL(request.url);
    
        if (pathname === '/') {
          return new Response('Welcome to your Cloudflare Worker!', {
            headers: { 'Content-Type': 'text/plain' },
          });
        } else if (pathname === '/api') {
          return new Response(JSON.stringify({ message: 'Hello from the API!' }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
    
        return new Response('404 Not Found', { status: 404 });
      },
    };
        `.trim();
        fs.writeFileSync(indexFilePath, indexFileContent);
    // Configure Wrangler project
    const configFilePath = path.join(projectPath, 'wrangler.toml');
    const wranglerConfig = `
      name = "${projectName}"
      account_id = "${accountId}"
      main = "./cloudfareIndex.js"
      compatibility_date = "${new Date().toISOString().split('T')[0]}"
    `;
    await fs.writeFileSync(configFilePath, wranglerConfig);

    // Deploy using Wrangler
    const deployCommand = `wrangler publish --api-key ${apiToken} --env production --cwd "${projectPath}"`;
    const output = await execPromise(deployCommand, 'Publish error');

    // Extract live URL from Wrangler output
    const urlMatch = output.match(/https:\/\/.+\.pages\.dev/);
    const appUrl = urlMatch ? urlMatch[0] : 'Unknown URL';

    return { success: true, appUrl };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
