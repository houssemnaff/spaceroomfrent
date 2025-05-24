import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative w-full px-20 pt-16 pb-20 max-lg:px-10 max-md:px-5 overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Moving geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-400/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-indigo-400/25 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-purple-400/20 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* Animated lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse"></div>
          <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-300/40 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
        </div>
        <div className="absolute top-1/4 left-3/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-1 bg-cyan-300/50 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
        </div>
        <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-indigo-300/30 rounded-full animate-ping" style={{animationDelay: '2.5s'}}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-[1306px] gap-12 flex items-center max-md:flex-col">
        {/* Text Section - Now on Left */}
        <div className="w-6/12 max-md:w-full">
          <div className="flex flex-col py-0.5 pr-8 max-md:pr-0 max-md:text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-blue-100 bg-blue-800/30 backdrop-blur-sm rounded-full border border-blue-400/20 w-fit max-md:mx-auto">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
              Plateforme d'apprentissage moderne
            </div>
            
            <h1 className="text-6xl font-bold leading-[60px] text-white max-lg:text-5xl max-md:text-[40px] max-md:leading-[44px] mb-2">
              Apprenez,{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">
                Collaborez
              </span>
              , Réussissez
            </h1>
            
            <p className="mt-6 text-xl text-blue-100/90 max-md:mt-5 leading-relaxed">
              Une plateforme moderne pour l'apprentissage interactif et collaboratif. 
              Découvrez une nouvelle façon d'apprendre avec nos outils innovants.
            </p>
            
            <div className="mt-10 flex gap-4 max-md:justify-center">
              <Link to="login">
                <button className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <span className="relative z-10">S'inscrire gratuitement</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>
              </Link>
             
            </div>
            
           
          </div>
        </div>
        
        {/* Image Section - Now on Right */}
        <div className="w-6/12 max-md:w-full pl-8 max-md:pl-0 max-md:mb-10">
          <div className="relative group">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 rounded-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
            
            {/* Main image container */}
            <div className="relative bg-gradient-to-br from-blue-800/50 to-indigo-900/50 backdrop-blur-sm rounded-2xl p-4 border border-blue-400/20">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/222eecf589b29ffbec876a90218840cc780883b4708563dad0466265b9ba58f4?placeholderIfAbsent=true"
                alt="Platform Preview"
                className="w-full rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Floating elements around image */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400/80 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400/80 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 -left-6 w-4 h-4 bg-indigo-400/60 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-20 text-blue-800/30" viewBox="0 0 1200 120" fill="currentColor">
          <path d="M0,60 C400,20 800,100 1200,60 L1200,120 L0,120 Z">
            <animate attributeName="d" 
              values="M0,60 C400,20 800,100 1200,60 L1200,120 L0,120 Z;
                      M0,80 C400,40 800,80 1200,40 L1200,120 L0,120 Z;
                      M0,60 C400,20 800,100 1200,60 L1200,120 L0,120 Z" 
              dur="6s" 
              repeatCount="indefinite"/>
          </path>
        </svg>
      </div>
    </section>
  );
};