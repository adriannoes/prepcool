
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/login');
      setIsMenuOpen(false);
    }
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
    setIsMenuOpen(false);
  };
  
  return (
    <nav 
      className={`w-full py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent backdrop-blur-sm bg-white/70'
      }`}
    >
      <div className="flex items-center">
        <Link to="/" className="font-bold text-2xl text-gray-800 transition-transform hover:scale-105 duration-300">
          Prep<span className="text-coral">Cool</span>
        </Link>
      </div>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden text-gray-700 hover:text-coral transition-colors"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {!user && (
          <>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="text-gray-700 hover:text-coral transition-colors font-medium"
            >
              Como funciona
            </button>
          </>
        )}
        <Link to="/sobre-nos" className="text-gray-700 hover:text-coral transition-colors font-medium">
          Sobre nós
        </Link>
        <Link to="/ajuda" className="text-gray-700 hover:text-coral transition-colors font-medium">
          Quer nos apoiar?
        </Link>
        {user && (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-coral transition-colors font-medium">
              Dashboard
            </Link>
            <Link to="/aprendizado" className="text-gray-700 hover:text-coral transition-colors font-medium">
              Aprendizado
            </Link>
            <NotificationBell />
          </>
        )}
      </div>

      {/* Login/Logout button - always visible on desktop */}
      <div className="hidden md:flex items-center space-x-4">
        {user ? (
          <Button 
            onClick={signOut} 
            variant="outline"
            className="border-coral text-coral hover:bg-coral/10"
          >
            Sair
          </Button>
        ) : (
          <Link 
            to="/login" 
            className="bg-coral/10 hover:bg-coral/20 text-coral rounded-md py-2 px-6 font-medium transition-colors"
          >
            Entrar
          </Link>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-6 flex flex-col space-y-6 animate-fade-in z-50">
          {!user && (
            <>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 py-2 hover:text-coral transition-colors font-medium"
              >
                Como funciona
              </button>
            </>
          )}
          <Link 
            to="/sobre-nos" 
            className="text-gray-700 py-2 hover:text-coral transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Sobre nós
          </Link>
          <Link 
            to="/ajuda" 
            className="text-gray-700 py-2 hover:text-coral transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Quer nos apoiar?
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                className="text-gray-700 py-2 hover:text-coral transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/aprendizado"
                className="text-gray-700 py-2 hover:text-coral transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Aprendizado
              </Link>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700 font-medium">Notificações</span>
                <NotificationBell />
              </div>
            </>
          )}
          <button 
            onClick={handleAuthAction}
            className={user ? 
              "border border-coral text-coral py-3 px-4 rounded-md text-center hover:bg-coral/10 transition-colors font-medium" : 
              "bg-coral text-white py-3 px-4 rounded-md text-center hover:bg-coral/90 transition-colors font-medium"
            }
          >
            {user ? "Sair" : "Entrar"}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
