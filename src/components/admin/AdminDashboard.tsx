
import React, { useState } from 'react';
import { FileText, Video, BookOpen, Target, Bell } from 'lucide-react';
import RedacaoManager from './RedacaoManager';
import VideoManager from './VideoManager';
import SimuladoManager from './SimuladoManager';
import PlanoViewer from './PlanoViewer';
import NotificationManager from './NotificationManager';

type AdminSection = 'redacoes' | 'videos' | 'simulados' | 'planos' | 'notificacoes';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('redacoes');

  const sections = [
    { id: 'redacoes' as AdminSection, name: 'Modelos de Redação', icon: FileText },
    { id: 'videos' as AdminSection, name: 'Vídeos', icon: Video },
    { id: 'simulados' as AdminSection, name: 'Simulados', icon: BookOpen },
    { id: 'planos' as AdminSection, name: 'Planos de Estudo', icon: Target },
    { id: 'notificacoes' as AdminSection, name: 'Notificações', icon: Bell },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'redacoes':
        return <RedacaoManager />;
      case 'videos':
        return <VideoManager />;
      case 'simulados':
        return <SimuladoManager />;
      case 'planos':
        return <PlanoViewer />;
      case 'notificacoes':
        return <NotificationManager />;
      default:
        return <RedacaoManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">PrepCool</p>
          </div>
          
          <nav className="mt-6">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                    activeSection === section.id
                      ? 'bg-coral/10 text-coral border-r-2 border-coral'
                      : 'text-gray-700'
                  }`}
                >
                  <IconComponent size={20} className="mr-3" />
                  {section.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
