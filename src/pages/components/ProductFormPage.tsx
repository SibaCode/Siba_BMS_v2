// src/pages/ProductFormPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { db, auth } from "@/firebase";
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import CategorySelector from "@/pages/components/CategorySelector";
import VariantsSection from "@/pages/components/VariantsSection";

interface Variant {
  type: string;
  color: string;
  size: string;
  sellingPrice: string | number;
  stockPrice: string | number;
  stockQuantity: string | number;
}

interface FormData {
  name: string;
  category: string;
  supplier: string;
  productImage: string;
  batchNumber: string;
  status: string;
  lastRestocked: string;
  variants: Variant[];
}

export default function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    supplier: "",
    productImage: "",
    batchNumber: "",
    status: "",
    lastRestocked: "",
    variants: [],
  });

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchProduct(id);
    } else {
      setIsEditMode(false);
      resetForm();
    }
  }, [id]);

  const fetchProduct = async (id: string) => {
    setLoading(true);
    try {
      const productRef = doc(db, "products", id);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        alert("Product not found.");
        navigate("/admin/inventory");
        return;
      }

      const data = productDoc.data();

      if (data.uid !== auth.currentUser?.uid) {
        alert("You do not have permission to edit this product.");
        navigate("/admin/inventory");
        return;
      }

      setFormData({
        name: data.name || "",
        category: data.category || "",
        supplier: data.supplier || "",
        productImage: data.productImage || "",
        batchNumber: data.batchNumber || "",
        status: data.status || "",
        lastRestocked: data.lastRestocked || "",
        variants: data.variants || [],
      });
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      supplier: "",
      productImage: "",
      batchNumber: "",
      status: "",
      lastRestocked: "",
      variants: [],
    });
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const uploadImageFile = async (file: File) => {
    const form = new FormData();
    form.append("image", file);
    const apiKey = "102c039448f4f14be52fc5c055364fa5";

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (data?.data?.url) {
        handleInputChange("productImage", data.data.url);
      } else {
        alert("Image upload failed.");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageFile(file);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const validateForm = () => {
    const requiredFields: (keyof FormData)[] = [
      "name",
      "category",
      "supplier",
      "productImage",
      "batchNumber",
      "status",
      "lastRestocked",
    ];
    for (const field of requiredFields) if (!formData[field]) return alert("Fill all required fields.");
    if (formData.variants.length === 0) return alert("Add at least one variant.");
    for (const v of formData.variants)
      if (!v.type || !v.color || !v.size || v.sellingPrice === "" || v.stockPrice === "" || v.stockQuantity === "")
        return alert("All variant fields must be filled.");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      ...formData,
      variants: formData.variants.map((v) => ({
        ...v,
        sellingPrice: parseFloat(v.sellingPrice as string),
        stockPrice: parseFloat(v.stockPrice as string),
        stockQuantity: parseInt(v.stockQuantity as string, 10),
        createdBy: auth.currentUser?.uid,

      })),
    };

    try {
      if (isEditMode && id) {
        const productRef = doc(db, "products", id);
        const productDoc = await getDoc(productRef);

        if (!productDoc.exists()) return alert("Product not found.");
        if (productDoc.data().uid !== auth.currentUser?.uid) return alert("No permission to update.");

        await updateDoc(productRef, payload);
      } else {
        await addDoc(collection(db, "products"), { ...payload, uid: auth.currentUser?.uid ,createdBy: auth.currentUser?.uid, });
      }

      navigate("/admin/inventory");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save product.");
    }
  };

  if (loading) return <p>Loading product...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
        <CardHeader className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Main Fields */}
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <CategorySelector value={formData.category} onChange={(value) => handleInputChange("category", value)} />
          </div>
          <div>
            <Label htmlFor="supplier">Supplier *</Label>
            <Input id="supplier" value={formData.supplier} onChange={(e) => handleInputChange("supplier", e.target.value)} className="mt-1" />
          </div>

          {/* Image Upload */}
          <div
            onDrop={handleImageDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition relative"
          >
            <Label htmlFor="productImage">Product Image *</Label>
            <Input id="productImage" value={formData.productImage} readOnly placeholder="Drag and drop or click to upload" className="mt-2 cursor-pointer" />
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            {formData.productImage && <img src={formData.productImage} alt="Preview" className="mt-2 max-h-40 object-contain border rounded mx-auto" />}
          </div>

          <div>
            <Label htmlFor="batchNumber">Batch Number *</Label>
            <Input id="batchNumber" value={formData.batchNumber} onChange={(e) => handleInputChange("batchNumber", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="status">Status *</Label>
            <Input id="status" placeholder="e.g. Active / Inactive" value={formData.status} onChange={(e) => handleInputChange("status", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="lastRestocked">Last Restocked *</Label>
            <Input id="lastRestocked" type="date" value={formData.lastRestocked} onChange={(e) => handleInputChange("lastRestocked", e.target.value)} className="mt-1" />
          </div>

          {/* Variants Section */}
          <VariantsSection formData={formData} setFormData={setFormData} />

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{isEditMode ? "Update Product" : "Add Product"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
