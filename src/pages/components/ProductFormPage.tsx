// src/pages/AddProductPage.tsx
import { useState, useRef ,useEffect} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import VariantsSection from "@/pages/components/VariantsSection"
import CategorySelector from "@/pages/components/CategorySelector"
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase"; // Adjust path based on your structure
import { Checkbox } from "@/components/ui/checkbox";
import { addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Package,Boxes,DollarSign,Layers,AlertCircle
} from "lucide-react";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  customer: string;
  phone: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryStatus: string;
  orderDate: string;
  deliveryDate: string | null;
};
export default function ProductFormPage() {

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    productID: 0,       // string - unique product identifier, e.g. "apron"
    name: "",            // string
    category: "", 
    // categories: [],       // string
    supplier: "",        // string
    productImage:"",
    batchNumber: "",     // string
    status: "",          // string, e.g. "inStock" or "outOfStock"
    lastRestocked: "",   // string or Date (preferably Date)
    variants: [          // array of variant objects
      {
        type: "",           // string, e.g. "full" or "half"
        color: "",          // string
        size: "",           // string
        sellingPrice: "",   // number or string (if form input)
        stockPrice: "",     // number or string
        stockQuantity: "",  // number or string
        description: "",    // string
        images: [],         // array of strings (urls)
      }
    ],
  });
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const items = querySnapshot.docs.map(doc => ({
      docId: doc.id,   // "apron", "mug", etc.
      ...doc.data()
    }));
      console.log(items)
      setProducts(items);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

 
  const resetForm = () => {
    setFormData({
      productID:0,      // string
      name: "",
      category: "",
      // categories: [],
      supplier: "",
      productImage:"",
      batchNumber: "",
      status: "",
      lastRestocked: "",
      variants: [],
    });
    setEditingProduct(null);
  };
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const imageUrl = await uploadImageToImgBB(file);
    if (imageUrl) {
      handleInputChange("productImage", imageUrl);
    } else {
      alert("Image upload failed. Please try again.");
    }
  };
  

  const handleImageDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, productImage: imageUrl }));
    }
  };

  const handleDragOver = (e: any) => e.preventDefault();

  const addProduct = async () => {
    console.log(formData)
    if (
      !formData.productID ||
      !formData.name ||
      !formData.category ||
      !formData.supplier ||
      !formData.productImage ||
      !formData.batchNumber ||
      !formData.status ||
      !formData.lastRestocked ||
      formData.variants.length === 0
    ) {
      alert("Please fill in all required main fields and add at least one variant.");
      return;
    }
  
    for (const v of formData.variants) {
      if (
        !v.type ||
        !v.color ||
        !v.size ||
        v.sellingPrice === undefined ||
        v.stockPrice === undefined ||
        v.stockQuantity === undefined
      ) {
        alert("Please fill in all required variant fields.");
        return;
      }
    }
  
    try {
      await addDoc(collection(db, "products"), {
        productID: formData.productID,
        name: formData.name,
        category: formData.category,
        supplier: formData.supplier,
        productImage: formData.productImage,
        batchNumber: formData.batchNumber,
        status: formData.status,
        lastRestocked: formData.lastRestocked,
        variants: formData.variants.map((v) => ({
          type: v.type,
          color: v.color,
          size: v.size,
          sellingPrice: parseFloat(v.sellingPrice),
          stockPrice: parseFloat(v.stockPrice),
          stockQuantity: parseInt(v.stockQuantity, 10),
          description: v.description,
          images: v.images,
        })),
      });
      navigate("/admin/inventory");

      await fetchProducts();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    }
  };
  
  
  const updateProduct = async () => {
    if (!editingProduct) return;
      if (
      !formData.productID ||
      !formData.name ||
      !formData.category ||
      !formData.supplier ||
      !formData.productImage ||
      !formData.batchNumber ||
      !formData.status ||
      !formData.lastRestocked ||
      formData.variants.length === 0
    ) {
      alert("Please fill in all required main fields and add at least one variant.");
      return;
    }
  
    for (const v of formData.variants) {
      if (
        !v.type ||
        !v.color ||
        !v.size ||
        !v.sellingPrice ||
        !v.stockPrice ||
        !v.stockQuantity
      ) {
        alert("Please fill in all required variant fields.");
        return;
      }
    }
  
    try {
      const productRef = doc(db, "products", editingProduct.docId);
      await updateDoc(productRef, {
        productID: formData.productID,
        name: formData.name,
        category: formData.category,
        supplier: formData.supplier,
        productImage: formData.productImage,
        batchNumber: formData.batchNumber,
        status: formData.status,
        lastRestocked: formData.lastRestocked,
        variants: formData.variants.map((v) => ({
          type: v.type,
          color: v.color,
          size: v.size,
          sellingPrice: parseFloat(v.sellingPrice),
          stockPrice: parseFloat(v.stockPrice),
          stockQuantity: parseInt(v.stockQuantity, 10),
          description: v.description,
          images: v.images,
        })),
      });
      navigate("/admin/inventory");
      await fetchProducts();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  const deleteProduct = async (product: any) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
  
    try {
      await deleteDoc(doc(db, "products", product.docId));
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const uploadImageToImgBB = async (file: File): Promise<string | null> => {
    const apiKey = "102c039448f4f14be52fc5c055364fa5"; // Replace this with your actual ImgBB API key
    const formData = new FormData();
    formData.append("image", file);
  
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      return data.data?.url || null;
    } catch (err) {
      console.error("Upload to ImgBB failed:", err);
      return null;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">Add New Product</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productID">Product ID *</Label>
          <Input
            id="productID"
            placeholder="e.g. PRD123"
            value={formData.productID}
            onChange={(e) => handleInputChange("productID", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            placeholder="Product name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <CategorySelector
            value={formData.category}
            onChange={(value: string) => handleInputChange("category", value)}
          />
        </div>

        <div>
          <Label htmlFor="supplier">Supplier *</Label>
          <Input
            id="supplier"
            placeholder="Supplier name"
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
          <Label htmlFor="productImage" className="block mb-2">
            Product Image *
          </Label>

          {/* <Input
            id="productImage"
            placeholder="Paste image URL or drag file"
            value={formData.productImage}
            onChange={(e) => handleInputChange("productImage", e.target.value)}
            className="mb-2"
          /> */}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {formData.productImage ? (
            <img
              src={formData.productImage}
              alt="Product Preview"
              className="mt-2 max-h-40 object-contain border rounded mx-auto"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
          )}
        </div>

        <div>
          <Label htmlFor="batchNumber">Batch Number *</Label>
          <Input
            id="batchNumber"
            placeholder="Batch #"
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
          <Label htmlFor="lastRestocked">Last Restocked</Label>
          <Input
            id="lastRestocked"
            type="date"
            value={formData.lastRestocked}
            onChange={(e) => handleInputChange("lastRestocked", e.target.value)}
          />
        </div>
      </div>

      <VariantsSection formData={formData} setFormData={setFormData} />

      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={addProduct}>Add Product</Button>
      </div>
    </div>
  );
}
