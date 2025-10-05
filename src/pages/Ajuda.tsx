
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Heart, Mail, Rocket } from 'lucide-react';

const Ajuda = () => {
  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#5E60CE] to-[#7C3AED] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-coral mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold">
              Sobre o Projeto PrepCool
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Um projeto independente, construído por pessoas apaixonadas por educação e tecnologia.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Mission Section */}
          <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                <strong>PrepCool é um projeto independente, construído por pessoas apaixonadas por educação e tecnologia.</strong>
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Nasceu como uma iniciativa voluntária, com um objetivo claro: usar o melhor da inteligência artificial para transformar a preparação para o vestibular no Brasil.
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Acreditamos que todo estudante, independente de onde venha, merece ter acesso a ferramentas modernas, conteúdo de qualidade e um plano de estudos personalizado — tudo isso de forma gratuita, leve e acessível.
              </p>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Estamos criando uma plataforma feita com carinho e muita tecnologia:
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-[#5E60CE]/10 p-3 rounded-xl">
                  <div className="w-6 h-6 bg-[#5E60CE] rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">IA para gerar planos de estudo adaptativos</h3>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-coral/10 p-3 rounded-xl">
                  <div className="w-6 h-6 bg-coral rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Correção automática de redações</h3>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-[#5E60CE]/10 p-3 rounded-xl">
                  <div className="w-6 h-6 bg-[#5E60CE] rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Simulados com análise de desempenho</h3>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-coral/10 p-3 rounded-xl">
                  <div className="w-6 h-6 bg-coral rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Aulas curadas e organizadas por trilhas de aprendizado</h3>
                </div>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Mas para que o PrepCool continue crescendo, precisamos da sua ajuda.
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                <strong>Todo o projeto depende de infraestrutura técnica (APIs de IA, banco de dados, servidores) e horas de desenvolvimento.</strong>
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Além disso, buscamos pessoas e instituições que queiram colaborar com conteúdo pedagógico, mentorias ou apoio financeiro.
              </p>
              
              <p className="text-xl text-gray-700 mb-8">
                Se você acredita que a educação muda vidas, e quer contribuir com essa missão, apoie o PrepCool:
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-[#5E60CE] to-[#7C3AED] rounded-2xl shadow-lg p-8 md:p-12 text-center text-white">
            <div className="mb-8">
              <Mail className="h-16 w-16 mx-auto mb-6 text-white" />
              <h2 className="text-3xl font-bold mb-6">
                Vamos conversar!
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Vamos adorar conversar com você sobre formas de colaboração — seja como pessoa física, empresa, educador ou entusiasta.
              </p>
            </div>
            
            <Button 
              className="bg-coral hover:bg-coral/90 text-white font-semibold px-12 py-6 rounded-xl shadow-lg transition-all hover:scale-105 text-lg mb-8"
              asChild
            >
              <a href="mailto:contato@prepcool.ai">
                <Mail className="mr-3 h-6 w-6" />
                Enviar e-mail para contato@prepcool.ai
              </a>
            </Button>
            
            <div className="border-t border-white/20 pt-8">
              <p className="text-xl font-semibold text-white mb-2">
                <strong>Juntos, podemos ampliar o acesso à educação de qualidade.</strong>
              </p>
              <p className="text-lg text-blue-100 flex items-center justify-center">
                E fazer com que mais jovens realizem o sonho de entrar na universidade.
                <Rocket className="ml-2 h-6 w-6" />
              </p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Ajuda;
