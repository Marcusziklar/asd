"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle, Box, Package, Tag } from "@/components/ui/card"

// Dummy database for demonstration purposes. Replace with your actual database interaction.
const db = {
  getAllProducts: () => [
    { id: 1, name: "Product 1", stock: 10 },
    { id: 2, name: "Product 2", stock: 5 },
    { id: 3, name: "Product 3", stock: 15 },
  ],
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    inventoryItems: 0,
    labelsGenerated: 0,
  })

  useEffect(() => {
    const products = db.getAllProducts()
    setStats({
      totalProducts: products.length,
      inventoryItems: products.reduce((sum, p) => sum + p.stock, 0),
      labelsGenerated: 0, // This would be updated based on actual label generation tracking
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inventoryItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labels Generated</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.labelsGenerated}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalProducts === 0 ? (
              <p className="text-muted-foreground">No products added yet</p>
            ) : (
              <div>Recent products list would go here</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

