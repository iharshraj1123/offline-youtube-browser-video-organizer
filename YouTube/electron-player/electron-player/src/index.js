const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
let deeplinkingUrl;
let popupUrl = "electron-ytplayer"
let pool = require("./ServerSide/controllers/mysqlRequests")
let earlyX, earlyY;
let newX, newY;
let first_show = false;

//Auto Launch
/*
let AutoLaunch = require("auto-launch");
let autoLauncher = new AutoLaunch({name:"electron-player"})
//checking if auto Launch in enabled
autoLauncher.isEnabled().then(function(isEnabled){
  if(isEnabled) return;
  autoLauncher.enable()
}).catch(function(err){thr(err)});*/
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit();
}
//------------------CREAT WINDOW--------------------------------------//
const createWindow = () => {
    let display = screen.getPrimaryDisplay();
    let widtho = display.bounds.width;
    let heighto = display.bounds.height;
    let wind_height = 330;
    let wind_width = 0;
    let minusX = 608;
    let minusY = 376;
    const mainWindow = new BrowserWindow({
      icon: `${__dirname}/resources/icons/yt logo hd 2.png`,
      show: false,
      height: wind_height,
      frame:false,
      minimizable: true,
      skipTaskbar:true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration:true,
        contextIsolation: false,
      },
    });
    earlyX = widtho - minusX;
    earlyY = heighto - minusY;
    mainWindow.setBounds({
      width: mainWindow.getSize()[0],
      height: mainWindow.getSize()[1],
      x: earlyX,
      y: earlyY
    });
    mainWindow.setAspectRatio(16/9);
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    //mainWindow.webContents.send('debuggero',mainWindow.BrowserWindow)

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
    
    ipcMain.on("closeApp",()=>{mainWindow.hide();/*mainWindow.minimize()/*app.quit()*/})
    ipcMain.on("fullscreenon",()=>{mainWindow.setFullScreen(true);})
    ipcMain.on("fullscreenoff",()=>{mainWindow.setFullScreen(false);})
    ipcMain.handle('getVidUrl', async (event, someArgument) => {
      let sql = `SELECT vid_name,link,subtitles FROM video_metadatas WHERE vid_id = ${someArgument}`
      const result = await pool.query(sql);
      return result[0]
    })
    ipcMain.handle('setnewpos', async (event, someArgument) => {
      //console.log([earlyX, earlyY])
      //mainWindow.setPosition(earlyX+someArgument.x, earlyY+someArgument.y)
      mainWindow.setBounds({
        width: wind_width || mainWindow.getSize()[0],
        height: wind_height,
        x: earlyX+someArgument.x,
        y: earlyY+someArgument.y
      });
      newX = earlyX+someArgument.x;
      newY = earlyY+someArgument.y;
      if(wind_width == 0) wind_width = Math.ceil(parseInt(wind_height)*16/9)
    })
    ipcMain.handle('settlenewpos', async (event, someArgument) => {
      earlyX=earlyX+someArgument.x; 
      earlyY=earlyY+someArgument.y;
      newX = earlyX;
      newY = earlyY;
    })
    ipcMain.on('settlemergency', () => {
      earlyX = newX;
      earlyY= newY;
    })
    mainWindow.on("will-resize",(event, newBounds)=>{
      earlyX = newBounds.x;
      earlyY = newBounds.y;
      newX = earlyX;
      newY = earlyY;
      wind_height= newBounds.height
      wind_width = newBounds.width
    })
    // Protocol handler for win32
    // if (process.platform == 'win32') {
      deeplinkingUrl = process.argv
      if(deeplinkingUrl.length>1){
        first_show = true;
        mainWindow.webContents.on('did-finish-load',function(){
          mainWindow.webContents.send('restart-app', deeplinkingUrl[deeplinkingUrl.length-1].replace(`${popupUrl}://`,""));
        })}
    // }
    // Force Single Instance Application
    const gotTheLock = app.requestSingleInstanceLock()
    if (gotTheLock) {
    app.on('second-instance', (e, argv) => {
      console.log("recieved info-->")
      //if(mainWindow.isMinimized()) mainWindow.restore()
      if(!mainWindow.isVisible()/*mainWindow.isMinimized()*/) {/*mainWindow.restore();*/mainWindow.show()}
      deeplinkingUrl = argv;
      mainWindow.webContents.send('restart-app', deeplinkingUrl[deeplinkingUrl.length-1].replace(`${popupUrl}://`,""));
    })
    } else {
      app.quit()
      return
    }

    // Log both at dev console and at running node console instance
    function logEverywhere(s) {
      console.log(s)
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`console.log("${s}")`)
      }
    }
    
    app.on('will-finish-launching', function() {
      // Protocol handler for osx
      app.on('open-url', function(event, url) {
        event.preventDefault()
        deeplinkingUrl = url
        logEverywhere('open-url# ' + deeplinkingUrl)
      })
    })

    mainWindow.webContents.on('did-finish-load',function(){
      if(first_show) {/*mainWindow.restore();*/mainWindow.show();}
    })
};
//-----------------mainWindow ENDS-------------------------------//


if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(popupUrl, process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient(popupUrl)
}


module.exports.getLink = () => link;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on('exit', function() {
  app.quit()
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// let pool = require("./controllers/mysqlRequests")
// const data = await pool.query(sql);
//const server = require('./ServerSide/app');
//const net = electron.remote.net;