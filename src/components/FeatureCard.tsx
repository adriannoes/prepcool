
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
      <div className="bg-coral/10 p-5 rounded-full mb-6">
        <Icon className="h-8 w-8 text-coral" />
      </div>
      <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
