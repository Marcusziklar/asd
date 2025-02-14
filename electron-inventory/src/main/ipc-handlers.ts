import { ipcMain } from "electron"
import type { DatabaseService } from "./database"

export function setupIpcHandlers(db: DatabaseService) {
  // Products
  ipcMain.handle("products:getAll", () => {
    return db.getAllProducts()
  })

  ipcMain.handle("products:get", (_, id: number) => {
    return db.getProduct(id)
  })

  ipcMain.handle("products:add", (_, product) => {
    return db.addProduct(product)
  })

  ipcMain.handle("products:update", (_, id: number, updates) => {
    return db.updateProduct(id, updates)
  })

  ipcMain.handle("products:delete", (_, id: number) => {
    return db.deleteProduct(id)
  })

  ipcMain.handle("products:search", (_, query: string) => {
    return db.searchProducts(query)
  })

  // Categories
  ipcMain.handle("categories:getAll", () => {
    return db.getAllCategories()
  })

  ipcMain.handle("categories:add", (_, name: string) => {
    return db.addCategory(name)
  })

  // Suppliers
  ipcMain.handle("suppliers:getAll", () => {
    return db.getAllSuppliers()
  })

  ipcMain.handle("suppliers:add", (_, supplier) => {
    return db.addSupplier(supplier)
  })

  // Brands
  ipcMain.handle("brands:getAll", () => {
    return db.getAllBrands()
  })

  ipcMain.handle("brands:add", (_, name: string) => {
    return db.addBrand(name)
  })

  // Stats
  ipcMain.handle("stats:get", () => {
    return db.getStats()
  })

  // Activity
  ipcMain.handle("activity:getRecent", (_, limit?: number) => {
    return db.getRecentActivity(limit)
  })
}

