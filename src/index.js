const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { error } = require('console');
const { stdout, stderr } = require('process');

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

ipcMain.handle('check-aws-cli', async () => {
  try {

    await new Promise((resolve, reject) => {
      exec('aws --version', (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`AWS CLI is not installed: ${error}`));
        }
        resolve(stdout);
      });
    });

    await new Promise((resolve, reject) => {
      exec('aws sts get-caller-identity', (error, stdout, stderr) => {
        if (error) {
          return reject(new Error('AWS CLI is not configured. Please run "aws configure".'));
        }
        resolve(stdout);
      });
    });

    return { success: true, message: 'AWS CLI is installed and configured.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('deploy-to-s3', async (event, { bucketName, region, indexFilePath, errorFilePath, projectPath }) => {
  try {
    // Step 1: Create S3 Bucket
    const createBucketCommand = `aws s3api create-bucket --bucket ${bucketName} --region ${region}`;
    exec(createBucketCommand, (error, stdout, stderr) => {
      if (error) {
        throw new Error(`Create bucket error: ${stderr}`);
      }
    });

    const deletePublicAccessBlock = `aws s3api delete-public-access-block --bucket ${bucketName}`
    exec(deletePublicAccessBlock, (error, stdout, srderr) =>{
      if(error) {
        throw new Error(`delete Public Access block error: ${stderr}`)
      }
    })
    // Step 2: Upload Project Folder to S3
    const uploadFolderCommand = `aws s3 sync "${projectPath}" s3://${bucketName}/ --acl public-read`;
    exec(uploadFolderCommand, (error, stdout, stderr) => {
      if (error) {
        throw new Error(`Upload folder error: ${stderr}`);
      }
    });

    // Step 3: Configure Static Website Hosting
    const websiteConfigCommand = `aws s3 website s3://${bucketName}/ --index-document ${indexFilePath} ${errorFilePath ? `--error-document ${errorFilePath}` : ''}`;
    exec(websiteConfigCommand, (error, stdout, stderr) => {
      if (error) {
        throw new Error(`Website configuration error: ${stderr}`);
      }
    });


    return { success: true };
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
