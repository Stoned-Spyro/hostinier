const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { checkAWSCLI, deployToAWS } = require('./backend/aws');
const { deployToCloudflare } = require('./backend/cloudflare');

require('electron-reload')(path.join(__dirname, '../'), {
  electron: path.join(__dirname, '../node_modules/.bin/electron'),
  hardResetMethod: 'exit',
});


const sharedState = {
  selectedService: null,
  awsConfig: null,
  cloudflareConfig: null,
  selectedFolder: null,
};


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
  mainWindow.webContents.openDevTools() 
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



ipcMain.handle('deploy-app', async (event, { service, config, folderPath }) => {
  try {
    if (service === 'aws') {
      await checkAWSCLI();
      return await deployToAWS(config, folderPath);
    } else if (service === 'cloudflare') {
      return await deployToCloudflare(config, folderPath);
    }
  } catch (error) {
    return { error: error.message };
  }
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

  return result.filePaths[0];
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
