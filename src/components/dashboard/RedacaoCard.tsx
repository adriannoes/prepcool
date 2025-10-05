
import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmptyState from './EmptyState';

interface RedacaoCardProps {
  submitted: number;
  averageScore: number | null;
}

const RedacaoCard = ({ submitted, averageScore }: RedacaoCardProps) => {
  const hasNoRedacoes = submitted === 0;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Redações</CardTitle>
          <CardDescription>Seus textos e avaliações</CardDescription>
        </div>
        <FileText className="h-6 w-6 text-[#5E60CE]" />
      </CardHeader>
      <CardContent className="flex-grow">
        {hasNoRedacoes ? (
          <EmptyState 
            message="Nenhuma redação enviada. Pratique sua escrita!" 
            icon={<FileText className="h-5 w-5" />}
            className="mt-2"
          />
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="text-4xl font-bold text-[#5E60CE]">{submitted}</div>
            <div className="text-gray-500 mb-4">redações enviadas</div>
            
            {averageScore !== null && (
              <div className="mt-2">
                <Badge 
                  variant="secondary" 
                  className="text-sm px-3 py-1 bg-[#5E60CE]/10 text-[#5E60CE] border-none"
                >
                  Nota média: {averageScore !== null ? String(Math.round(averageScore)) : "0"}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full h-12 bg-[#5E60CE] hover:bg-[#5E60CE]/90 text-white rounded-md px-4 py-2">
          <FileText className="mr-2 h-4 w-4" />
          Escrever Redação
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RedacaoCard;
