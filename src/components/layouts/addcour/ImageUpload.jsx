import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";

const ImageUpload = ({ className, onImageUpload, ...props }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageSelection(files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files?.length) {
      handleImageSelection(files[0]);
    }
  };

  const handleImageSelection = (file) => {

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error("Format d'image non supporté. Veuillez utiliser JPG, PNG, GIF, WEBP ou SVG.", {
        containerId: "devoirs-toast"
  
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse. Taille maximum: 5MB.", {
        containerId: "devoirs-toast"
  
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    if (onImageUpload) {
      onImageUpload(imageUrl, file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed border-gray-300 rounded-lg px-20 py-[26px] ${isDragging && "border-blue-500 bg-blue-50"} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      {...props}
    >
      <div className="flex w-[170px] max-w-full flex-col items-center">
        {previewImage ? (
          <div className="mb-4">
            <img src={previewImage} alt="Aperçu" className="w-16 h-16 object-cover rounded" />
          </div>
        ) : (
          <div className="flex min-h-[30px] w-[38px] items-center overflow-hidden justify-center">
            <Upload className="w-[38px] h-[38px] text-gray-400" />
          </div>
        )}
        <div className="text-gray-500 text-sm font-normal leading-none text-center">
          Glissez une image ou
        </div>
        <div className="text-blue-500 font-normal text-center mt-3.5 pb-2 px-[3px] cursor-pointer">
          parcourir vos fichiers
        </div>
      </div>
      <input
     
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUpload;
