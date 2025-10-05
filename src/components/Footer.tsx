
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full py-8 px-6 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <Link to="/" className="font-bold text-xl text-gray-800">
            Prep<span className="text-coral">Cool</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">© {new Date().getFullYear()} PrepCool. Todos os direitos reservados.</p>
        </div>
        
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
          <Link to="/" className="text-gray-600 hover:text-coral transition-colors">
            Termos de Uso
          </Link>
          <Link to="/" className="text-gray-600 hover:text-coral transition-colors">
            Política de Privacidade
          </Link>
          <Link to="/" className="text-gray-600 hover:text-coral transition-colors">
            Contato
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
