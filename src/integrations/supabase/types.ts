export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audience_members: {
        Row: {
          age_range: string | null
          beliefs: string[] | null
          created_at: string
          description: string | null
          desires: string[] | null
          emotional_state: string | null
          gender: string | null
          id: string
          name: string
          needs: string[] | null
          occupation: string | null
          pain_points: string[] | null
          quote: string | null
          triggers: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age_range?: string | null
          beliefs?: string[] | null
          created_at?: string
          description?: string | null
          desires?: string[] | null
          emotional_state?: string | null
          gender?: string | null
          id?: string
          name: string
          needs?: string[] | null
          occupation?: string | null
          pain_points?: string[] | null
          quote?: string | null
          triggers?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age_range?: string | null
          beliefs?: string[] | null
          created_at?: string
          description?: string | null
          desires?: string[] | null
          emotional_state?: string | null
          gender?: string | null
          id?: string
          name?: string
          needs?: string[] | null
          occupation?: string | null
          pain_points?: string[] | null
          quote?: string | null
          triggers?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      brand_assets: {
        Row: {
          created_at: string
          id: string
          label: string
          type: string
          updated_at: string
          user_id: string | null
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          type: string
          updated_at?: string
          user_id?: string | null
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          type?: string
          updated_at?: string
          user_id?: string | null
          value?: string
        }
        Relationships: []
      }
      content_assets: {
        Row: {
          approved_at: string | null
          caption: string | null
          created_at: string | null
          episode_id: string | null
          hashtags: string | null
          id: string
          image_url: string | null
          piece_id: number
          piece_name: string
          prompt_used: string | null
          published_at: string | null
          status: string | null
          template_id: string | null
          updated_at: string | null
          user_id: string
          variant_name: string | null
        }
        Insert: {
          approved_at?: string | null
          caption?: string | null
          created_at?: string | null
          episode_id?: string | null
          hashtags?: string | null
          id?: string
          image_url?: string | null
          piece_id: number
          piece_name: string
          prompt_used?: string | null
          published_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id: string
          variant_name?: string | null
        }
        Update: {
          approved_at?: string | null
          caption?: string | null
          created_at?: string | null
          episode_id?: string | null
          hashtags?: string | null
          id?: string
          image_url?: string | null
          piece_id?: number
          piece_name?: string
          prompt_used?: string | null
          published_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_assets_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_templates: {
        Row: {
          body: string | null
          closing: string | null
          created_at: string
          cta: string | null
          hook: string | null
          id: string
          structure: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          closing?: string | null
          created_at?: string
          cta?: string | null
          hook?: string | null
          id?: string
          structure?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          closing?: string | null
          created_at?: string
          cta?: string | null
          hook?: string | null
          id?: string
          structure?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      episodes: {
        Row: {
          block_states: Json | null
          checklist_assets_json: Json | null
          checklist_qa_json: Json | null
          conflicto: boolean | null
          conflicto_central: string | null
          conflicto_detectado: boolean | null
          conflicto_nota: string | null
          core_thesis: string | null
          cover_image_url: string | null
          created_at: string
          cta: string | null
          derived_copies_json: Json | null
          descripcion_spotify: string | null
          distribution_status: string | null
          duration: string | null
          editing_status: string | null
          estado_produccion: string | null
          estado_publicacion: string | null
          estado_validacion: string | null
          fecha_es_estimada: boolean | null
          final_title: string | null
          generation_metadata: Json | null
          health_score: number | null
          hook: string | null
          id: string
          idea_principal: string | null
          intencion_del_episodio: string | null
          link_spotify: string | null
          nivel_completitud: string | null
          nota_trazabilidad: string | null
          number: string | null
          prompt_set_json: Json | null
          publication_blockers_json: Json | null
          quote: string | null
          ready_for_production: boolean | null
          ready_for_publish: boolean | null
          recording_status: string | null
          release_date: string | null
          restricciones: string | null
          retencion_q1: number | null
          retencion_q2: number | null
          retencion_q3: number | null
          retencion_q4: number | null
          script_base: string | null
          script_generated: string | null
          script_status: string | null
          status: string | null
          streams_total: number | null
          summary: string | null
          tags: string[] | null
          template_id: string | null
          theme: string | null
          title: string
          titulo_original: string | null
          tono: string | null
          updated_at: string
          user_id: string | null
          version_history: Json | null
          visual_preset_id: string | null
          working_title: string | null
        }
        Insert: {
          block_states?: Json | null
          checklist_assets_json?: Json | null
          checklist_qa_json?: Json | null
          conflicto?: boolean | null
          conflicto_central?: string | null
          conflicto_detectado?: boolean | null
          conflicto_nota?: string | null
          core_thesis?: string | null
          cover_image_url?: string | null
          created_at?: string
          cta?: string | null
          derived_copies_json?: Json | null
          descripcion_spotify?: string | null
          distribution_status?: string | null
          duration?: string | null
          editing_status?: string | null
          estado_produccion?: string | null
          estado_publicacion?: string | null
          estado_validacion?: string | null
          fecha_es_estimada?: boolean | null
          final_title?: string | null
          generation_metadata?: Json | null
          health_score?: number | null
          hook?: string | null
          id?: string
          idea_principal?: string | null
          intencion_del_episodio?: string | null
          link_spotify?: string | null
          nivel_completitud?: string | null
          nota_trazabilidad?: string | null
          number?: string | null
          prompt_set_json?: Json | null
          publication_blockers_json?: Json | null
          quote?: string | null
          ready_for_production?: boolean | null
          ready_for_publish?: boolean | null
          recording_status?: string | null
          release_date?: string | null
          restricciones?: string | null
          retencion_q1?: number | null
          retencion_q2?: number | null
          retencion_q3?: number | null
          retencion_q4?: number | null
          script_base?: string | null
          script_generated?: string | null
          script_status?: string | null
          status?: string | null
          streams_total?: number | null
          summary?: string | null
          tags?: string[] | null
          template_id?: string | null
          theme?: string | null
          title: string
          titulo_original?: string | null
          tono?: string | null
          updated_at?: string
          user_id?: string | null
          version_history?: Json | null
          visual_preset_id?: string | null
          working_title?: string | null
        }
        Update: {
          block_states?: Json | null
          checklist_assets_json?: Json | null
          checklist_qa_json?: Json | null
          conflicto?: boolean | null
          conflicto_central?: string | null
          conflicto_detectado?: boolean | null
          conflicto_nota?: string | null
          core_thesis?: string | null
          cover_image_url?: string | null
          created_at?: string
          cta?: string | null
          derived_copies_json?: Json | null
          descripcion_spotify?: string | null
          distribution_status?: string | null
          duration?: string | null
          editing_status?: string | null
          estado_produccion?: string | null
          estado_publicacion?: string | null
          estado_validacion?: string | null
          fecha_es_estimada?: boolean | null
          final_title?: string | null
          generation_metadata?: Json | null
          health_score?: number | null
          hook?: string | null
          id?: string
          idea_principal?: string | null
          intencion_del_episodio?: string | null
          link_spotify?: string | null
          nivel_completitud?: string | null
          nota_trazabilidad?: string | null
          number?: string | null
          prompt_set_json?: Json | null
          publication_blockers_json?: Json | null
          quote?: string | null
          ready_for_production?: boolean | null
          ready_for_publish?: boolean | null
          recording_status?: string | null
          release_date?: string | null
          restricciones?: string | null
          retencion_q1?: number | null
          retencion_q2?: number | null
          retencion_q3?: number | null
          retencion_q4?: number | null
          script_base?: string | null
          script_generated?: string | null
          script_status?: string | null
          status?: string | null
          streams_total?: number | null
          summary?: string | null
          tags?: string[] | null
          template_id?: string | null
          theme?: string | null
          title?: string
          titulo_original?: string | null
          tono?: string | null
          updated_at?: string
          user_id?: string | null
          version_history?: Json | null
          visual_preset_id?: string | null
          working_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_episodes_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "episode_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_history: {
        Row: {
          created_at: string
          id: string
          prompt: string | null
          result: string | null
          status: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          prompt?: string | null
          result?: string | null
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string | null
          result?: string | null
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          bio: string | null
          contact: string | null
          created_at: string
          id: string
          name: string
          role: string | null
          status: string | null
          topics: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          name: string
          role?: string | null
          status?: string | null
          topics?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string | null
          status?: string | null
          topics?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_blocks: {
        Row: {
          content: string | null
          content_type: string
          created_at: string
          destination_module: string
          id: string
          import_status: string
          imported_at: string | null
          last_synced_at: string | null
          source_document: string
          source_hash: string | null
          source_section: string | null
          source_subsection: string | null
          structured_data: Json | null
          target_record_id: string | null
          target_table: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          content_type: string
          created_at?: string
          destination_module: string
          id?: string
          import_status?: string
          imported_at?: string | null
          last_synced_at?: string | null
          source_document?: string
          source_hash?: string | null
          source_section?: string | null
          source_subsection?: string | null
          structured_data?: Json | null
          target_record_id?: string | null
          target_table?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          content_type?: string
          created_at?: string
          destination_module?: string
          id?: string
          import_status?: string
          imported_at?: string | null
          last_synced_at?: string | null
          source_document?: string
          source_hash?: string | null
          source_section?: string | null
          source_subsection?: string | null
          structured_data?: Json | null
          target_record_id?: string | null
          target_table?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentions: {
        Row: {
          context: string | null
          created_at: string
          date: string | null
          id: string
          link: string | null
          name: string | null
          platform: string | null
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          date?: string | null
          id?: string
          link?: string | null
          name?: string | null
          platform?: string | null
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string
          date?: string | null
          id?: string
          link?: string | null
          name?: string | null
          platform?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      metrics: {
        Row: {
          created_at: string
          date: string | null
          episode_id: string | null
          id: string
          metric_group: string | null
          name: string | null
          notes: string | null
          source: string | null
          source_file_name: string | null
          source_import_batch: string | null
          unit: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          episode_id?: string | null
          id?: string
          metric_group?: string | null
          name?: string | null
          notes?: string | null
          source?: string | null
          source_file_name?: string | null
          source_import_batch?: string | null
          unit?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          date?: string | null
          episode_id?: string | null
          id?: string
          metric_group?: string | null
          name?: string | null
          notes?: string | null
          source?: string | null
          source_file_name?: string | null
          source_import_batch?: string | null
          unit?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          episode_id: string | null
          id: string
          link: string | null
          status: string | null
          title: string | null
          type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          episode_id?: string | null
          id?: string
          link?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          episode_id?: string | null
          id?: string
          link?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          blocking: boolean | null
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          episode_id: string | null
          id: string
          priority: string | null
          sort_order: number | null
          status: string | null
          task_type: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          blocking?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          episode_id?: string | null
          id?: string
          priority?: string | null
          sort_order?: number | null
          status?: string | null
          task_type?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          blocking?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          episode_id?: string | null
          id?: string
          priority?: string | null
          sort_order?: number | null
          status?: string | null
          task_type?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
