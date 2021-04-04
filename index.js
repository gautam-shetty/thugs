const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow } = electron;

let mainWindow

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Listen for app to be ready
app.on('ready', () => {
    // Create new window
    mainWindow = new BrowserWindow({
      frame: false,
      fullscreen: true,
      resizable: false
    })

    // Load HTML into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol:'file:',
        slashes: true
    }))

    // Enable fullscreen to window
    mainWindow.maximize()

    // Disable menu
    // mainWindow.setMenu(null)
})