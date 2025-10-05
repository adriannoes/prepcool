
import React, { useEffect, useRef } from 'react';
import FeatureCard from './FeatureCard';
import { UserPlus, Layers, Medal } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('howItWorks.title')}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t('howItWorks.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
          <div className="feature-card opacity-0 h-full" style={{ transitionDelay: '0.1s' }}>
            <FeatureCard 
              icon={UserPlus} 
              title={t('howItWorks.step1.title')} 
              description={t('howItWorks.step1.description')}
            />
          </div>
          <div className="feature-card opacity-0 h-full" style={{ transitionDelay: '0.3s' }}>
            <FeatureCard 
              icon={Layers} 
              title={t('howItWorks.step2.title')} 
              description={t('howItWorks.step2.description')}
            />
          </div>
          <div className="feature-card opacity-0 h-full" style={{ transitionDelay: '0.5s' }}>
            <FeatureCard 
              icon={Medal} 
              title={t('howItWorks.step3.title')} 
              description={t('howItWorks.step3.description')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
