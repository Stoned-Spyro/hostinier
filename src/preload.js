// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  deployApp: async (params) => ipcRenderer.invoke('deploy-app', params),
  chooseFolder: async () => ipcRenderer.invoke('choose-folder'),
  chooseFile: async () => ipcRenderer.invoke('choose-file'),
});