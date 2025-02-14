"use client"

import { useState, useEffect } from "react"
import { useProducts } from "../hooks/useProducts"
import QRCode from "qrcode"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pencil, Download, Plus } from "lucide-react"

interface QRCodeData {
  id: number
  productId: number | null
  url: string
  qrCode: string
}

export default function QRCodeManager() {
  const { products, loading, error, fetchProducts } = useProducts()
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCustomQRDialogOpen, setIsCustomQRDialogOpen] = useState(false)
  const [customQRUrl, setCustomQRUrl] = useState("")
  const [editingQRCode, setEditingQRCode] = useState<QRCodeData | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    const generateQRCodes = async () => {
      const codes: QRCodeData[] = []
      for (const product of products) {
        try {
          const url = `https://yourapp.com/product/${product.id}`
          const qr = await QRCode.toDataURL(url)
          codes.push({
            id: product.id,
            productId: product.id,
            url: url,
            qrCode: qr,
          })
        } catch (err) {
          console.error(`Error generating QR code for product ${product.id}:`, err)
        }
      }
      setQrCodes(codes)
    }

    generateQRCodes()
  }, [products])

  const filteredQRCodes = qrCodes.filter((qrCode) => {
    const product = products.find((p) => p.id === qrCode.productId)
    return (
      product &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qrCode.url.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const handleCustomQRGenerate = async () => {
    try {
      const qr = await QRCode.toDataURL(customQRUrl)
      const newQRCode: QRCodeData = {
        id: Date.now(),
        productId: null,
        url: customQRUrl,
        qrCode: qr,
      }
      setQrCodes([...qrCodes, newQRCode])
      setIsCustomQRDialogOpen(false)
      setCustomQRUrl("")
    } catch (err) {
      console.error("Error generating custom QR code:", err)
    }
  }

  const handleEditQRCode = async (qrCode: QRCodeData) => {
    try {
      const updatedQR = await QRCode.toDataURL(qrCode.url)
      const updatedQRCodes = qrCodes.map((qr) =>
        qr.id === qrCode.id ? { ...qr, url: qrCode.url, qrCode: updatedQR } : qr,
      )
      setQrCodes(updatedQRCodes)
      setEditingQRCode(null)
    } catch (err) {
      console.error("Error updating QR code:", err)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">QR Code Manager</h1>
      <div className="flex justify-between items-center">
        <Input
          type="search"
          placeholder="Search QR codes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsCustomQRDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Generate Custom QR Code
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>QR Code</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredQRCodes.map((qrCode) => {
            const product = products.find((p) => p.id === qrCode.productId)
            return (
              <TableRow key={qrCode.id}>
                <TableCell>{product ? product.name : "Custom QR Code"}</TableCell>
                <TableCell>{product ? product.sku : "-"}</TableCell>
                <TableCell>
                  <img
                    src={qrCode.qrCode || "/placeholder.svg"}
                    alt={`QR Code for ${product ? product.name : "Custom URL"}`}
                    className="w-24 h-24"
                  />
                </TableCell>
                <TableCell>
                  {editingQRCode?.id === qrCode.id ? (
                    <Input
                      value={editingQRCode.url}
                      onChange={(e) => setEditingQRCode({ ...editingQRCode, url: e.target.value })}
                    />
                  ) : (
                    qrCode.url
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {editingQRCode?.id === qrCode.id ? (
                      <Button onClick={() => handleEditQRCode(editingQRCode)}>Save</Button>
                    ) : (
                      <Button variant="outline" onClick={() => setEditingQRCode(qrCode)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => window.open(qrCode.qrCode, "_blank")}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Dialog open={isCustomQRDialogOpen} onOpenChange={setIsCustomQRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Custom QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-qr-url">URL</Label>
              <Input
                id="custom-qr-url"
                value={customQRUrl}
                onChange={(e) => setCustomQRUrl(e.target.value)}
                placeholder="Enter URL for custom QR code"
              />
            </div>
            <Button onClick={handleCustomQRGenerate}>Generate QR Code</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

