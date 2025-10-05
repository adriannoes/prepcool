
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { populateBiologia } from '@/scripts/populateBiologia';

interface PopulateResult {
  success: boolean;
  message?: string;
  error?: string;
}

const DatabasePopulator = () => {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<PopulateResult | null>(null);

  const handlePopulateBiologia = async () => {
    setLoading(true);
    try {
      const result = await populateBiologia();
      setLastResult(result);
      
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao popular banco de dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Populador de Banco de Dados</h2>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Popular Disciplinas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Biologia</h3>
            <p className="text-sm text-gray-600 mb-3">
              Criará a disciplina de Biologia com 5 tópicos: Ecologia, Genética e Biologia Molecular, 
              Citologia, Evolução, e Anatomia e Fisiologia Humana. Total de 8 vídeos.
            </p>
            <Button
              onClick={handlePopulateBiologia}
              disabled={loading}
              className="bg-coral hover:bg-coral/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Populando...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Popular Biologia
                </>
              )}
            </Button>
          </div>

          {lastResult && (
            <div className={`mt-4 p-3 rounded-lg flex items-center ${
              lastResult.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {lastResult.success ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <AlertCircle className="mr-2 h-4 w-4" />
              )}
              <span className="text-sm">
                {lastResult.success ? lastResult.message : lastResult.error}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabasePopulator;
