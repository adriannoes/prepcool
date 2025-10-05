
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Você não tem permissão para acessar esta área. 
            Esta seção é restrita apenas para administradores.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-coral hover:bg-coral/90"
            >
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Ir para Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
