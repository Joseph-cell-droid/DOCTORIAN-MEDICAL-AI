const { app, BrowserWindow, ipcMain, shell, Notification, Tray, Menu } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let tray = null;

const PORT = process.env.PORT || 3000;
const DEV_URL = `http://localhost:${PORT}`;

function isServerReady(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function waitForServer(maxRetries = 25, delayMs = 500) {
  for (let i = 0; i < maxRetries; i++) {
    const ready = await isServerReady(DEV_URL);
    if (ready) return true;
    await new Promise(r => setTimeout(r, delayMs));
  }
  return false;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#070b14',
    title: 'Doctorian Medical AI - Windows Workstation',
    icon: path.join(__dirname, '../public/logo-512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    },
    frame: true,
    show: false
  });

  // Check if server is running, or load local production build
  const serverOnline = await waitForServer(8, 400);

  if (serverOnline) {
    console.log(`[Doctorian Desktop] Connected to local server at ${DEV_URL}`);
    await mainWindow.loadURL(DEV_URL);
  } else {
    const localIndexPath = path.join(__dirname, '../dist/index.html');
    console.log(`[Doctorian Desktop] Loading standalone bundle: ${localIndexPath}`);
    await mainWindow.loadFile(localIndexPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-system-metrics', async () => {
  const os = require('os');
  return {
    platform: process.platform,
    arch: process.arch,
    totalMemoryGB: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1),
    freeMemoryGB: (os.freemem() / (1024 * 1024 * 1024)).toFixed(1),
    cpus: os.cpus().length,
    hostname: os.hostname(),
    uptimeHours: (os.uptime() / 3600).toFixed(1)
  };
});

ipcMain.handle('check-hardware-telemetry', async () => {
  return {
    arduinoConnected: false,
    bleAvailable: true,
    sensorBaudRate: 115200,
    status: 'ready'
  };
});

ipcMain.on('show-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title: title || 'Doctorian Medical AI',
      body: body || 'Clinical Telemetry Synchronized',
      icon: path.join(__dirname, '../public/logo-192.png')
    }).show();
  }
});

ipcMain.on('open-external', (event, url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    shell.openExternal(url);
  }
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

app.whenReady().then(async () => {
  await createWindow();

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
