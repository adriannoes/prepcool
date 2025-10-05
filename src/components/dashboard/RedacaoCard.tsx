
import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmptyState from './EmptyState';
import { Link } from 'react-router-dom';

interface RedacaoCardProps {
  submitted: number;
  averageScore: number | null;
}

const RedacaoCard = ({ submitted, averageScore }: RedacaoCardProps) => {
  const hasNoRedacoes = submitted === 0;
  
  return (
    <Card className="h-full flex flex-col bg-white rounded-2xl shadow-md border-0 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Redações</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Seus textos e avaliações
            </CardDescription>
          </div>
          <div className="bg-[#5E60CE]/10 p-3 rounded-2xl">
            <FileText className="h-8 w-8 text-[#5E60CE]" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow px-8 py-4">
        {hasNoRedacoes ? (
          <EmptyState 
            message="Nenhuma redação enviada. Pratique sua escrita!" 
            icon={<FileText className="h-6 w-6" />}
            className="bg-gray-50 border-gray-200 border-dashed rounded-xl p-6"
          />
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl font-bold text-[#5E60CE] mb-2">{submitted}</div>
            <div className="text-lg text-gray-600 mb-6">redações enviadas</div>
            
            {averageScore !== null && (
              <div className="flex justify-center">
                <Badge 
                  variant="secondary" 
                  className="text-base px-4 py-2 bg-[#5E60CE]/10 text-[#5E60CE] border-none rounded-lg font-medium"
                >
                  Nota média: {averageScore !== null ? String(Math.round(averageScore)) : "0"}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-8 pt-4">
        <Button 
          asChild 
          className="w-full h-12 bg-[#5E60CE] hover:bg-[#4e51b3] text-white rounded-xl px-6 py-3 font-semibold text-base transition-all duration-200"
        >
          <Link to="/redacao">
            <FileText className="mr-2 h-5 w-5" />
            Escrever Redação
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RedacaoCard;
