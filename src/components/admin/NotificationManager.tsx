import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Bell, Send, Users, User, Eye, AlertTriangle } from 'lucide-react';
import { error as logError } from '@/utils/logger';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sanitizeInput, validateNotificationMessage, validateUrl } from '@/utils/inputValidation';

interface Usuario {
  id: string;
  nome: string;
  email: string;
}

interface Notification {
  id: string;
  usuario_id: string;
  tipo: string;
  mensagem: string;
  link_destino: string | null;
  lida: boolean;
  created_at: string;
  usuario?: {
    nome: string;
    email: string;
  };
}

const NotificationManager = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<number>(0);

  // Form state
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [notificationType, setNotificationType] = useState('manual');
  const [message, setMessage] = useState('');
  const [linkDestino, setLinkDestino] = useState('');
  const [sendToAll, setSendToAll] = useState(false);

  // Rate limiting: prevent sending notifications too frequently
  const RATE_LIMIT_MS = 5000; // 5 seconds between sends

  useEffect(() => {
    fetchUsuarios();
    fetchNotifications();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('id, nome, email')
        .order('nome');

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      logError('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive'
      });
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notificacao')
        .select(`
          *,
          usuario:usuario_id (
            nome,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      logError('Error fetching notifications:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as notificações.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async () => {
    // Rate limiting check
    const now = Date.now();
    if (now - lastSentAt < RATE_LIMIT_MS) {
      toast({
        title: 'Erro',
        description: `Aguarde ${Math.ceil((RATE_LIMIT_MS - (now - lastSentAt)) / 1000)} segundos antes de enviar outra notificação.`,
        variant: 'destructive'
      });
      return;
    }

    // Sanitize and validate inputs
    const sanitizedMessage = sanitizeInput(message);
    const sanitizedLink = linkDestino ? sanitizeInput(linkDestino) : '';

    // Validate message
    const messageError = validateNotificationMessage(sanitizedMessage);
    if (messageError) {
      toast({
        title: 'Erro',
        description: messageError,
        variant: 'destructive'
      });
      return;
    }

    // Validate URL if provided
    if (sanitizedLink && !validateUrl(sanitizedLink)) {
      toast({
        title: 'Erro',
        description: 'Link de destino inválido. Use apenas links relativos ou do mesmo domínio.',
        variant: 'destructive'
      });
      return;
    }

    if (!sendToAll && !selectedUser) {
      toast({
        title: 'Erro',
        description: 'Selecione um usuário ou marque para enviar para todos.',
        variant: 'destructive'
      });
      return;
    }

    // Limit batch notifications to prevent spam
    if (sendToAll && usuarios.length > 100) {
      toast({
        title: 'Erro',
        description: 'Não é possível enviar para mais de 100 usuários de uma vez por questões de segurança.',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);

    try {
      if (sendToAll) {
        // Send to all users with batch processing for security
        const batchSize = 50;
        const batches = [];
        
        for (let i = 0; i < usuarios.length; i += batchSize) {
          const batch = usuarios.slice(i, i + batchSize);
          batches.push(batch);
        }

        for (const batch of batches) {
          const notifications = batch.map(user => ({
            usuario_id: user.id,
            tipo: notificationType,
            mensagem: sanitizedMessage,
            link_destino: sanitizedLink || null
          }));

          const { error } = await supabase
            .from('notificacao')
            .insert(notifications);

          if (error) throw error;
        }

        toast({
          title: 'Sucesso',
          description: `Notificação enviada para ${usuarios.length} usuários.`
        });
      } else {
        // Send to specific user
        const { error } = await supabase
          .from('notificacao')
          .insert({
            usuario_id: selectedUser,
            tipo: notificationType,
            mensagem: sanitizedMessage,
            link_destino: sanitizedLink || null
          });

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Notificação enviada com sucesso.'
        });
      }

      // Update rate limiting
      setLastSentAt(now);

      // Reset form
      setSelectedUser('');
      setMessage('');
      setLinkDestino('');
      setSendToAll(false);
      
      // Refresh notifications list
      fetchNotifications();
    } catch (error) {
      logError('Error sending notification:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a notificação.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'novo_plano':
        return '📚';
      case 'novo_simulado':
        return '📝';
      case 'manual':
        return '🔔';
      default:
        return '🔔';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-coral" />
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Notificações</h2>
      </div>

      {/* Security Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold mb-1">Aviso de Segurança</p>
              <p>Este painel permite enviar notificações para usuários. Use com responsabilidade e evite spam. 
              Links externos não são permitidos por questões de segurança.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Enviar Notificação</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Nova Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="send-to-all">Destinatário</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="send-to-all"
                      type="checkbox"
                      checked={sendToAll}
                      onChange={(e) => setSendToAll(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="send-to-all" className="text-sm">
                      Enviar para todos os usuários
                    </Label>
                  </div>
                  {!sendToAll && (
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.nome} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification-type">Tipo</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="novo_plano">Novo Plano</SelectItem>
                      <SelectItem value="novo_simulado">Novo Simulado</SelectItem>
                      <SelectItem value="sistema">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite a mensagem da notificação... (máximo 500 caracteres)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">
                  {message.length}/500 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link de Destino (Opcional)</Label>
                <Input
                  id="link"
                  type="text"
                  placeholder="/dashboard, /simulados, etc... (apenas links internos)"
                  value={linkDestino}
                  onChange={(e) => setLinkDestino(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Use apenas links relativos (/dashboard) por questões de segurança
                </p>
              </div>

              <Button
                onClick={handleSendNotification}
                disabled={isSending || (!message.trim()) || (!sendToAll && !selectedUser)}
                className="bg-coral hover:bg-coral/90 w-full md:w-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSending ? 'Enviando...' : 'Enviar Notificação'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Histórico de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação encontrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{notification.usuario?.nome}</p>
                              <p className="text-sm text-gray-500">{notification.usuario?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{getNotificationIcon(notification.tipo)}</span>
                              <span className="capitalize">{notification.tipo}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="truncate" title={notification.mensagem}>
                                {notification.mensagem}
                              </p>
                              {notification.link_destino && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Link: {notification.link_destino}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={notification.lida ? "default" : "destructive"}
                              className={notification.lida ? "bg-green-100 text-green-800" : ""}
                            >
                              {notification.lida ? 'Lida' : 'Não lida'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationManager;
