import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Hero = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="bg-off-white flex flex-col md:flex-row items-center justify-between px-6 py-16 md:py-24 max-w-7xl mx-auto">
      {/* Left Column - Value Proposition */}
      <div className="flex flex-col w-full md:w-1/2 mb-12 md:mb-0 text-left">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
          {t('hero.title').split(' ').map((word, index, arr) => {
            // Highlight "transforma seu futuro" in Portuguese or "transforms your future" in English
            const highlightPhrases = {
              pt: ['transforma', 'seu', 'futuro'],
              en: ['transforms', 'your', 'future']
            };
            const currentLanguage = t('language.portuguese') === 'Português' ? 'pt' : 'en';
            const isHighlight = highlightPhrases[currentLanguage].includes(word.toLowerCase());
            
            return (
              <span key={index} className={isHighlight ? 'text-coral' : ''}>
                {word}{index < arr.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">
          {t('hero.description')}
        </p>
        
        {!user ? (
          <Link 
            to="/signup" 
            className="bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-all hover:scale-105 transform duration-300 w-fit text-center"
          >
            {t('hero.cta.start')}
          </Link>
        ) : (
          <Link 
            to="/dashboard" 
            className="bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-all hover:scale-105 transform duration-300 w-fit text-center"
          >
            {t('hero.cta.dashboard')}
          </Link>
        )}
      </div>
      
      {/* Right Column - Modern Sketch */}
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="relative w-full max-w-md h-[400px]">
          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-coral/10 rounded-full"></div>
          <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-coral/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-coral/15 rounded-full animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col">
            <div className="border-b border-gray-200/50 flex-1"></div>
            <div className="border-b border-gray-200/50 flex-1"></div>
            <div className="border-b border-gray-200/50 flex-1"></div>
          </div>
          <div className="absolute inset-0 flex flex-row">
            <div className="border-r border-gray-200/50 flex-1"></div>
            <div className="border-r border-gray-200/50 flex-1"></div>
            <div className="border-r border-gray-200/50 flex-1"></div>
          </div>
          
          {/* Content Elements */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg p-3 rotate-6">
            <div className="w-16 h-8 bg-coral/20 rounded-md"></div>
          </div>
          <div className="absolute bottom-1/3 right-1/3 bg-white shadow-lg rounded-lg p-4 rotate-[-6deg]">
            <div className="w-24 h-3 bg-gray-200 rounded-full mb-2"></div>
            <div className="w-16 h-3 bg-gray-200 rounded-full"></div>
          </div>
          <div className="absolute top-1/2 right-1/4 transform translate-y-1/4 bg-white shadow-lg rounded-lg p-4">
            <div className="w-20 h-20 bg-coral/10 rounded-md flex items-center justify-center">
              <div className="w-12 h-12 bg-coral/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
