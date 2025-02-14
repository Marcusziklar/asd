export interface Product {
  id: number
  name: string
  sku: string
  brand: string
  category: string
  stock: number
  price: number
  supplier: string
  description?: string
  lastUpdated: string
}

export interface Category {
  id: number
  name: string
}

export interface Supplier {
  id: number
  name: string
}

export interface Brand {
  id: number
  name: string
}

