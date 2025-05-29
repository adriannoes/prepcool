
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Column */}
          <div className="flex flex-col space-y-6">
            <Link to="/" className="font-bold text-2xl text-gray-800">
              Prep<span className="text-coral">Cool</span>
            </Link>
            <p className="text-gray-600 max-w-xs">
              Plataforma de educação online para o sucesso no vestibular e transformação do seu futuro.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-coral transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={22} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-coral transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={22} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-coral transition-colors"
                aria-label="Youtube"
              >
                <Youtube size={22} />
              </a>
            </div>
          </div>
          
          {/* Institutional Column */}
          <div className="flex flex-col space-y-6">
            <h3 className="font-semibold text-lg text-gray-800">Institucional</h3>
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-600 hover:text-coral transition-colors">
                Cursos
              </Link>
              <Link to="/sobre-nos" className="text-gray-600 hover:text-coral transition-colors">
                Sobre nós
              </Link>
              <Link to="/ajuda" className="text-gray-600 hover:text-coral transition-colors">
                Quer nos apoiar?
              </Link>
              <Link to="/" className="text-gray-600 hover:text-coral transition-colors">
                Nossa política de aprendizagem
              </Link>
            </div>
          </div>
          
          {/* Contact Column */}
          <div className="flex flex-col space-y-6">
            <h3 className="font-semibold text-lg text-gray-800">Fale Conosco</h3>
            <a href="mailto:contato@prepcool.ai" className="text-gray-600 hover:text-coral transition-colors">
              contato@prepcool.ai
            </a>
            <p className="text-gray-600">
              De Curitiba para o mundo!<br />
              Brasil
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} PrepCool. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
