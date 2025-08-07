"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/firebase";
import { toast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

interface CategoryFormData {
  name: string;
  description?: string;
  status?: boolean;
}

interface Category extends CategoryFormData {
  id: string;
  uid: string;
}

const AdminCategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentUser, setCurrentUser] = useState<{ uid: string } | null>(null);

  const auth = getAuth();

  // Monitor auth state to get current user UID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser({ uid: user.uid });
      else setCurrentUser(null);
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch categories for the current user only
  const fetchCategories = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "categories"),
        where("uid", "==", currentUser.uid),
        orderBy("name")
      );
      const querySnapshot = await getDocs(q);
      const categoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as CategoryFormData & { uid: string }),
      })) as Category[];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCategories();
    } else {
      setCategories([]);
    }
  }, [currentUser]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
      status: true,
    },
  });

  // Open modal to add new category
  const openAddModal = () => {
    setEditingCategory(null);
    reset({ name: "", description: "", status: true });
    setIsModalOpen(true);
  };

  // Open modal to edit category
  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description ?? "",
      status: category.status ?? true,
    });
    setIsModalOpen(true);
  };

  // Handle form submit for add or edit
  const onSubmit = async (data: CategoryFormData) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to manage categories.",
        variant: "destructive",
      });
      return;
    }
    try {
      if (editingCategory) {
        // Update existing
        const docRef = doc(db, "categories", editingCategory.id);
        // Ensure only allowed fields updated
        await updateDoc(docRef, {
          name: data.name,
          description: data.description ?? "",
          status: data.status ?? true,
        });
        toast({
          title: "Success",
          description: "Category updated successfully.",
        });
      } else {
        // Add new category with uid
        await addDoc(collection(db, "categories"), {
          name: data.name,
          description: data.description ?? "",
          status: data.status ?? true,
          uid: currentUser.uid,
        });
        toast({
          title: "Success",
          description: "Category created successfully.",
        });
      }
      await fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category.",
        variant: "destructive",
      });
    }
  };

  // Delete category only if owned by user
  const deleteCategory = async (category: Category) => {
    if (!currentUser || category.uid !== currentUser.uid) {
      toast({
        title: "Error",
        description: "Not authorized to delete this category.",
        variant: "destructive",
      });
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`))
      return;

    try {
      await deleteDoc(doc(db, "categories", category.id));
      toast({ title: "Deleted", description: "Category deleted." });
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    }
  };

  // Toggle category status only if owned by user
  const toggleCategoryStatus = async (category: Category) => {
    if (!currentUser || category.uid !== currentUser.uid) {
      toast({
        title: "Error",
        description: "Not authorized to update this category.",
        variant: "destructive",
      });
      return;
    }
    try {
      const docRef = doc(db, "categories", category.id);
      await updateDoc(docRef, { status: !category.status });
      toast({
        title: "Success",
        description: `Category marked as ${
          !category.status ? "active" : "inactive"
        }.`,
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error toggling category status:", error);
      toast({
        title: "Error",
        description: "Failed to update category status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Categories</h2>
      <Button onClick={openAddModal} className="mb-4">
        Add Category
      </Button>

      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2 text-left">
                Description
              </th>
              <th className="border border-gray-300 p-2 text-center">Status</th>
              <th className="border border-gray-300 p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{category.name}</td>
                <td className="border border-gray-300 p-2">
                  {category.description}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  <button
                    onClick={() => toggleCategoryStatus(category)}
                    className={`px-2 py-1 rounded text-white ${
                      category.status ? "bg-green-600" : "bg-red-600"
                    }`}
                    aria-label="Toggle status"
                  >
                    {category.status ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="border border-gray-300 p-2 text-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCategory(category)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for Add/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the details of your category."
                : "Fill the form to create a new category."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <label htmlFor="name" className="block font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block font-medium mb-1">
                Description
              </label>
              <Input id="description" {...register("description")} />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="status"
                {...register("status")}
                defaultChecked={true}
              />
              <label htmlFor="status">Active</label>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {editingCategory ? "Update" : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategoryManager;
