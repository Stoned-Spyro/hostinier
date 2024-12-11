// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  deployToS3: async (data) => await ipcRenderer.invoke('deploy-to-s3', data),
  chooseFolder: async () => ipcRenderer.invoke('choose-folder'),
  chooseFile: async () => ipcRenderer.invoke('choose-file'),
  checkAWSCLI: async () => await ipcRenderer.invoke('check-aws-cli'),
  chooseCustomPolicy: async () => await ipcRenderer.invoke('choose-custom-policy'),
  checkCloudflareRequirements: async () => await ipcRenderer.invoke('check-cloudflare-requirements'),
  deployToCloudflare: async (data) => await ipcRenderer.invoke('deploy-to-cloudflare', data)
});