export const Avis = () => {
    return (
      <section className="w-full bg-gray-100 px-6 py-16 sm:px-10 md:px-16 lg:px-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Avis de nos utilisateurs
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
              <p className="text-gray-600 italic">
                "Super plateforme, intuitive et efficace pour mes études."
              </p>
              <div className="mt-4 flex justify-center text-yellow-500">⭐⭐⭐⭐⭐</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Emma R.</h3>
              <p className="text-sm text-gray-500">Étudiante</p>
            </div>
  
            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
              <p className="text-gray-600 italic">
                "Un excellent outil pour interagir avec mes étudiants !"
              </p>
              <div className="mt-4 flex justify-center text-yellow-500">⭐⭐⭐⭐⭐</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Thomas L.</h3>
              <p className="text-sm text-gray-500">Enseignant</p>
            </div>
  
            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
              <p className="text-gray-600 italic">
                "Les outils de collaboration sont parfaits pour mes besoins."
              </p>
              <div className="mt-4 flex justify-center text-yellow-500">⭐⭐⭐⭐⭐</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Sophie M.</h3>
              <p className="text-sm text-gray-500">Étudiante</p>
            </div>
          </div>
        </div>
      </section>
    );
  };
  