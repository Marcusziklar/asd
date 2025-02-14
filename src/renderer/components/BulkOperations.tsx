"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "../hooks/useProducts"

export function BulkOperations({ selectedProducts }: { selectedProducts: Set<number> }) {
  const { updateProduct } = useProducts()
  const [operation, setOperation] = useState<"price" | "stock">("price")
  const [value, setValue] = useState("")
  const [action, setAction] = useState<"set" | "increase" | "decrease">("set")

  const handleBulkUpdate = async () => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return

    for (const productId of selectedProducts) {
      const update: { price?: number; stock?: number } = {}
      if (operation === "price") {
        if (action === "set") {
          update.price = numValue
        } else {
          const product = await window.api.getProduct(productId)
          update.price = action === "increase" ? product.price + numValue : product.price - numValue
        }
      } else {
        if (action === "set") {
          update.stock = Math.round(numValue)
        } else {
          const product = await window.api.getProduct(productId)
          update.stock =
            action === "increase" ? product.stock + Math.round(numValue) : product.stock - Math.round(numValue)
        }
      }
      await updateProduct(productId, update)
    }
  }

  return (
    <div className="flex space-x-2 items-center">
      <Select value={operation} onValueChange={(value) => setOperation(value as "price" | "stock")}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Operation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price">Price</SelectItem>
          <SelectItem value="stock">Stock</SelectItem>
        </SelectContent>
      </Select>
      <Select value={action} onValueChange={(value) => setAction(value as "set" | "increase" | "decrease")}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="set">Set</SelectItem>
          <SelectItem value="increase">Increase</SelectItem>
          <SelectItem value="decrease">Decrease</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={operation === "price" ? "Enter price" : "Enter stock"}
        className="w-[150px]"
      />
      <Button onClick={handleBulkUpdate}>Apply</Button>
    </div>
  )
}

