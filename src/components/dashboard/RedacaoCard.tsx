
import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RedacaoCardProps {
  submitted: number;
  averageScore: number | null;
}

const RedacaoCard = ({ submitted, averageScore }: RedacaoCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Redações</CardTitle>
          <CardDescription>Seus textos e avaliações</CardDescription>
        </div>
        <FileText className="h-6 w-6 text-[#5E60CE]" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-4">
          <div className="text-4xl font-bold text-[#5E60CE]">{submitted}</div>
          <div className="text-gray-500">redações enviadas</div>
          
          {averageScore !== null && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-md px-3 py-1">
                Nota média: {averageScore !== null ? String(Math.round(averageScore)) : "0"}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#5E60CE] hover:bg-[#5E60CE]/90" disabled>
          <FileText className="mr-2 h-4 w-4" />
          Escrever Redação
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RedacaoCard;
