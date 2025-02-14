"use client"

import { useState } from "react"
import { useProducts } from "../hooks/useProducts"
import { DynamicFormFields } from "./DynamicFormFields"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import QRCode from "qrcode"

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DynamicField {
  id: string
  name: string
  value: string
}

export default function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const { addProduct } = useProducts()
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    brandId: "",
    categoryId: "",
    stock: 0,
    price: 0,
    supplierId: "",
    description: "",
  })
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData = {
        ...formData,
        customFields: dynamicFields.reduce(
          (acc, field) => {
            acc[field.name] = field.value
            return acc
          },
          {} as Record<string, string>,
        ),
      }
      const newProduct = await addProduct(productData)

      // Generate QR code for the new product
      const qrCodeUrl = `https://yourapp.com/product/${newProduct.id}`
      const qrCodeImage = await QRCode.toDataURL(qrCodeUrl)

      // Here you would typically save the QR code image to your database
      // For now, we'll just log it to the console
      console.log("New product QR code generated:", qrCodeImage)

      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("Error adding product:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      brandId: "",
      categoryId: "",
      stock: 0,
      price: 0,
      supplierId: "",
      description: "",
    })
    setDynamicFields([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sku">SKU</Label>
              <Input
                id="product-sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-brand">Brand</Label>
              <Select value={formData.brandId} onValueChange={(value) => setFormData({ ...formData, brandId: value })}>
                <SelectTrigger id="product-brand">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {/* Populate with actual brand data */}
                  <SelectItem value="1">Brand 1</SelectItem>
                  <SelectItem value="2">Brand 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger id="product-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {/* Populate with actual category data */}
                  <SelectItem value="1">Category 1</SelectItem>
                  <SelectItem value="2">Category 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) })}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price</Label>
              <Input
                id="product-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-supplier">Supplier</Label>
            <Select
              value={formData.supplierId}
              onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
            >
              <SelectTrigger id="product-supplier">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {/* Populate with actual supplier data */}
                <SelectItem value="1">Supplier 1</SelectItem>
                <SelectItem value="2">Supplier 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <DynamicFormFields fields={dynamicFields} onFieldsChange={setDynamicFields} />

          <div className="flex justify-end">
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

