
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="w-full py-16 md:py-24 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
      <div className="w-full md:w-1/2 mb-10 md:mb-0 pr-0 md:pr-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
          Educação online que transforma seu futuro
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-lg">
          Preparo completo para o vestibular com aulas dinâmicas, material didático exclusivo e mentoria personalizada. Estude no seu ritmo e alcance a aprovação.
        </p>
        <Link 
          to="/login" 
          className="bg-coral hover:bg-coral/90 text-white font-medium py-3 px-8 rounded-md transition-colors text-lg inline-flex items-center"
        >
          Comece Agora
        </Link>
      </div>
      
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="relative h-64 md:h-80 w-64 md:w-80">
          <div className="absolute top-0 right-0 bg-coral rounded-full h-24 w-24 md:h-32 md:w-32 animate-pulse opacity-80"></div>
          <div className="absolute bottom-0 left-0 bg-coral rounded-full h-20 w-20 md:h-24 md:w-24 animate-pulse opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200 rounded-full h-40 w-40 md:h-48 md:w-48 opacity-80"></div>
          <div className="absolute h-full w-full">
            <svg 
              viewBox="0 0 200 200" 
              className="h-full w-full" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M40,40 L160,160 M40,160 L160,40" 
                stroke="rgba(60, 60, 60, 0.7)" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="30" fill="rgba(242, 110, 91, 0.2)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
