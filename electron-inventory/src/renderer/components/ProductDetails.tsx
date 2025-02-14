import type React from "react"
import type { Product } from "../../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"

interface ProductDetailsProps {
  product: Product
  onBack: () => void
  onEdit: () => void
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onEdit }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{product.name}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="font-medium text-gray-500">SKU</dt>
            <dd>{product.sku}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Brand</dt>
            <dd>{product.brandName}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Category</dt>
            <dd>{product.categoryName}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Stock</dt>
            <dd>{product.stock}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Price</dt>
            <dd>${product.price.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Supplier</dt>
            <dd>{product.supplierName}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-medium text-gray-500">Description</dt>
            <dd>{product.description || "No description available"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-medium text-gray-500">Last Updated</dt>
            <dd>{new Date(product.lastUpdated).toLocaleString()}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

