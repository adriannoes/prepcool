
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Apoiar = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-off-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Quer nos apoiar?</h1>
          <p className="text-xl text-gray-600 mb-8">
            Estamos trabalhando nesta página. Em breve você poderá nos apoiar e contribuir para 
            que mais estudantes tenham acesso a uma educação de qualidade.
          </p>
          <div className="p-12 bg-white rounded-xl shadow-lg">
            <p className="text-2xl text-gray-500">Conteúdo em desenvolvimento</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Apoiar;
