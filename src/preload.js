// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  chooseService: (service) => ipcRenderer.send('choose-service', service),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  deployApp: (params) => ipcRenderer.invoke('deploy-app', params),
  goBack: () => ipcRenderer.send('go-back'),
  getSharedState: () => ipcRenderer.invoke('get-shared-state'),
});