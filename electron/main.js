const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const serve = require('electron-serve');

const loadURL = serve({ directory: 'dist' });

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
    },
    title: 'JMusic',
    backgroundColor: '#121212',
    autoHideMenuBar: true,
  });

  if (isDev && process.env.IS_DEV) {
    win.loadURL('http://localhost:8081'); // For local development with Expo dev server
  } else {
    loadURL(win);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
