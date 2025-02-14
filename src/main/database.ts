import Database from "better-sqlite3"
import path from "path"
import { app } from "electron"
import type { Product } from "../types"

export class DatabaseService {
  private db: Database.Database

  constructor() {
    const dbPath = path.join(app.getPath("userData"), "inventory.db")
    this.db = new Database(dbPath, { verbose: console.log })
    this.init()
  }

  private init() {
    // Enable foreign keys
    this.db.pragma("foreign_keys = ON")

    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        brand_id INTEGER,
        category_id INTEGER,
        stock INTEGER NOT NULL DEFAULT 0,
        price REAL NOT NULL DEFAULT 0,
        supplier_id INTEGER,
        description TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (brand_id) REFERENCES brands(id),
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        contact_name TEXT,
        email TEXT,
        phone TEXT
      );

      CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
      CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp);
      CREATE INDEX IF NOT EXISTS idx_product_history_product_id ON product_history(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_history_timestamp ON product_history(timestamp);
    `)
  }

  // Products
  getAllProducts() {
    const stmt = this.db.prepare(`
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
    `)
    return stmt.all()
  }

  getProduct(id: number) {
    const stmt = this.db.prepare(`
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `)
    return stmt.get(id)
  }

  addProduct(product: Omit<Product, "id">) {
    const stmt = this.db.prepare(`
      INSERT INTO products (
        name, sku, brand_id, category_id, stock, 
        price, supplier_id, description
      ) VALUES (
        @name, @sku, @brandId, @categoryId, @stock,
        @price, @supplierId, @description
      )
    `)

    const info = stmt.run(product)
    this.logActivity("create", "product", info.lastInsertRowid as number)
    return this.getProduct(info.lastInsertRowid as number)
  }

  updateProduct(id: number, updates: Partial<Product>) {
    const stmt = this.db.prepare(`
      UPDATE products 
      SET 
        name = COALESCE(@name, name),
        sku = COALESCE(@sku, sku),
        brand_id = COALESCE(@brandId, brand_id),
        category_id = COALESCE(@categoryId, category_id),
        stock = COALESCE(@stock, stock),
        price = COALESCE(@price, price),
        supplier_id = COALESCE(@supplierId, supplier_id),
        description = COALESCE(@description, description),
        last_updated = CURRENT_TIMESTAMP
      WHERE id = @id
    `)

    const info = stmt.run({ ...updates, id })
    if (info.changes > 0) {
      this.logActivity("update", "product", id)
      this.addProductHistoryEntry(id, "update", JSON.stringify(updates))
      return this.getProduct(id)
    }
    return null
  }

  deleteProduct(id: number) {
    const stmt = this.db.prepare("DELETE FROM products WHERE id = ?")
    const info = stmt.run(id)
    if (info.changes > 0) {
      this.logActivity("delete", "product", id)
      this.addProductHistoryEntry(id, "delete", "")
      return true
    }
    return false
  }

  searchProducts(query: string) {
    const stmt = this.db.prepare(`
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 
        p.name LIKE '%' || ? || '%' OR
        p.sku LIKE '%' || ? || '%' OR
        b.name LIKE '%' || ? || '%' OR
        c.name LIKE '%' || ? || '%' OR
        s.name LIKE '%' || ? || '%'
    `)
    return stmt.all(query, query, query, query, query)
  }

  // Categories
  getAllCategories() {
    return this.db.prepare("SELECT * FROM categories").all()
  }

  addCategory(name: string) {
    const stmt = this.db.prepare("INSERT INTO categories (name) VALUES (?)")
    const info = stmt.run(name)
    this.logActivity("create", "category", info.lastInsertRowid as number)
    return { id: info.lastInsertRowid, name }
  }

  // Suppliers
  getAllSuppliers() {
    return this.db.prepare("SELECT * FROM suppliers").all()
  }

  addSupplier(supplier: { name: string; contact_name?: string; email?: string; phone?: string }) {
    const stmt = this.db.prepare(`
      INSERT INTO suppliers (name, contact_name, email, phone)
      VALUES (@name, @contact_name, @email, @phone)
    `)
    const info = stmt.run(supplier)
    this.logActivity("create", "supplier", info.lastInsertRowid as number)
    return { id: info.lastInsertRowid, ...supplier }
  }

  // Brands
  getAllBrands() {
    return this.db.prepare("SELECT * FROM brands").all()
  }

  addBrand(name: string) {
    const stmt = this.db.prepare("INSERT INTO brands (name) VALUES (?)")
    const info = stmt.run(name)
    this.logActivity("create", "brand", info.lastInsertRowid as number)
    return { id: info.lastInsertRowid, name }
  }

  // Activity Log
  private logActivity(action: string, entityType: string, entityId: number, details?: string) {
    const stmt = this.db.prepare(`
      INSERT INTO activity_log (action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(action, entityType, entityId, details)
  }

  getRecentActivity(limit = 10) {
    return this.db
      .prepare(`
      SELECT * FROM activity_log
      ORDER BY timestamp DESC
      LIMIT ?
    `)
      .all(limit)
  }

  // Statistics
  getStats() {
    const totalProducts = this.db.prepare("SELECT COUNT(*) as count FROM products").get().count
    const totalStock = this.db.prepare("SELECT SUM(stock) as total FROM products").get().total || 0
    const totalCategories = this.db.prepare("SELECT COUNT(*) as count FROM categories").get().count
    const totalSuppliers = this.db.prepare("SELECT COUNT(*) as count FROM suppliers").get().count

    return {
      totalProducts,
      totalStock,
      totalCategories,
      totalSuppliers,
    }
  }

  addProductHistoryEntry(productId: number, action: string, details: string) {
    const stmt = this.db.prepare(`
      INSERT INTO product_history (product_id, action, details, timestamp)
      VALUES (?, ?, ?, datetime('now'))
    `)
    stmt.run(productId, action, details)
  }

  getProductHistory(productId: number) {
    const stmt = this.db.prepare(`
      SELECT * FROM product_history
      WHERE product_id = ?
      ORDER BY timestamp DESC
    `)
    return stmt.all(productId)
  }
}

