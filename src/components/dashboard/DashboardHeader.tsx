
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  userName: string;
  onSignOut: () => void;
}

const DashboardHeader = ({ userName, onSignOut }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Olá, {userName}! Acompanhe seu progresso de estudos.
        </p>
      </div>
      <Button 
        onClick={onSignOut}
        variant="outline"
        className="border-coral text-coral hover:bg-coral/10 h-12 px-4 py-2 sm:self-start flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Sair</span>
      </Button>
    </div>
  );
};

export default DashboardHeader;
