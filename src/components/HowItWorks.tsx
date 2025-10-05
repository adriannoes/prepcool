
import React, { useEffect, useRef } from 'react';
import FeatureCard from './FeatureCard';
import { UserPlus, Layers, Medal } from 'lucide-react';

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => observer.observe(card));
    
    return () => {
      cards.forEach(card => observer.unobserve(card));
    };
  }, []);
  
  return (
    <div id="how-it-works" className="w-full py-20 px-6 bg-off-white" ref={sectionRef}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Como funciona a PrepCool?</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Nossa plataforma foi desenhada para facilitar seu caminho rumo ao sucesso acadêmico,
            com uma jornada simples e efetiva que coloca você no controle do seu aprendizado.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card opacity-0" style={{ transitionDelay: '0.1s' }}>
            <FeatureCard 
              icon={UserPlus} 
              title="Faça seu cadastro" 
              description="Crie sua conta em segundos e tenha acesso à nossa plataforma completa de estudo para vestibular."
            />
          </div>
          <div className="feature-card opacity-0" style={{ transitionDelay: '0.3s' }}>
            <FeatureCard 
              icon={Layers} 
              title="Interaja com a trilha de conhecimento" 
              description="Acesse conteúdos personalizados e organizados de acordo com seu ritmo de aprendizagem e objetivos."
            />
          </div>
          <div className="feature-card opacity-0" style={{ transitionDelay: '0.5s' }}>
            <FeatureCard 
              icon={Medal} 
              title="Faça exercícios e simulados" 
              description="Pratique com exercícios e simulados, sempre com a ajuda da nossa IA para você não ficar travado e ter sempre um assistente."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
