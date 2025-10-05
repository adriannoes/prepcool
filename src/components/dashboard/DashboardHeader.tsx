
import React from 'react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  userName: string;
  onSignOut: () => void;
}

const DashboardHeader = ({ userName, onSignOut }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-wrap justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Olá, {userName}! Acompanhe seu progresso de estudos.
        </p>
      </div>
      <Button 
        onClick={onSignOut}
        variant="outline"
        className="border-coral text-coral hover:bg-coral/10 mt-2 md:mt-0"
      >
        Sair
      </Button>
    </div>
  );
};

export default DashboardHeader;
