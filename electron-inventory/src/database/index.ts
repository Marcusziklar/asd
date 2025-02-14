import Database from "better-sqlite3"
import { SCHEMA } from "./schema"
import { app } from "electron"
import path from "path"
import type { Product, Category, Supplier, Brand } from "../types/database"

export class DatabaseService {
  private db: Database.Database

  constructor() {
    const dbPath = path.join(app.getPath("userData"), "inventory.db")
    this.db = new Database(dbPath)
    this.init()
  }

  private init() {
    this.db.exec(SCHEMA)
  }

  // Products
  getAllProducts(): Product[] {
    return this.db.prepare("SELECT * FROM products").all()
  }

  addProduct(product: Omit<Product, "id" | "lastUpdated">): Product {
    const stmt = this.db.prepare(`
      INSERT INTO products (name, sku, brand, category, stock, price, supplier, description, lastUpdated)
      VALUES (@name, @sku, @brand, @category, @stock, @price, @supplier, @description, datetime('now'))
    `)
    const result = stmt.run(product)
    return { ...product, id: result.lastInsertRowid as number, lastUpdated: new Date().toISOString() }
  }

  updateProduct(id: number, product: Partial<Product>): boolean {
    const updates = Object.entries(product)
      .filter(([key]) => key !== "id")
      .map(([key]) => `${key} = @${key}`)
      .join(", ")

    const stmt = this.db.prepare(`
      UPDATE products 
      SET ${updates}, lastUpdated = datetime('now')
      WHERE id = @id
    `)

    const result = stmt.run({ ...product, id })
    return result.changes > 0
  }

  deleteProduct(id: number): boolean {
    const stmt = this.db.prepare("DELETE FROM products WHERE id = ?")
    const result = stmt.run(id)
    return result.changes > 0
  }

  // Categories
  getAllCategories(): Category[] {
    return this.db.prepare("SELECT * FROM categories").all()
  }

  addCategory(name: string): Category {
    const stmt = this.db.prepare("INSERT INTO categories (name) VALUES (?)")
    const result = stmt.run(name)
    return { id: result.lastInsertRowid as number, name }
  }

  // Suppliers
  getAllSuppliers(): Supplier[] {
    return this.db.prepare("SELECT * FROM suppliers").all()
  }

  addSupplier(name: string): Supplier {
    const stmt = this.db.prepare("INSERT INTO suppliers (name) VALUES (?)")
    const result = stmt.run(name)
    return { id: result.lastInsertRowid as number, name }
  }

  // Brands
  getAllBrands(): Brand[] {
    return this.db.prepare("SELECT * FROM brands").all()
  }

  addBrand(name: string): Brand {
    const stmt = this.db.prepare("INSERT INTO brands (name) VALUES (?)")
    const result = stmt.run(name)
    return { id: result.lastInsertRowid as number, name }
  }

  // Search
  searchProducts(query: string): Product[] {
    return this.db
      .prepare(`
      SELECT * FROM products 
      WHERE name LIKE '%' || ? || '%' 
      OR sku LIKE '%' || ? || '%'
      OR brand LIKE '%' || ? || '%'
      OR category LIKE '%' || ? || '%'
      OR supplier LIKE '%' || ? || '%'
    `)
      .all(query, query, query, query, query)
  }
}

export const db = new DatabaseService()

