const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  startReading: (words, speed) => ipcRenderer.invoke('start-reading', words, speed),
  stopReading: () => ipcRenderer.invoke('stop-reading'),
  toggleDark: () => ipcRenderer.invoke('toggle-dark'),
  selectFont: () => ipcRenderer.invoke('select-font'),
  setFont: (path) => ipcRenderer.invoke('set-font', path),
  setWpm: (wpm) => ipcRenderer.invoke('set-wpm', wpm),
  onUpdateIndex: (callback) => ipcRenderer.on('update-index', callback),
  onReadingDone: (callback) => ipcRenderer.on('reading-done', callback),
  onStartFromDisplay: (callback) => ipcRenderer.on('start-from-display', callback),
  onStopFromDisplay: (callback) => ipcRenderer.on('stop-from-display', callback),
});