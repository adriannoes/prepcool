
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
