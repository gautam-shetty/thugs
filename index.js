const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu } = electron;

let mainWindow

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

//Listen for app to be ready
app.on('ready', () => {

    //Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false
          }
    });

    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol:'file:',
        slashes: true
    }))

    //Enable fullscreen to window
    mainWindow.maximize();

    const menu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(menu);
});

const mainMenuTemplate = [
    {
      label: 'Devtool',
      accelerator: 'Ctrl+D',
      click() {
        mainWindow.webContents.openDevTools();
      }
    },
    {
      label: 'Reload',
      accelerator: 'Ctrl+R',
      click() {
        mainWindow.reload();
      }
    }
  ];