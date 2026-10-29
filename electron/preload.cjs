const { contextBridge, ipcRenderer } = require('electron');

// Safe, restricted context bridge for Doctorian Medical AI
contextBridge.exposeInMainWorld('doctorianDesktop', {
  isElectron: true,
  platform: process.platform,
  version: '3.5.0',
  architecture: process.arch,
  getSystemMetrics: () => ipcRenderer.invoke('get-system-metrics'),
  checkHardwareTelemetry: () => ipcRenderer.invoke('check-hardware-telemetry'),
  sendNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close')
});
