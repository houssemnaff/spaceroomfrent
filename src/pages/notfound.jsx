import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        {/* SVG Animé avec personnage et bulle de dialogue */}
        <svg 
          width="200" 
          height="200" 
          viewBox="0 0 200 200" 
          className="mb-6"
        >
          {/* Fond circulaire animé */}
          <circle 
            cx="100" 
            cy="100" 
            r="80" 
            fill="#EFF6FF" 
            className="animate-pulse-slow"
          />
          
          {/* Personnage */}
          <g className="animate-bounce-soft">
            {/* Tête */}
            <circle cx="100" cy="80" r="25" fill="#8BB8E8" stroke="#4C51BF" strokeWidth="2"/>
            
            {/* Yeux */}
            <circle cx="90" cy="75" r="4" fill="#2D3748" className="animate-blink"/>
            <circle cx="110" cy="75" r="4" fill="#2D3748" className="animate-blink"/>
            
            {/* Sourire */}
            <path 
              d="M85 95 Q100 110 115 95" 
              stroke="#2D3748" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Corps */}
            <rect x="85" y="110" width="30" height="40" rx="5" fill="#6E56CF" stroke="#4C51BF" strokeWidth="2"/>
            
            {/* Livre (animé séparément) */}
            <g className="animate-book-float">
              <rect x="120" y="115" width="30" height="25" rx="3" fill="#FFD166" stroke="#D97706" strokeWidth="1.5"/>
              <line x1="120" y1="125" x2="150" y2="125" stroke="#92400E" strokeWidth="1"/>
              <line x1="120" y1="130" x2="150" y2="130" stroke="#92400E" strokeWidth="1"/>
            </g>
          </g>
          
          {/* Bulle de dialogue animée */}
          <g className="animate-float">
            <path 
              d="M50 60 C40 30 20 40 30 70 C25 75 45 75 50 70 Z" 
              fill="white" 
              stroke="#CBD5E0" 
              strokeWidth="1.5"
            />
            <text 
              x="40" 
              y="60" 
              fontSize="12" 
              fontWeight="bold" 
              fill="#4C51BF"
              textAnchor="middle"
            >
              ?
            </text>
          </g>
        </svg>
  
        We can’t seem to find the page you are looking for!
        <Link
          to="/home"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Back to Home Page
        </Link>
  
        {/* Styles d'animation intégrés */}
        <style jsx>{`
          .animate-pulse-slow {
            animation: pulse 4s ease-in-out infinite;
          }
          .animate-bounce-soft {
            animation: bounce 6s ease-in-out infinite;
          }
          .animate-book-float {
            animation: bookFloat 3s ease-in-out infinite;
          }
          .animate-float {
            animation: float 5s ease-in-out infinite;
          }
          .animate-blink {
            animation: blink 4s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes bookFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(2deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-5px) translateX(2px); }
            75% { transform: translateY(3px) translateX(-2px); }
          }
          @keyframes blink {
            0%, 45%, 55%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(0.1); }
          }
        `}</style>
      </div>
  );
}
