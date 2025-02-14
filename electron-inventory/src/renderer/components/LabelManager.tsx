"use client"

import { useState, useEffect } from "react"
import { useProducts } from "../hooks/useProducts"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { jsPDF } from "jspdf"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Download } from "lucide-react"

interface LabelField {
  id: string
  name: string
  visible: boolean
  order: number
}

interface LabelTemplate {
  id: string
  name: string
  fields: LabelField[]
}

export default function LabelManager() {
  const { products, loading, error } = useProducts()
  const [templates, setTemplates] = useState<LabelTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [isDesignerOpen, setIsDesignerOpen] = useState(false)
  const [previewProduct, setPreviewProduct] = useState<number | null>(null)

  useEffect(() => {
    // Load templates from local storage or initialize with a default template
    const savedTemplates = localStorage.getItem("labelTemplates")
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates))
    } else {
      const defaultTemplate: LabelTemplate = {
        id: "default",
        name: "Default Template",
        fields: [
          { id: "name", name: "Product Name", visible: true, order: 0 },
          { id: "sku", name: "SKU", visible: true, order: 1 },
          { id: "price", name: "Price", visible: true, order: 2 },
          { id: "ingredients", name: "Ingredients", visible: true, order: 3 },
        ],
      }
      setTemplates([defaultTemplate])
      setSelectedTemplate("default")
    }
  }, [])

  useEffect(() => {
    // Save templates to local storage whenever they change
    localStorage.setItem("labelTemplates", JSON.stringify(templates))
  }, [templates])

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleFieldVisibilityChange = (fieldId: string) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) =>
        template.id === selectedTemplate
          ? {
              ...template,
              fields: template.fields.map((field) =>
                field.id === fieldId ? { ...field, visible: !field.visible } : field,
              ),
            }
          : template,
      ),
    )
  }

  const handleFieldOrderChange = (result: any) => {
    if (!result.destination) return

    setTemplates((prevTemplates) =>
      prevTemplates.map((template) =>
        template.id === selectedTemplate
          ? {
              ...template,
              fields: template.fields
                .map((field, index) => ({ ...field, order: index }))
                .sort((a, b) => a.order - b.order),
            }
          : template,
      ),
    )
  }

  const handleProductSelection = (productId: number) => {
    setSelectedProducts((prevSelected) => {
      const newSelected = new Set(prevSelected)
      if (newSelected.has(productId)) {
        newSelected.delete(productId)
      } else {
        newSelected.add(productId)
      }
      return newSelected
    })
  }

  const generatePDF = (productIds: number[]) => {
    const doc = new jsPDF()
    const template = templates.find((t) => t.id === selectedTemplate)

    if (!template) return

    productIds.forEach((productId, index) => {
      if (index > 0) doc.addPage()

      const product = products.find((p) => p.id === productId)
      if (!product) return

      let yOffset = 10

      template.fields
        .filter((field) => field.visible)
        .sort((a, b) => a.order - b.order)
        .forEach((field) => {
          let content = product[field.id as keyof typeof product]

          if (field.id === "ingredients") {
            // Apply special formatting for ingredients
            const allergenes = ["nuts", "dairy", "gluten", "soy"] // Add more as needed
            content = content
              .split(", ")
              .map((ingredient: string) => {
                if (allergenes.some((allergen) => ingredient.toLowerCase().includes(allergen))) {
                  return `<b><font color="#FF0000">${ingredient}</font></b>`
                }
                return ingredient
              })
              .join(", ")
          }

          doc.setFontSize(12)
          doc.text(`${field.name}:`, 10, yOffset)
          yOffset += 5
          doc.setFontSize(10)
          doc.html(`<div>${content}</div>`, {
            x: 15,
            y: yOffset,
            width: 180,
          })
          yOffset += 15
        })
    })

    doc.save("product-labels.pdf")
  }

  const renderPreview = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    const template = templates.find((t) => t.id === selectedTemplate)

    if (!product || !template) return null

    return (
      <Card className="w-64 h-96 p-4 overflow-auto">
        <CardContent>
          {template.fields
            .filter((field) => field.visible)
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id} className="mb-2">
                <strong>{field.name}:</strong>
                <div>
                  {field.id === "ingredients" ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: formatIngredients(product[field.id as keyof typeof product]) }}
                    />
                  ) : (
                    product[field.id as keyof typeof product]
                  )}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    )
  }

  const formatIngredients = (ingredients: string) => {
    const allergenes = ["nuts", "dairy", "gluten", "soy"] // Add more as needed
    return ingredients
      .split(", ")
      .map((ingredient) => {
        if (allergenes.some((allergen) => ingredient.toLowerCase().includes(allergen))) {
          return `<span style="color: red; font-weight: bold;">${ingredient}</span>`
        }
        return ingredient
      })
      .join(", ")
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Label Manager</h1>

      <div className="flex justify-between items-center">
        <Select value={selectedTemplate || ""} onValueChange={handleTemplateChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isDesignerOpen} onOpenChange={setIsDesignerOpen}>
          <DialogTrigger asChild>
            <Button>Design Label</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Label Designer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTemplate && (
                <DragDropContext onDragEnd={handleFieldOrderChange}>
                  <Droppable droppableId="fields">
                    {(provided) => (
                      <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {templates
                          .find((t) => t.id === selectedTemplate)
                          ?.fields.sort((a, b) => a.order - b.order)
                          .map((field, index) => (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided) => (
                                <li
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="flex items-center space-x-2 bg-gray-100 p-2 rounded"
                                >
                                  <Checkbox
                                    id={`field-${field.id}`}
                                    checked={field.visible}
                                    onCheckedChange={() => handleFieldVisibilityChange(field.id)}
                                  />
                                  <Label htmlFor={`field-${field.id}`}>{field.name}</Label>
                                </li>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Select</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={selectedProducts.has(product.id)}
                  onCheckedChange={() => handleProductSelection(product.id)}
                />
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setPreviewProduct(product.id)}>
                    <Eye className="w-4 h-4 mr-2" /> Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => generatePDF([product.id])}>
                    <Download className="w-4 h-4 mr-2" /> Export Label
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <Button onClick={() => generatePDF(Array.from(selectedProducts))} disabled={selectedProducts.size === 0}>
          Export Selected Labels
        </Button>
        {previewProduct && (
          <Dialog open={previewProduct !== null} onOpenChange={() => setPreviewProduct(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Label Preview</DialogTitle>
              </DialogHeader>
              {renderPreview(previewProduct)}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

