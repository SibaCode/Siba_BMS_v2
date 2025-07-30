import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
type Variant = {
    type: string
    color: string
    size: string
    sellingPrice: number
    stockQuantity: number
    images?: string[]
  }
  
function VariantAccordionList({ variants, setVariants }) {
//   const [expandedIndex, setExpandedIndex] = useState(null)
//   const [editData, setEditData] = useState({})
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState<Variant | null>(null)
  
  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
    setEditData(variants[index])
  }

  const handleChange = (field: keyof Variant, value: string | number) => {
    if (!editData) return
    setEditData((prev) => ({
      ...prev!,
      [field]: value
    }))
  }
  
  const saveChanges = (index) => {
    const updated = [...variants]
    updated[index] = editData
    setVariants(updated)
    setExpandedIndex(null)
  }

  const removeVariant = (index) => {
    const updated = [...variants]
    updated.splice(index, 1)
    setVariants(updated)
  }

  return (
<div className="space-y-4 max-h-[500px] overflow-y-auto p-4">
{variants.map((variant, index) => (
        <div
          key={index}
          className="border rounded-lg shadow-sm bg-background"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => toggleExpand(index)}
          >
            <div className="flex items-center gap-4">
              <img
                src={variant.images?.[0] || "/placeholder.jpg"}
                className="h-12 w-12 object-cover rounded"
                alt=""
              />
              <div className="text-sm">
                <div className="font-medium">{variant.type} - {variant.color} - {variant.size}</div>
                <div className="text-muted-foreground text-xs">R{variant.sellingPrice} • {variant.stockQuantity} in stock</div>
              </div>
            </div>
            {expandedIndex === index ? <ChevronUp /> : <ChevronDown />}
          </div>

          {/* Body (Editable) */}
          {expandedIndex === index && (
            <div className="border-t px-4 py-3 space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={editData.type || ""}
                  onChange={(e) => handleChange("type", e.target.value)}
                  placeholder="Type"
                />
                
                <Input
                  value={editData.color || ""}
                  onChange={(e) => handleChange("color", e.target.value)}
                  placeholder="Color"
                />
                <Input
                  value={editData.size || ""}
                  onChange={(e) => handleChange("size", e.target.value)}
                  placeholder="Size"
                />
                <Input
                  type="number"
                  value={editData.sellingPrice || ""}
                  onChange={(e) => handleChange("sellingPrice", e.target.value)}
                  placeholder="Selling Price (R)"
                />
                <Input
                  type="number"
                  value={editData.stockQuantity || ""}
                  onChange={(e) => handleChange("stockQuantity", e.target.value)}
                  placeholder="Stock Quantity"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpandedIndex(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveChanges(index)}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeVariant(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
export default VariantAccordionList;