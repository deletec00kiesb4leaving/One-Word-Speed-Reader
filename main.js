const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const removeMd = require('remove-markdown');

let mainWindow;
let displayWindow;
let readingTimeout;
let globalWords = [];
let globalSpeed = 300;
let globalWpm = 300;
let globalCurrentIndex = 0;
let isDark = false;
let userFontPath = null;

function startReading(words, speed) {
  if (readingTimeout) clearTimeout(readingTimeout);
  if (globalWords !== words) {
    globalCurrentIndex = 0;
    globalWords = words;
  }
  globalSpeed = speed;
  const wpm = Math.round(60000 / speed);
  if (displayWindow && !displayWindow.isDestroyed()) {
    displayWindow.webContents.send('update-wpm', wpm);
    displayWindow.webContents.send('reading-status', true);
  }
  function showNext() {
    if (globalCurrentIndex < words.length) {
      const word = words[globalCurrentIndex];
      mainWindow.webContents.send('update-index', globalCurrentIndex);
      if (displayWindow && !displayWindow.isDestroyed()) {
        displayWindow.webContents.send('update-index', globalCurrentIndex, words.length);
      }
      showWord(word);
      const extra = word.includes('.') ? 200 : 0;
      readingTimeout = setTimeout(showNext, globalSpeed + extra);
      globalCurrentIndex++;
    } else {
      globalCurrentIndex = 0;
      mainWindow.webContents.send('reading-done');
      if (displayWindow && !displayWindow.isDestroyed()) {
        displayWindow.webContents.send('reading-status', false);
      }
    }
  }
  showNext();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.loadURL('http://localhost:5173');
}

function showWord(word) {
  if (!displayWindow || displayWindow.isDestroyed()) {
    displayWindow = new BrowserWindow({
      width: 400,
      height: 300,
      resizable: true,
      alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, 'display-preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });
    displayWindow.loadFile(path.join(__dirname, 'display.html'));
    displayWindow.webContents.once('did-finish-load', () => {
      updateDisplayTheme();
      updateDisplayFont();
      if (globalWpm) displayWindow.webContents.send('update-wpm', globalWpm);
      displayWindow.webContents.executeJavaScript(`document.getElementById('word').innerText = '${word.replace(/'/g, "\\'")}'`);
    });
  } else {
    displayWindow.webContents.executeJavaScript(`document.getElementById('word').innerText = '${word.replace(/'/g, "\\'")}'`);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('open-file', async () => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  });
  if (!result.canceled) {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf8');
    const plainText = removeMd(content);
    const words = plainText.split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9.'.]/g, '')).filter(w => w.length > 0);
    const fileName = path.basename(filePath);
    return { words, fileName };
  }
});

ipcMain.handle('start-reading', (event, words, speed) => {
  startReading(words, speed);
});

ipcMain.handle('stop-reading', () => {
  if (readingTimeout) {
    clearTimeout(readingTimeout);
    readingTimeout = null;
  }
  if (displayWindow && !displayWindow.isDestroyed()) {
    displayWindow.webContents.send('reading-status', false);
  }
});

ipcMain.handle('stop-from-display', () => {
  if (readingTimeout) {
    clearTimeout(readingTimeout);
    readingTimeout = null;
  }
  mainWindow.webContents.send('stop-from-display');
  if (displayWindow && !displayWindow.isDestroyed()) {
    displayWindow.webContents.send('reading-status', false);
  }
});

ipcMain.handle('start-from-display', () => {
  if (globalWords.length > 0) {
    startReading(globalWords, globalSpeed);
    mainWindow.webContents.send('start-from-display');
  }
});

ipcMain.handle('toggle-dark', () => {
  isDark = !isDark;
  updateDisplayTheme();
});

ipcMain.handle('select-font', async () => {
  console.log('Opening font dialog');
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Fonts', extensions: ['ttf', 'otf'] }],
    defaultPath: '/Library/Fonts',
  });
  console.log('Dialog result:', result);
  if (!result.canceled) {
    return result.filePaths[0];
  }
});

ipcMain.handle('set-font', (event, fontPath) => {
  userFontPath = fontPath;
  updateDisplayFont();
});

ipcMain.handle('set-wpm', (event, wpm) => {
  globalWpm = wpm;
});

function updateDisplayTheme() {
  if (displayWindow && !displayWindow.isDestroyed()) {
    const bgColor = isDark ? '#2c2c2c' : '#f0f0f0';
    const color = isDark ? 'white' : 'black';
    const btnBg = isDark ? '#555' : '#ccc';
    const btnHover = isDark ? '#666' : '#bbb';
    displayWindow.webContents.executeJavaScript(`
      document.body.style.backgroundColor = '${bgColor}';
      document.body.style.color = '${color}';
      document.documentElement.style.setProperty('--btn-bg', '${btnBg}');
      document.documentElement.style.setProperty('--btn-hover', '${btnHover}');
      const buttons = document.querySelectorAll('.buttons button');
      buttons.forEach(btn => {
        btn.style.color = '${color}';
      });
    `);
  }
}

function updateDisplayFont() {
  if (displayWindow && !displayWindow.isDestroyed() && userFontPath) {
    const fontUrl = `file://${userFontPath.replace(/\\/g, '/')}`;
    displayWindow.webContents.executeJavaScript(`
      const style = document.createElement('style');
      style.textContent = \`
        @font-face {
          font-family: 'UserFont';
          src: url('${fontUrl}');
        }
        body { font-family: 'UserFont', Arial; }
      \`;
      document.head.appendChild(style);
    `);
  }
}