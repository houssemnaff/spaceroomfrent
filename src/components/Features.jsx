import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import {
  BrainCircuit,
  FileSearch,
  BookOpen,
  MessagesSquare,
  Users,
  BarChart4
} from 'lucide-react';

export const Features = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const features = [
    {
      icon: <BrainCircuit className="text-blue-600" size={40} />,
      title: "Génération Automatique de Quiz",
      description: "Notre IA crée des quiz personnalisés avec différents niveaux de difficulté."
    },
    {
      icon: <FileSearch className="text-blue-600" size={40} />,
      title: "Correction Automatique",
      description: "Correction IA des devoirs avec analyses détaillées."
    },
    {
      icon: <BookOpen className="text-blue-600" size={40} />,
      title: "Gestion Intelligente de Cours",
      description: "Organisation automatique du contenu pédagogique."
    },
    {
      icon: <MessagesSquare className="text-blue-600" size={40} />,
      title: "Assistant Pédagogique Virtuel",
      description: "Chatbot IA disponible 24/7 pour répondre aux questions."
    },
    {
      icon: <Users className="text-blue-600" size={40} />,
      title: "Espaces de Discussion Intelligents",
      description: "Forums modérés par IA avec synthèse des discussions."
    },
    {
      icon: <BarChart4 className="text-blue-600" size={40} />,
      title: "Analytiques Avancées",
      description: "Tableaux de bord avec pistes d'amélioration générées par IA."
    }
  ];

  return (
    <section className="w-full bg-gradient-to-b from-blue-50 to-white px-6 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
            Transformez l'Éducation avec SpaceRoom AI
          </h2>
          <p className="text-lg text-blue-600 max-w-3xl mx-auto">
            Notre plateforme intelligente révolutionne l'apprentissage grâce à l'IA générative
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 h-full"
  >
    <div className="p-8 text-center h-full flex flex-col">
      <div className="flex justify-center mb-6">
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="bg-blue-50 p-4 rounded-full"
        >
          {icon}
        </motion.div>
      </div>
      <h3 className="text-xl font-bold text-blue-900 mb-3">{title}</h3>
      <p className="text-blue-600 leading-relaxed flex-grow">{description}</p>
    </div>
  </motion.div>
);