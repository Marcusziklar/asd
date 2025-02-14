import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path"
import { setupIpcHandlers } from "./ipc-handlers"
import { DatabaseService } from "./database"

let mainWindow: BrowserWindow | null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"))
  } else {
    mainWindow.loadURL("http://localhost:3000")
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  const db = new DatabaseService()
  setupIpcHandlers(db)
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// Handle any additional IPC messages here
ipcMain.handle("get-app-version", () => {
  return app.getVersion()
})

