
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="bg-off-white flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
        Prepare-se para o Vestibular <span className="text-coral">de Forma Inteligente</span>
      </h1>
      
      <p className="text-lg md:text-xl text-gray-600 max-w-3xl mb-8">
        Plataforma completa para preparação para o vestibular com resumos, exercícios, 
        simulados e acompanhamento personalizado.
      </p>
      
      {!user ? (
        <Link 
          to="/signup" 
          className="bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-all hover:shadow-xl"
        >
          Comece Agora
        </Link>
      ) : (
        <Link 
          to="/dashboard" 
          className="bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-all hover:shadow-xl"
        >
          Acesse sua Área de Estudos
        </Link>
      )}
      
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Material Completo</h3>
          <p className="text-gray-600">
            Resumos, videoaulas e exercícios para todas as matérias do vestibular.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Simulados Periódicos</h3>
          <p className="text-gray-600">
            Pratique com simulados no estilo das principais universidades.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Acompanhamento</h3>
          <p className="text-gray-600">
            Monitore seu progresso e receba dicas personalizadas de estudo.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
