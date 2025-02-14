export interface Product {
  id: number
  name: string
  sku: string
  brandId: number
  categoryId: number
  stock: number
  price: number
  supplierId: number
  description?: string
  lastUpdated: string
  // Joined fields
  brandName?: string
  categoryName?: string
  supplierName?: string
}

export interface Category {
  id: number
  name: string
}

export interface Supplier {
  id: number
  name: string
  contactName?: string
  email?: string
  phone?: string
}

export interface Brand {
  id: number
  name: string
}

export interface ActivityLog {
  id: number
  action: string
  entityType: string
  entityId: number
  details?: string
  timestamp: string
}

export interface Stats {
  totalProducts: number
  totalStock: number
  totalCategories: number
  totalSuppliers: number
}

declare global {
  interface Window {
    api: {
      getAllProducts: () => Promise<Product[]>
      getProduct: (id: number) => Promise<Product>
      addProduct: (product: Omit<Product, "id" | "lastUpdated">) => Promise<Product>
      updateProduct: (id: number, updates: Partial<Product>) => Promise<Product>
      deleteProduct: (id: number) => Promise<boolean>
      searchProducts: (query: string) => Promise<Product[]>

      getAllCategories: () => Promise<Category[]>
      addCategory: (name: string) => Promise<Category>

      getAllSuppliers: () => Promise<Supplier[]>
      addSupplier: (supplier: Omit<Supplier, "id">) => Promise<Supplier>

      getAllBrands: () => Promise<Brand[]>
      addBrand: (name: string) => Promise<Brand>

      getStats: () => Promise<Stats>
      getRecentActivity: (limit?: number) => Promise<ActivityLog[]>
    }
  }
}

