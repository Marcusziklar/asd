import { BrowserWindow, ipcMain } from "electron"

export function setupBarcodeScannerHandlers(mainWindow: BrowserWindow) {
  let scannerWindow: BrowserWindow | null = null

  ipcMain.on("open-barcode-scanner", () => {
    if (scannerWindow) {
      scannerWindow.focus()
      return
    }

    scannerWindow = new BrowserWindow({
      width: 800,
      height: 600,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: "./preload-scanner.js",
      },
    })

    scannerWindow.loadFile("scanner.html")

    scannerWindow.on("closed", () => {
      scannerWindow = null
    })
  })

  ipcMain.on("barcode-scanned", (event, barcode) => {
    mainWindow.webContents.send("barcode-result", barcode)
    if (scannerWindow) {
      scannerWindow.close()
    }
  })
}

