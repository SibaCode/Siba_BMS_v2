import React, { useRef } from "react";

interface ImageUploadProps {
  imageUrl: string;
  isEditing: boolean;
  onImageChange: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ imageUrl, isEditing, onImageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const file = e.target.files?.[0];
    if (file) uploadImageFile(file);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    e.preventDefault();
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
        onImageChange(data.data.url); // updates parent state
      } else {
        alert("Image upload failed.");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image.");
    }
  };

  return (
    <div
      onDrop={handleImageDrop}
      onDragOver={handleDragOver}
      onClick={() => isEditing && fileInputRef.current?.click()}
      className={`border-2 border-dashed border-gray-300 p-4 rounded-md text-center transition ${
        isEditing ? "cursor-pointer hover:bg-gray-50" : "cursor-default"
      }`}
    >
      <label className="block mb-2">Business Logo *</label>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Preview"
          className="mt-2 max-h-40 object-contain border rounded mx-auto"
        />
      ) : (
        <p className="text-sm text-gray-400 mt-2">
          Drag and drop or click to upload
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
