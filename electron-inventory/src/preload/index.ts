import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
  // Products
  getAllProducts: () => ipcRenderer.invoke("products:getAll"),
  getProduct: (id: number) => ipcRenderer.invoke("products:get", id),
  addProduct: (product: any) => ipcRenderer.invoke("products:add", product),
  updateProduct: (id: number, updates: any) => ipcRenderer.invoke("products:update", id, updates),
  deleteProduct: (id: number) => ipcRenderer.invoke("products:delete", id),
  searchProducts: (query: string) => ipcRenderer.invoke("products:search", query),

  // Categories
  getAllCategories: () => ipcRenderer.invoke("categories:getAll"),
  addCategory: (name: string) => ipcRenderer.invoke("categories:add", name),

  // Suppliers
  getAllSuppliers: () => ipcRenderer.invoke("suppliers:getAll"),
  addSupplier: (supplier: any) => ipcRenderer.invoke("suppliers:add", supplier),

  // Brands
  getAllBrands: () => ipcRenderer.invoke("brands:getAll"),
  addBrand: (name: string) => ipcRenderer.invoke("brands:add", name),

  // Stats
  getStats: () => ipcRenderer.invoke("stats:get"),

  // Activity
  getRecentActivity: (limit?: number) => ipcRenderer.invoke("activity:getRecent", limit),

  // Label Templates
  getLabelTemplates: () => ipcRenderer.invoke("labelTemplates:getAll"),
  addLabelTemplate: (template: any) => ipcRenderer.invoke("labelTemplates:add", template),
  updateLabelTemplate: (id: number, updates: any) => ipcRenderer.invoke("labelTemplates:update", id, updates),
  deleteLabelTemplate: (id: number) => ipcRenderer.invoke("labelTemplates:delete", id),

  // Sales Data
  getSalesData: () => ipcRenderer.invoke("sales:getData"),

  // App Info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
})

