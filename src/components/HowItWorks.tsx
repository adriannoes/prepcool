
import React from 'react';
import FeatureCard from './FeatureCard';
import { UserPlus, Layers, Medal } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div id="how-it-works" className="w-full py-16 px-6 bg-off-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">Como funciona a PrepCool?</h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Nossa plataforma foi desenhada para facilitar seu caminho rumo ao sucesso acadêmico, com uma jornada simples e efetiva.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={UserPlus} 
            title="Faça seu cadastro" 
            description="Crie sua conta em segundos e tenha acesso à nossa plataforma completa de estudo para vestibular."
          />
          <FeatureCard 
            icon={Layers} 
            title="Interaja com a trilha de conhecimento" 
            description="Acesse conteúdos personalizados e organizados de acordo com seu ritmo de aprendizagem e objetivos."
          />
          <FeatureCard 
            icon={Medal} 
            title="Faça exercícios e simulados" 
            description="Pratique com exercícios e simulados, sempre com a ajuda da nossa IA para você não ficar travado e ter sempre um assistente."
          />
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
