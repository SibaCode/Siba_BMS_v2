// src/pages/ProductFormPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

      // Ownership check
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
    if (file) {
      uploadImageFile(file);
    }
  };
  

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

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

    for (const field of requiredFields) {
      if (!formData[field]) {
        alert("Please fill in all required main fields.");
        return false;
      }
    }

    if (formData.variants.length === 0) {
      alert("Please add at least one variant.");
      return false;
    }

    for (const v of formData.variants) {
      if (
        !v.type ||
        !v.color ||
        !v.size ||
        v.sellingPrice === "" ||
        v.stockPrice === "" ||
        v.stockQuantity === ""
      ) {
        alert("All variant fields must be filled.");
        return false;
      }
    }

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
      })),
    };

    try {
      if (isEditMode && id) {
        const productRef = doc(db, "products", id);
        const productDoc = await getDoc(productRef);

        if (!productDoc.exists()) {
          alert("Product not found.");
          return;
        }

        const data = productDoc.data();

        if (data.uid !== auth.currentUser?.uid) {
          alert("You do not have permission to update this product.");
          return;
        }

        await updateDoc(productRef, payload);
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          uid: auth.currentUser?.uid,
        });
      }

      navigate("/admin/inventory");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save product.");
    }
  };

  if (loading) {
    return <p>Loading product...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">{isEditMode ? "Edit Product" : "Add New Product"}</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <CategorySelector
            value={formData.category}
            onChange={(value) => handleInputChange("category", value)}
          />
        </div>

        <div>
          <Label htmlFor="supplier">Supplier *</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => handleInputChange("supplier", e.target.value)}
          />
        </div>

        <div
          onDrop={handleImageDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center cursor-pointer hover:bg-gray-50 transition"
        >
          <Label htmlFor="productImage">Product Image *</Label>
          <Input
            id="productImage"
            value={formData.productImage}
            readOnly
            className="mb-2 cursor-pointer"
            placeholder="Drag and drop or click to upload"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {formData.productImage ? (
            <img
              src={formData.productImage}
              alt="Preview"
              className="mt-2 max-h-40 object-contain border rounded mx-auto"
            />
          ) : (
            <p className="text-sm text-muted-foreground mt-2">Drag and drop or click to upload</p>
          )}
        </div>

        <div>
          <Label htmlFor="batchNumber">Batch Number *</Label>
          <Input
            id="batchNumber"
            value={formData.batchNumber}
            onChange={(e) => handleInputChange("batchNumber", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="status">Status *</Label>
          <Input
            id="status"
            placeholder="e.g. Active / Inactive"
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="lastRestocked">Last Restocked *</Label>
          <Input
            id="lastRestocked"
            type="date"
            value={formData.lastRestocked}
            onChange={(e) => handleInputChange("lastRestocked", e.target.value)}
          />
        </div>

        <VariantsSection formData={formData} setFormData={setFormData} />

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{isEditMode ? "Update Product" : "Add Product"}</Button>
        </div>
      </div>
    </div>
  );
}
