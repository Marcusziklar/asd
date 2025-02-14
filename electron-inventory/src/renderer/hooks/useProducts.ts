"use client"

import { useState, useCallback } from "react"
import type { Product } from "../../types"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedProducts = await window.api.getAllProducts()
      setProducts(fetchedProducts)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred while fetching products"))
    } finally {
      setLoading(false)
    }
  }, [])

  const addProduct = useCallback(async (product: Omit<Product, "id" | "lastUpdated">) => {
    setLoading(true)
    setError(null)
    try {
      const newProduct = await window.api.addProduct(product)
      setProducts((prevProducts) => [...prevProducts, newProduct])
      return newProduct
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred while adding the product"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProduct = useCallback(async (id: number, updates: Partial<Product>) => {
    setLoading(true)
    setError(null)
    try {
      const updatedProduct = await window.api.updateProduct(id, updates)
      setProducts((prevProducts) => prevProducts.map((p) => (p.id === id ? updatedProduct : p)))
      return updatedProduct
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred while updating the product"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProduct = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await window.api.deleteProduct(id)
      setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred while deleting the product"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const searchProducts = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)
    try {
      const searchResults = await window.api.searchProducts(query)
      setProducts(searchResults)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred while searching for products"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
  }
}

