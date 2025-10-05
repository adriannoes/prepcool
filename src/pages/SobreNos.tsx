
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SobreNos = () => {
  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full py-16 px-6 md:px-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Sobre nós</h1>
        <p className="text-lg text-gray-600 mb-4">
          A PrepCool é uma plataforma de educação online dedicada a ajudar estudantes a se prepararem para os vestibulares mais concorridos do Brasil.
        </p>
        <p className="text-lg text-gray-600 mb-4">
          Nossa missão é democratizar o acesso ao ensino de qualidade, oferecendo conteúdo personalizado e ferramentas inovadoras para potencializar o aprendizado.
        </p>
        <p className="text-lg text-gray-600 mb-4">
          Fundada por educadores apaixonados e especialistas em tecnologia, a PrepCool combina métodos pedagógicos comprovados com inteligência artificial para criar uma experiência de estudo adaptativa e eficiente.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default SobreNos;
