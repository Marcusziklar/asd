"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface DynamicField {
  id: string
  name: string
  value: string
}

interface DynamicFormFieldsProps {
  fields: DynamicField[]
  onFieldsChange: (fields: DynamicField[]) => void
}

export const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({ fields, onFieldsChange }) => {
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(fields)

  const addField = () => {
    const newField: DynamicField = {
      id: Date.now().toString(),
      name: "",
      value: "",
    }
    setDynamicFields([...dynamicFields, newField])
    onFieldsChange([...dynamicFields, newField])
  }

  const removeField = (id: string) => {
    const updatedFields = dynamicFields.filter((field) => field.id !== id)
    setDynamicFields(updatedFields)
    onFieldsChange(updatedFields)
  }

  const updateField = (id: string, key: "name" | "value", newValue: string) => {
    const updatedFields = dynamicFields.map((field) => (field.id === id ? { ...field, [key]: newValue } : field))
    setDynamicFields(updatedFields)
    onFieldsChange(updatedFields)
  }

  return (
    <div className="space-y-4">
      {dynamicFields.map((field) => (
        <div key={field.id} className="flex items-end space-x-2">
          <div className="flex-1">
            <Label htmlFor={`field-name-${field.id}`}>Field Name</Label>
            <Input
              id={`field-name-${field.id}`}
              value={field.name}
              onChange={(e) => updateField(field.id, "name", e.target.value)}
              placeholder="Enter field name"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor={`field-value-${field.id}`}>Field Value</Label>
            <Input
              id={`field-value-${field.id}`}
              value={field.value}
              onChange={(e) => updateField(field.id, "value", e.target.value)}
              placeholder="Enter field value"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => removeField(field.id)} className="mb-0.5">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={addField} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add Custom Field
      </Button>
    </div>
  )
}

