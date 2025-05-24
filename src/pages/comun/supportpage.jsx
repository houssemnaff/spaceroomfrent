import React, { useState } from "react";
import { FaEnvelope, FaPhone, FaComment, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../auth/authContext";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../../components/layouts/navbar";

const Support = () => {
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    name: user ? `${user.name} ` : "",
    email: user ? user.email : "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Vérifie si tous les champs sont remplis
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        toast.error('Veuillez remplir tous les champs', {
            containerId: "devoirs-toast"
    
          });
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/support`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Message envoyé avec succès !', {
            containerId: "devoirs-toast"
    
          });
        setSubmitted(true);
        setFormData({
          name: user ? `${user.name} ` : "",
          email: user ? user.email : "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message', {
        containerId: "devoirs-toast"

      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <Navbar />
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 dark:text-blue-400 mb-3">Contactez notre équipe</h1>
          <p className="text-lg max-w-2xl mx-auto text-black dark:text-gray-300">
            Nous sommes là pour répondre à vos questions et vous aider à tirer le meilleur parti de SpaceRoom.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-700 transition-colors duration-500">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-6">Informations de contact</h2>

            <div className="space-y-6 text-black dark:text-gray-300">
              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                  <FaEnvelope className="text-black dark:text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Email</h3>
                  <p>houssemnaffouti28@gmail.com</p>
                  <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">Réponse sous 24h</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                  <FaPhone className="text-black dark:text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Téléphone</h3>
                  <p>+216 99 85 75 19</p>
                  <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">Lun-Ven, 9h-18h</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                  <FaComment className="text-black dark:text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Chat en direct</h3>
                  <p>Disponible sur votre espace</p>
                  <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">Connectez-vous pour accéder au chat</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-700 transition-colors duration-500">
            {submitted ? (
              <div className="text-center py-8 text-black dark:text-gray-300">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <FaPaperPlane className="text-black dark:text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-2">Message envoyé !</h3>
                <p>Notre équipe vous répondra dans les plus brefs délais.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-6">Envoyez-nous un message</h2>
                <form onSubmit={handleSubmit} className="space-y-5 text-black dark:text-gray-300">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Nom complet</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-blue-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Adresse email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-blue-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Sujet</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-blue-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="technical">Problème technique</option>
                      <option value="billing">Question de facturation</option>
                      <option value="course">Question sur un cours</option>
                      <option value="account">Problème de compte</option>
                      <option value="other">Autre demande</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Votre message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className="w-full px-4 py-3 border border-blue-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center
                    ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <FaPaperPlane className="mr-2" />
                    {loading ? "Envoi..." : "Envoyer le message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;