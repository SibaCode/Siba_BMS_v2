import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, X } from "lucide-react";

function VariantsSection({ formData, setFormData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const openAddModal = () => {
    setCurrentVariant({
      type: "",
      color: "",
      size: "",
      sellingPrice: "",
      stockPrice: "",
      stockQuantity: "",
      description: "",
    });
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const openEditModal = (variant, index) => {
    setCurrentVariant({ ...variant });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentVariant(null);
    setEditingIndex(null);
  };

  const saveVariant = () => {
    if (!currentVariant) return;

    const newVariants = [...formData.variants];
    if (editingIndex !== null) {
      newVariants[editingIndex] = currentVariant;
    } else {
      newVariants.push(currentVariant);
    }
    setFormData({ ...formData, variants: newVariants });
    closeModal();
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const handleModalChange = (field, value) => {
    setCurrentVariant((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold">Variants</h4>
        <Button variant="outline" size="sm" onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Variant
        </Button>
      </div>

      {formData.variants.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full table-auto bg-white">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-700 text-sm">
                <th className="px-4 py-2">Variant</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formData.variants.map((variant, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {variant.type} - {variant.color} - {variant.size}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    R{variant.sellingPrice} - {variant.stockQuantity} in stock
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(variant, index)} className="flex items-center gap-1">
                      <Edit className="h-4 w-4" /> 
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => removeVariant(index)} className="flex items-center gap-1">
                      <Trash2 className="h-4 w-4" /> 
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No variants added yet.</p>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-lg font-semibold">{editingIndex !== null ? "Edit Variant" : "Add Variant"}</h5>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3">
              {["type", "color", "size", "sellingPrice", "stockPrice", "stockQuantity", "description"].map((field) => (
                <div key={field}>
                  <label className="block font-medium capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                  {field === "description" ? (
                    <textarea
                      rows={3}
                      className="w-full border rounded p-2"
                      value={currentVariant[field] || ""}
                      onChange={(e) => handleModalChange(field, e.target.value)}
                      placeholder="Description"
                    />
                  ) : (
                    <input
                      type={["sellingPrice", "stockPrice"].includes(field) ? "number" : "text"}
                      step={["sellingPrice", "stockPrice"].includes(field) ? "0.01" : undefined}
                      className="w-full border rounded p-2"
                      value={currentVariant[field] || ""}
                      onChange={(e) => handleModalChange(field, e.target.value)}
                      placeholder={field}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={closeModal} className="flex-1">
                Cancel
              </Button>
              <Button size="sm" onClick={saveVariant}>
                Save Variant
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VariantsSection;
