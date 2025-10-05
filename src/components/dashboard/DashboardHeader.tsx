
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from '../NotificationBell';

interface DashboardHeaderProps {
  userName: string;
  onSignOut: () => void;
}

const DashboardHeader = ({ userName, onSignOut }: DashboardHeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Olá, {userName}! 👋
            </h2>
            <p className="text-gray-600 mt-1">
              Bem-vindo de volta. Vamos continuar seus estudos?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Button 
              onClick={onSignOut}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 h-12 px-6 py-3 rounded-xl flex items-center gap-2 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
