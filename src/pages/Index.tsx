
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    // Add animation classes to elements when they enter the viewport
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
    
    const animatedElements = document.querySelectorAll('.should-animate');
    animatedElements.forEach(el => observer.observe(el));
    
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      
      {/* Call to action section with button to open waitlist modal */}
      <section className="bg-gray-50 py-16 px-6" id="lead-form">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Entre para nossa <span className="text-coral">lista de espera</span>
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto mb-8">
                Seja um dos primeiros a experimentar nossa plataforma e transforme sua preparação para o vestibular.
                Você será notificado assim que abrirmos as portas!
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-coral hover:bg-coral/90 text-white font-semibold px-10 py-6 rounded-lg shadow-lg transition-all hover:scale-105 text-lg"
              >
                Entrar na Lista de Espera <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <LeadCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Footer />
    </div>
  );
};

export default Index;
