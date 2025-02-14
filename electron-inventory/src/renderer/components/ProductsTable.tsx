"use client"

import { useState, useEffect, useMemo } from "react"
import { useProducts } from "../hooks/useProducts"
import type { Product } from "../../types"
import { ProductDetails } from "./ProductDetails"
import AddProductDialog from "./AddProductDialog"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pencil,
  Trash2,
  Eye,
  Plus,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Tag,
  Search,
} from "lucide-react"
import { jsPDF } from "jspdf"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductsTable() {
  const { products, loading, error, fetchProducts, deleteProduct, searchProducts } = useProducts()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: "asc" | "desc" } | null>(null)
  const [filters, setFilters] = useState<Partial<Record<keyof Product, string>>>({})
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Product>>(
    new Set(["name", "sku", "brandName", "categoryName", "stock", "price", "supplierName", "lastUpdated"]),
  )
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [searchCategory, setSearchCategory] = useState<keyof Product>("name")

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const results = await searchProducts(searchQuery)
    // Update the products state with the search results
    // This assumes that the searchProducts function in useProducts hook returns the search results
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id)
        fetchProducts() // Refresh the product list after deletion
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const handleSort = (key: keyof Product) => {
    setSortConfig(
      sortConfig && sortConfig.key === key
        ? { key, direction: sortConfig.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    )
  }

  const handleFilter = (key: keyof Product, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleColumnVisibility = (column: keyof Product) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(column)) {
        newSet.delete(column)
      } else {
        newSet.add(column)
      }
      return newSet
    })
  }

  const toggleProductSelection = (id: number) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleExport = () => {
    const dataToExport = products
      .filter((product) => selectedProducts.size === 0 || selectedProducts.has(product.id))
      .map((product) => {
        const exportedProduct: Partial<Product> = {}
        visibleColumns.forEach((column) => {
          exportedProduct[column] = product[column]
        })
        return exportedProduct
      })

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "products_export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedProducts = JSON.parse(e.target?.result as string)
          // Here you would typically send this data to your backend to be processed and added to the database
          console.log("Imported products:", importedProducts)
          // After processing, you might want to refresh the product list
          fetchProducts()
        } catch (error) {
          console.error("Error parsing imported file:", error)
        }
      }
      reader.readAsText(file)
    }
  }

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((product) =>
        Object.entries(filters).every(([key, value]) =>
          String(product[key as keyof Product])
            .toLowerCase()
            .includes(value.toLowerCase()),
        ),
      )
      .filter((product) => String(product[searchCategory]).toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortConfig) {
          const { key, direction } = sortConfig
          if (a[key] < b[key]) return direction === "asc" ? -1 : 1
          if (a[key] > b[key]) return direction === "asc" ? 1 : -1
        }
        return 0
      })
  }, [products, filters, sortConfig, searchQuery, searchCategory])

  const generateLabel = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const doc = new jsPDF()
    let yOffset = 10

    // Add product details to the PDF
    doc.setFontSize(16)
    doc.text(product.name, 10, yOffset)
    yOffset += 10

    doc.setFontSize(12)
    doc.text(`SKU: ${product.sku}`, 10, yOffset)
    yOffset += 10

    doc.text(`Price: $${product.price.toFixed(2)}`, 10, yOffset)
    yOffset += 10

    if (product.description) {
      doc.setFontSize(10)
      doc.text("Description:", 10, yOffset)
      yOffset += 5
      const splitDescription = doc.splitTextToSize(product.description, 180)
      doc.text(splitDescription, 15, yOffset)
    }

    doc.save(`${product.sku}-label.pdf`)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onEdit={() => {
          /* Implement edit functionality */
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <Select value={searchCategory} onValueChange={(value) => setSearchCategory(value as keyof Product)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="sku">SKU</SelectItem>
                <SelectItem value="brandName">Brand</SelectItem>
                <SelectItem value="categoryName">Category</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="search"
              placeholder={`Search products by ${searchCategory}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
        <Button variant="outline" onClick={() => document.getElementById("import-input")?.click()}>
          <Upload className="h-4 w-4 mr-2" /> Import
        </Button>
        <input id="import-input" type="file" accept=".json" className="hidden" onChange={handleImport} />
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedProducts.size === filteredAndSortedProducts.length}
                  onCheckedChange={(checked) => {
                    setSelectedProducts(checked ? new Set(filteredAndSortedProducts.map((p) => p.id)) : new Set())
                  }}
                />
              </TableHead>
              {Array.from(visibleColumns).map((column) => (
                <TableHead key={column}>
                  <div className="flex items-center">
                    <span>{column}</span>
                    <button onClick={() => handleSort(column)} className="ml-1">
                      {sortConfig?.key === column ? (
                        sortConfig.direction === "asc" ? (
                          <SortAsc className="h-4 w-4" />
                        ) : (
                          <SortDesc className="h-4 w-4" />
                        )
                      ) : (
                        <SortAsc className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <Input
                      placeholder={`Filter ${column}`}
                      value={filters[column] || ""}
                      onChange={(e) => handleFilter(column, e.target.value)}
                      className="ml-2 w-24"
                    />
                  </div>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => toggleProductSelection(product.id)}
                  />
                </TableCell>
                {Array.from(visibleColumns).map((column) => (
                  <TableCell key={column}>{String(product[column])}</TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => generateLabel(product.id)}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4 mr-2" /> Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.keys(products[0] || {}).map((column) => (
            <DropdownMenuCheckboxItem
              key={column}
              checked={visibleColumns.has(column as keyof Product)}
              onCheckedChange={() => toggleColumnVisibility(column as keyof Product)}
            >
              {column}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  )
}

