import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/firebase";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);

  // Listen for auth changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserUid(user ? user.uid : null);
    });
    return unsubscribe;
  }, []);

  // Fetch categories based on current user
  useEffect(() => {
    if (!currentUserUid) return;

    async function fetchCategories() {
      try {
        const categoriesCol = collection(db, "categories");
        const q = query(categoriesCol, where("uid", "==", currentUserUid)); // Filter by user
        const categorySnapshot = await getDocs(q);
        const categoryList = categorySnapshot.docs.map((doc) => doc.data().name);
        setCategories(["All", ...categoryList]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    fetchCategories();
  }, [currentUserUid]);

  return (
    <div className="w-full">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat.toLowerCase()}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
