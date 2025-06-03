import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminService } from "@/services/adminService";

const Adminaddcour = ({ onSubmit, onCancel, onPreviewUpdate }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("");

  useEffect(() => {
    // Charger la liste des utilisateurs
    const fetchUsers = async () => {
      try {
        const response = await adminService.getAllUsersWithStats();
        console.log("userssss add ",response)
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Erreur lors du chargement des utilisateurs", {
          containerId: "devoirs-toast"
        });
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const subscription = watch((value) => {
      onPreviewUpdate(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, onPreviewUpdate]);

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
        containerId: "devoirs-toast"}
  );
      return;
    }
   
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse. Taille maximum: 5MB.", {
        containerId: "devoirs-toast"}
  );
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    setValue("imageFile", file, { shouldValidate: true });
    onPreviewUpdate({ imageUrl });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {/* Titre */}
      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Nom du cours *
        </label>
        <Input {...register("title", { required: "Le titre est requis" })} className="w-full" />
        {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
      </div>

      {/* Description */}
      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          classe *
        </label>
        <Input {...register("description", { required: "La description est requise" })} className="w-full" />
        {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
      </div>

      {/* Matière */}
      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Matière *
        </label>
        <Input {...register("matiere", { required: "La matière est requise" })} className="w-full" />
        {errors.matiere && <span className="text-red-500 text-sm">{errors.matiere.message}</span>}
      </div>

      {/* Propriétaire du cours */}
      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Propriétaire du cours *
        </label>
        <Select
          value={selectedOwner}
          onValueChange={(value) => {
            setSelectedOwner(value);
            setValue("ownerId", value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un propriétaire" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user._id} value={user._id}>
                {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.ownerId && <span className="text-red-500 text-sm">{errors.ownerId.message}</span>}
      </div>

      {/* Image */}
      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Image du cours *
        </label>
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg px-20 py-[26px] ${isDragging ? "border-blue-500 bg-blue-50" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
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
        {errors.imageFile && <span className="text-red-500 text-sm">{errors.imageFile.message}</span>}
      </div>

      {/* Boutons */}
      <div className="flex gap-4 text-base font-normal text-center mt-8 pt-[25px]">
        <Button type="button" onClick={onCancel} variant="outline" className="text-gray-700 px-[26px] py-[9px] rounded-lg">
          Annuler
        </Button>
        <Button type="submit" variant="primary" className="bg-blue-500 text-white px-[25px] py-[9px] rounded-lg">
          Créer le cours
        </Button>
      </div>
    </form>
  );
};

export default Adminaddcour;
