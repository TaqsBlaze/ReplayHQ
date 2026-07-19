const { app, BrowserWindow, shell } = require('electron')
const path = require('node:path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    }
  })

  // Determine whether to load from dev server or built files
  if (process.env.VITE_DEV_SERVER_URL) {
    // Load from Vite dev server
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else if (app.isPackaged) {
    // Production: load from local files
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  } else {
    // Development: load from Vite dev server (fallback)
    win.loadURL('http://localhost:3000')
  }

  // Open DevTools in development
  if (!app.isPackaged) {
    win.webContents.openDevTools()
  }

  // Open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})