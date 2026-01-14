const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('displayAPI', {
  start: () => ipcRenderer.invoke('start-from-display'),
  stop: () => ipcRenderer.invoke('stop-from-display'),
  onUpdateWpm: (callback) => ipcRenderer.on('update-wpm', callback),
  onReadingStatus: (callback) => ipcRenderer.on('reading-status', callback),
  onUpdateIndex: (callback) => ipcRenderer.on('update-index', callback),
});