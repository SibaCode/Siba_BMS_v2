// src/pages/admin/ProductFormPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth, storage } from "@/firebase";

import {
  doc,collection,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";

interface ProductFormData {
  name: string;
  category: string;
  supplier: string;
  batchNumber: string;
  status: string;
  lastRestocked: string;
  productImage: string; // URL string
}

const defaultFormData: ProductFormData = {
  name: "",
  category: "",
  supplier: "",
  batchNumber: "",
  status: "available",
  lastRestocked: "",
  productImage: "",
};

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load product data if editing
  useEffect(() => {
    if (!isEditing) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, "products", id!);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || "",
            category: data.category || "",
            supplier: data.supplier || "",
            batchNumber: data.batchNumber || "",
            status: data.status || "available",
            lastRestocked: data.lastRestocked || "",
            productImage: data.productImage || "",
          });
        } else {
          setError("Product not found.");
        }
      } catch (err) {
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEditing]);

  // Handle input changes
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Handle image file input
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  }

  // Upload image to Firebase Storage and get URL
  async function uploadImage(file: File): Promise<string> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    const storageRef = ref(
      storage,
      `productImages/${auth.currentUser.uid}/${Date.now()}_${file.name}`
    );
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  // Handle form submission (create or update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!auth.currentUser) {
      setError("You must be logged in to save products.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageUrl = formData.productImage;

      // If a new image file is selected, upload it
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        name: formData.name,
        category: formData.category,
        supplier: formData.supplier,
        batchNumber: formData.batchNumber,
        status: formData.status,
        lastRestocked: formData.lastRestocked,
        productImage: imageUrl,
        uid: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
      };

      if (isEditing) {
        // Update existing product
        const docRef = doc(db, "products", id!);
        await updateDoc(docRef, productData);
      } else {
        // Create new product with timestamp
        const newDocRef = doc(collection(db, "products"));
        await setDoc(newDocRef, {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }

      navigate("/admin/inventory");
    } catch (err) {
      console.error(err);
      setError("Failed to save product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-semibold mb-1">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block font-semibold mb-1">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label htmlFor="supplier" className="block font-semibold mb-1">
            Supplier
          </label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label htmlFor="batchNumber" className="block font-semibold mb-1">
            Batch Number
          </label>
          <input
            type="text"
            id="batchNumber"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label htmlFor="status" className="block font-semibold mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="available">Available</option>
            <option value="out of stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>

        <div>
          <label htmlFor="lastRestocked" className="block font-semibold mb-1">
            Last Restocked
          </label>
          <input
            type="date"
            id="lastRestocked"
            name="lastRestocked"
            value={formData.lastRestocked}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label htmlFor="productImage" className="block font-semibold mb-1">
            Product Image
          </label>
          <input
            type="file"
            id="productImage"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered w-full"
          />
          {formData.productImage && !imageFile && (
            <img
              src={formData.productImage}
              alt="Product"
              className="mt-2 max-h-40 object-contain"
            />
          )}
          {imageFile && (
            <p className="mt-2 text-sm">{imageFile.name} selected</p>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </div>
  );
}
