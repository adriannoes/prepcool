
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-transparent sticky top-0 z-50 backdrop-blur-sm bg-white/70">
      <div className="flex items-center">
        <Link to="/" className="font-bold text-2xl text-gray-800">
          Prep<span className="text-coral">Cool</span>
        </Link>
      </div>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden text-gray-700 hover:text-coral"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop navigation */}
      <div className="hidden md:flex space-x-8">
        <button 
          onClick={() => scrollToSection('how-it-works')} 
          className="text-gray-700 hover:text-coral transition-colors"
        >
          Como funciona
        </button>
        <Link to="/sobre-nos" className="text-gray-700 hover:text-coral transition-colors">
          Sobre nós
        </Link>
        <Link to="/" className="text-gray-700 hover:text-coral transition-colors">
          Cursos
        </Link>
      </div>

      {/* Login button - always visible on desktop */}
      <div className="hidden md:block">
        <Link 
          to="/login" 
          className="rounded-md py-2 px-4 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
        >
          Entrar
        </Link>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-4 flex flex-col space-y-4 animate-fade-in">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-gray-700 py-2 hover:text-coral transition-colors"
          >
            Como funciona
          </button>
          <Link 
            to="/sobre-nos" 
            className="text-gray-700 py-2 hover:text-coral transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Sobre nós
          </Link>
          <Link 
            to="/" 
            className="text-gray-700 py-2 hover:text-coral transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Cursos
          </Link>
          <Link 
            to="/login" 
            className="bg-coral text-white py-2 px-4 rounded-md text-center hover:bg-coral/90 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Entrar
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
