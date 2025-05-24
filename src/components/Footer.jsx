export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">
            SpaceRoom
          </h3>
          <p className="text-gray-300">
            Une plateforme éducative moderne qui permet aux enseignants de créer des cours interactifs, d'inviter des étudiants et d'utiliser l'intelligence artificielle pour enrichir l'expérience d'apprentissage.
          </p>
        </div>
        
        {/* Footer Bottom Text */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center">
          <p className="text-gray-400">
            © 2024 SpaceRoom. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};