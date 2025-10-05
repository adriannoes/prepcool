
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
import { Bell, Send, Users, User, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  // Form state
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [notificationType, setNotificationType] = useState('manual');
  const [message, setMessage] = useState('');
  const [linkDestino, setLinkDestino] = useState('');
  const [sendToAll, setSendToAll] = useState(false);

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
      console.error('Error fetching users:', error);
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
      console.error('Error fetching notifications:', error);
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
    if (!message.trim()) {
      toast({
        title: 'Erro',
        description: 'A mensagem é obrigatória.',
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

    setIsSending(true);

    try {
      if (sendToAll) {
        // Enviar para todos os usuários
        const notifications = usuarios.map(user => ({
          usuario_id: user.id,
          tipo: notificationType,
          mensagem: message,
          link_destino: linkDestino || null
        }));

        const { error } = await supabase
          .from('notificacao')
          .insert(notifications);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: `Notificação enviada para ${usuarios.length} usuários.`
        });
      } else {
        // Enviar para usuário específico
        const { error } = await supabase
          .from('notificacao')
          .insert({
            usuario_id: selectedUser,
            tipo: notificationType,
            mensagem: message,
            link_destino: linkDestino || null
          });

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Notificação enviada com sucesso.'
        });
      }

      // Reset form
      setSelectedUser('');
      setMessage('');
      setLinkDestino('');
      setSendToAll(false);
      
      // Refresh notifications list
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
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
                  placeholder="Digite a mensagem da notificação..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link de Destino (Opcional)</Label>
                <Input
                  id="link"
                  type="text"
                  placeholder="/dashboard, /simulados, etc..."
                  value={linkDestino}
                  onChange={(e) => setLinkDestino(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSendNotification}
                disabled={isSending}
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
