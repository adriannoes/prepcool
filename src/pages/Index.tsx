
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import Footer from '@/components/Footer';

const Index = () => {
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
      <LeadCaptureForm />
      <Footer />
    </div>
  );
};

export default Index;
