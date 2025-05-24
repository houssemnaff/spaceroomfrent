import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Save,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../auth/authContext';
import { updateUserById } from '@/services/userapi';
import { toast } from 'react-toastify';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from '../admin/componnents/themcontext';

const SettingsPage = () => {
  const { user, token, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // États pour le formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // États pour les erreurs
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

  // État pour l'image
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // État pour montrer/cacher le mot de passe
  const [showPassword, setShowPassword] = useState(false);

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
      setImagePreview(user.imageurl || '');
    }
  }, [user]);

  // Nettoyage des URLs d'aperçu
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Validation du mot de passe
  const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    let errorMsg = "";

    if (password && password.length < minLength) {
      errorMsg = "Le mot de passe doit contenir au moins 6 caractères";
    } else if (password && !hasUpperCase) {
      errorMsg = "Le mot de passe doit contenir au moins une majuscule";
    } else if (password && !hasNumber) {
      errorMsg = "Le mot de passe doit contenir au moins un chiffre";
    }

    setPasswordError(errorMsg);
    return errorMsg === "";
  };

  // Validation de l'email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errorMsg = "";

    if (!email) {
      errorMsg = "";
    } else if (!emailRegex.test(email)) {
      errorMsg = "Veuillez entrer un email valide";
    } else if (!email.endsWith("@gmail.com")) {
      errorMsg = "Seules les adresses Gmail sont autorisées (@gmail.com)";
    }

    setEmailError(errorMsg);
    return errorMsg === "";
  };

  // Gestionnaire de changement pour valider en temps réel
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      validatePassword(value);
    } else if (name === 'email') {
      validateEmail(value);
    }
  };

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom ne peut pas être vide', {
        containerId: "devoirs-toast"
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      return;
    }

    if (formData.password && !validatePassword(formData.password)) {
      return;
    }

    setLoading(true);
    try {
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('email', formData.email);

      if (formData.password) {
        updateData.append('password', formData.password);
      }

      if (imageFile) {
        updateData.append('file', imageFile);
      }

      const updatedUser = await updateUserById(user._id, updateData, token);
      setUser(updatedUser);
      setImageFile(null);
      setFormData(prev => ({ ...prev, password: '' }));

      toast.success('Profil mis à jour avec succès', {
        containerId: "devoirs-toast"
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil', {
        containerId: "devoirs-toast"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image', {
          containerId: "devoirs-toast"
        });
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setImageFile(file);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Paramètres du compte</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-primary/20 dark:border-primary/30">
                <AvatarImage
                  src={imagePreview || "https://github.com/shadcn.png"}
                  alt={formData.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
                  {formData.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer 
                  bg-primary text-white hover:bg-primary/90
                  transition-all duration-200"
              >
                <Camera className="h-4 w-4 text-white dark:text-red-400" />
                <input
                  ref={fileInputRef}
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div className="flex-grow w-full space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  Nom
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className="focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Votre email"
                  className="focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {emailError && (
                  <p className="text-xs text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="password" className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Lock className="h-4 w-4" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nouveau mot de passe (laisser vide pour ne pas modifier)"
                    className="pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || emailError || (formData.password && passwordError)}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;