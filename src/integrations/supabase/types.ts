export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      diagnostico: {
        Row: {
          data: string | null
          id: string
          respostas: Json
          usuario_id: string
        }
        Insert: {
          data?: string | null
          id?: string
          respostas: Json
          usuario_id: string
        }
        Update: {
          data?: string | null
          id?: string
          respostas?: Json
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplina: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      modelo_redacao: {
        Row: {
          created_at: string | null
          exemplo: string
          id: string
          instituicao: string
          tema: string
        }
        Insert: {
          created_at?: string | null
          exemplo: string
          id?: string
          instituicao: string
          tema: string
        }
        Update: {
          created_at?: string | null
          exemplo?: string
          id?: string
          instituicao?: string
          tema?: string
        }
        Relationships: []
      }
      notificacao: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          link_destino: string | null
          mensagem: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          link_destino?: string | null
          mensagem: string
          tipo: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          link_destino?: string | null
          mensagem?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notificacao_usuario"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      pergunta: {
        Row: {
          alternativa_correta: string
          created_at: string | null
          disciplina: string
          enunciado: string
          id: string
          simulado_id: string
        }
        Insert: {
          alternativa_correta: string
          created_at?: string | null
          disciplina: string
          enunciado: string
          id?: string
          simulado_id: string
        }
        Update: {
          alternativa_correta?: string
          created_at?: string | null
          disciplina?: string
          enunciado?: string
          id?: string
          simulado_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pergunta_simulado_id_fkey"
            columns: ["simulado_id"]
            isOneToOne: false
            referencedRelation: "simulado"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_estudo: {
        Row: {
          created_at: string
          id: string
          origem: string
          prioridade: number
          status: string
          tipo: string
          topico_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          origem: string
          prioridade?: number
          status?: string
          tipo: string
          topico_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          origem?: string
          prioridade?: number
          status?: string
          tipo?: string
          topico_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_estudo_topico_id_fkey"
            columns: ["topico_id"]
            isOneToOne: false
            referencedRelation: "topico"
            referencedColumns: ["id"]
          },
        ]
      }
      redacao: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          nota: number | null
          tema: string
          texto: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          nota?: number | null
          tema: string
          texto: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          nota?: number | null
          tema?: string
          texto?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redacao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      resposta: {
        Row: {
          acerto: boolean
          alternativa_marcada: string
          created_at: string | null
          id: string
          pergunta_id: string
          usuario_id: string
        }
        Insert: {
          acerto: boolean
          alternativa_marcada: string
          created_at?: string | null
          id?: string
          pergunta_id: string
          usuario_id: string
        }
        Update: {
          acerto?: boolean
          alternativa_marcada?: string
          created_at?: string | null
          id?: string
          pergunta_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resposta_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "pergunta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resposta_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      simulado: {
        Row: {
          ano: number
          created_at: string | null
          id: string
          instituicao: string
        }
        Insert: {
          ano: number
          created_at?: string | null
          id?: string
          instituicao: string
        }
        Update: {
          ano?: number
          created_at?: string | null
          id?: string
          instituicao?: string
        }
        Relationships: []
      }
      topico: {
        Row: {
          created_at: string | null
          disciplina_id: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          disciplina_id?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          disciplina_id?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "topico_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplina"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuario: {
        Row: {
          created_at: string | null
          diagnostico_preenchido: boolean | null
          email: string
          id: string
          nome: string
          telefone: string
        }
        Insert: {
          created_at?: string | null
          diagnostico_preenchido?: boolean | null
          email: string
          id: string
          nome: string
          telefone: string
        }
        Update: {
          created_at?: string | null
          diagnostico_preenchido?: boolean | null
          email?: string
          id?: string
          nome?: string
          telefone?: string
        }
        Relationships: []
      }
      video: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          titulo: string
          topico_id: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          titulo: string
          topico_id?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          titulo?: string
          topico_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_topico_id_fkey"
            columns: ["topico_id"]
            isOneToOne: false
            referencedRelation: "topico"
            referencedColumns: ["id"]
          },
        ]
      }
      video_assistido: {
        Row: {
          created_at: string | null
          id: string
          usuario_id: string
          video_id: string
          watched_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          usuario_id: string
          video_id: string
          watched_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          usuario_id?: string
          video_id?: string
          watched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_assistido_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_assistido_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
