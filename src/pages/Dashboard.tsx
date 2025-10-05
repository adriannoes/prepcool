
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, Play } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-off-white p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <Button 
              onClick={signOut}
              variant="outline"
              className="border-coral text-coral hover:bg-coral/10"
            >
              Sair
            </Button>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="font-medium text-lg mb-2">Bem-vindo!</h2>
            <p className="text-gray-600">
              Olá, {user?.user_metadata?.nome || 'Estudante'}! Esta é sua área de estudos na PrepCool.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Meus Cursos</h3>
              <p className="text-gray-600 mb-4">
                Acesse nossa plataforma de aprendizado para estudar os conteúdos disponíveis.
              </p>
              <Link to="/aprendizado">
                <Button className="bg-[#5E60CE] hover:bg-[#5E60CE]/90 flex items-center gap-2">
                  <Play size={16} />
                  Acessar Trilha de Aprendizado
                </Button>
              </Link>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Próximos Simulados</h3>
              <p className="text-gray-600">
                Nenhum simulado agendado. Verifique nossa programação em breve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
