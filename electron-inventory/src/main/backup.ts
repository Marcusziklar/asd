import fs from "fs"
import path from "path"
import { app } from "electron"
import type { DatabaseService } from "./database"

export class BackupService {
  private db: DatabaseService

  constructor(db: DatabaseService) {
    this.db = db
  }

  async createBackup() {
    const backupDir = path.join(app.getPath("userData"), "backups")
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir)
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-")
    const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`)

    await this.db.backup(backupPath)
    return backupPath
  }

  async restoreBackup(backupPath: string) {
    await this.db.restore(backupPath)
  }

  getBackupList() {
    const backupDir = path.join(app.getPath("userData"), "backups")
    if (!fs.existsSync(backupDir)) {
      return []
    }

    return fs
      .readdirSync(backupDir)
      .filter((file) => file.endsWith(".sqlite"))
      .map((file) => ({
        name: file,
        path: path.join(backupDir, file),
        date: fs.statSync(path.join(backupDir, file)).mtime,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }
}

