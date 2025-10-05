
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: { nome: string, telefone: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 AuthContext: Initializing');
    
    // Configurar listener primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('🔔 AuthContext: Auth state change', { 
          event, 
          hasSession: !!currentSession,
          userEmail: currentSession?.user?.email 
        });
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Definir loading como false apenas quando temos uma mudança de estado
        if (loading) {
          setLoading(false);
        }
        
        if (event === 'SIGNED_IN') {
          console.log('🚀 AuthContext: User signed in, redirecting to dashboard');
          navigate('/dashboard');
        }
      }
    );

    // Verificar sessão existente
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('📱 AuthContext: Initial session check', { 
          hasSession: !!initialSession,
          userEmail: initialSession?.user?.email 
        });
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
        setLoading(false);
      } catch (error) {
        console.error('❌ AuthContext: Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signUp = async (email: string, password: string, metadata: { nome: string, telefone: string }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: metadata.nome,
            telefone: metadata.telefone
          }
        }
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Cadastro criado com sucesso!",
        description: "Faça login para começar.",
      });
      
      // Redirect to login instead of dashboard
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao criar sua conta. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta à PrepCool!",
      });
      
      // Navigation will be handled by onAuthStateChange
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas. Por favor, verifique seu e-mail e senha.",
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você saiu da sua conta. Até breve!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao sair da sua conta.",
        variant: "destructive"
      });
    }
  };

  console.log('🎯 AuthContext: Current state', { 
    hasUser: !!user,
    userEmail: user?.email,
    loading 
  });

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
