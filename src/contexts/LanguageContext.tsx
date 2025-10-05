
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Hero Section
    'hero.title': 'Educação online que transforma seu futuro',
    'hero.description': 'Plataforma completa para preparação para o vestibular com resumos, exercícios, simulados e acompanhamento personalizado. Estude do seu jeito e conquiste sua vaga.',
    'hero.cta.start': 'Comece Agora',
    'hero.cta.dashboard': 'Acesse sua Área de Estudos',
    
    // How It Works Section
    'howItWorks.title': 'Como funciona a PrepCool?',
    'howItWorks.description': 'Nossa plataforma foi desenhada para facilitar seu caminho rumo ao sucesso acadêmico, com uma jornada simples e efetiva que coloca você no controle do seu aprendizado.',
    'howItWorks.step1.title': 'Faça seu cadastro',
    'howItWorks.step1.description': 'Crie sua conta em segundos e tenha acesso à nossa plataforma completa de estudo para vestibular.',
    'howItWorks.step2.title': 'Interaja com a trilha de conhecimento',
    'howItWorks.step2.description': 'Acesse conteúdos personalizados e organizados de acordo com seu ritmo de aprendizagem e objetivos.',
    'howItWorks.step3.title': 'Faça exercícios e simulados',
    'howItWorks.step3.description': 'Pratique com exercícios e simulados, sempre com a ajuda da nossa IA para você não ficar travado e ter sempre um assistente.',
    
    // CTA Section
    'cta.title': 'Entre para nossa lista de espera',
    'cta.description': 'Seja um dos primeiros a experimentar nossa plataforma e transforme sua preparação para o vestibular. Você será notificado assim que abrirmos as portas!',
    'cta.button': 'Entrar na Lista de Espera',
    
    // Navbar
    'nav.howItWorks': 'Como funciona',
    'nav.about': 'Sobre nós',
    'nav.support': 'Quer nos apoiar?',
    'nav.dashboard': 'Dashboard',
    'nav.learning': 'Aprendizado',
    'nav.login': 'Entrar',
    'nav.logout': 'Sair',
    
    // Footer
    'footer.description': 'Plataforma de educação online para o sucesso no vestibular e transformação do seu futuro.',
    'footer.institutional': 'Institucional',
    'footer.courses': 'Cursos',
    'footer.about': 'Sobre nós',
    'footer.support': 'Quer nos apoiar?',
    'footer.policy': 'Nossa política de aprendizagem',
    'footer.contact': 'Fale Conosco',
    'footer.location': 'De Curitiba para o mundo!\nBrasil',
    'footer.rights': 'Todos os direitos reservados.',
    
    // Language Switcher
    'language.portuguese': 'Português',
    'language.english': 'English'
  },
  en: {
    // Hero Section
    'hero.title': 'Online education that transforms your future',
    'hero.description': 'Complete platform for college entrance exam preparation with summaries, exercises, practice tests and personalized guidance. Study your way and secure your spot.',
    'hero.cta.start': 'Get Started',
    'hero.cta.dashboard': 'Access Your Study Area',
    
    // How It Works Section
    'howItWorks.title': 'How does PrepCool work?',
    'howItWorks.description': 'Our platform was designed to facilitate your path to academic success, with a simple and effective journey that puts you in control of your learning.',
    'howItWorks.step1.title': 'Create your account',
    'howItWorks.step1.description': 'Create your account in seconds and get access to our complete college entrance exam study platform.',
    'howItWorks.step2.title': 'Interact with the knowledge path',
    'howItWorks.step2.description': 'Access personalized and organized content according to your learning pace and goals.',
    'howItWorks.step3.title': 'Take exercises and practice tests',
    'howItWorks.step3.description': 'Practice with exercises and simulations, always with the help of our AI so you never get stuck and always have an assistant.',
    
    // CTA Section
    'cta.title': 'Join our waitlist',
    'cta.description': 'Be among the first to experience our platform and transform your college entrance exam preparation. You\'ll be notified as soon as we open our doors!',
    'cta.button': 'Join the Waitlist',
    
    // Navbar
    'nav.howItWorks': 'How it works',
    'nav.about': 'About us',
    'nav.support': 'Want to support us?',
    'nav.dashboard': 'Dashboard',
    'nav.learning': 'Learning',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Footer
    'footer.description': 'Online education platform for college entrance exam success and transforming your future.',
    'footer.institutional': 'Institutional',
    'footer.courses': 'Courses',
    'footer.about': 'About us',
    'footer.support': 'Want to support us?',
    'footer.policy': 'Our learning policy',
    'footer.contact': 'Contact Us',
    'footer.location': 'From Curitiba to the world!\nBrazil',
    'footer.rights': 'All rights reserved.',
    
    // Language Switcher
    'language.portuguese': 'Português',
    'language.english': 'English'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('prepcool-language') as Language;
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('prepcool-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
