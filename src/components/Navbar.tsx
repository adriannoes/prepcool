
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-transparent">
      <div className="flex items-center">
        <Link to="/" className="font-bold text-2xl text-gray-800">
          Prep<span className="text-coral">Cool</span>
        </Link>
      </div>
      
      <div className="hidden md:flex space-x-8">
        <Link to="/" className="text-gray-700 hover:text-coral transition-colors">
          Cursos
        </Link>
        <Link to="/" className="text-gray-700 hover:text-coral transition-colors">
          Como funciona
        </Link>
        <Link to="/" className="text-gray-700 hover:text-coral transition-colors">
          Sobre nós
        </Link>
      </div>

      <div>
        <Link 
          to="/login" 
          className="rounded-md py-2 px-4 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
        >
          Entrar
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
