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
      bloqueos_temporales: {
        Row: {
          creado_en: string | null
          expira_en: string
          fecha: string
          hora_fin: string
          hora_inicio: string
          id: string
          negocio_id: string | null
        }
        Insert: {
          creado_en?: string | null
          expira_en: string
          fecha: string
          hora_fin: string
          hora_inicio: string
          id?: string
          negocio_id?: string | null
        }
        Update: {
          creado_en?: string | null
          expira_en?: string
          fecha?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          negocio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bloqueos_temporales_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      citas: {
        Row: {
          creada_en: string | null
          estado: string | null
          fecha: string
          hora_fin: string
          hora_inicio: string
          id: string
          negocio_id: string | null
          nombre_cliente: string
          servicio_id: string | null
          telefono_cliente: string
        }
        Insert: {
          creada_en?: string | null
          estado?: string | null
          fecha: string
          hora_fin: string
          hora_inicio: string
          id?: string
          negocio_id?: string | null
          nombre_cliente: string
          servicio_id?: string | null
          telefono_cliente: string
        }
        Update: {
          creada_en?: string | null
          estado?: string | null
          fecha?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          negocio_id?: string | null
          nombre_cliente?: string
          servicio_id?: string | null
          telefono_cliente?: string
        }
        Relationships: [
          {
            foreignKeyName: "citas_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citas_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          creado_en: string | null
          email: string | null
          id: string
          negocio_id: string | null
          nombre: string
          num_citas: number | null
          telefono: string
          ultima_cita: string | null
        }
        Insert: {
          creado_en?: string | null
          email?: string | null
          id?: string
          negocio_id?: string | null
          nombre: string
          num_citas?: number | null
          telefono: string
          ultima_cita?: string | null
        }
        Update: {
          creado_en?: string | null
          email?: string | null
          id?: string
          negocio_id?: string | null
          nombre?: string
          num_citas?: number | null
          telefono?: string
          ultima_cita?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_recurrentes: {
        Row: {
          dia_semana: string
          hora_fin: string
          hora_inicio: string
          id: string
          negocio_id: string | null
        }
        Insert: {
          dia_semana: string
          hora_fin: string
          hora_inicio: string
          id?: string
          negocio_id?: string | null
        }
        Update: {
          dia_semana?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          negocio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "horarios_recurrentes_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      horas_bloqueadas: {
        Row: {
          fecha: string
          hora_fin: string
          hora_inicio: string
          id: string
          negocio_id: string | null
        }
        Insert: {
          fecha: string
          hora_fin: string
          hora_inicio: string
          id?: string
          negocio_id?: string | null
        }
        Update: {
          fecha?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          negocio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "horas_bloqueadas_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      negocios: {
        Row: {
          creado_en: string | null
          id: string
          nombre: string
          slug: string
          usuario_id: string | null
        }
        Insert: {
          creado_en?: string | null
          id?: string
          nombre: string
          slug: string
          usuario_id?: string | null
        }
        Update: {
          creado_en?: string | null
          id?: string
          nombre?: string
          slug?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "negocios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios: {
        Row: {
          activo: boolean | null
          duracion_minutos: number
          id: string
          negocio_id: string | null
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          duracion_minutos: number
          id?: string
          negocio_id?: string | null
          nombre: string
        }
        Update: {
          activo?: boolean | null
          duracion_minutos?: number
          id?: string
          negocio_id?: string | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicios_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitudes_negocio: {
        Row: {
          contrasena: string | null
          correo: string
          creada_en: string | null
          estado: string | null
          id: string
          mensaje_opcional: string | null
          nombre_contacto: string
          nombre_negocio: string
          slug: string
          telefono: string
          usuario: string | null
          usuario_id: string | null
        }
        Insert: {
          contrasena?: string | null
          correo: string
          creada_en?: string | null
          estado?: string | null
          id?: string
          mensaje_opcional?: string | null
          nombre_contacto: string
          nombre_negocio: string
          slug: string
          telefono: string
          usuario?: string | null
          usuario_id?: string | null
        }
        Update: {
          contrasena?: string | null
          correo?: string
          creada_en?: string | null
          estado?: string | null
          id?: string
          mensaje_opcional?: string | null
          nombre_contacto?: string
          nombre_negocio?: string
          slug?: string
          telefono?: string
          usuario?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          contrasena: string
          creado_en: string | null
          id: string
          rol: string
          usuario: string
        }
        Insert: {
          contrasena: string
          creado_en?: string | null
          id?: string
          rol: string
          usuario: string
        }
        Update: {
          contrasena?: string
          creado_en?: string | null
          id?: string
          rol?: string
          usuario?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_login: {
        Args: {
          p_username: string
          p_password: string
        }
        Returns: Json
      }
      eliminar_bloqueos_expirados: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_business_by_user_id: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      get_citas_hoy: {
        Args: {
          p_negocio_id: string
        }
        Returns: {
          id: string
          nombre_cliente: string
          telefono_cliente: string
          servicio_nombre: string
          servicio_duracion: number
          fecha: string
          hora_inicio: string
          hora_fin: string
          estado: string
        }[]
      }
      get_citas_pendientes: {
        Args: {
          p_negocio_id: string
        }
        Returns: {
          id: string
          nombre_cliente: string
          telefono_cliente: string
          servicio_nombre: string
          fecha: string
          hora_inicio: string
          hora_fin: string
          estado: string
        }[]
      }
      get_estadisticas_negocio: {
        Args: {
          p_negocio_id: string
        }
        Returns: Json
      }
      update_negocio_profile: {
        Args: {
          p_negocio_id: string
          p_nombre: string
          p_descripcion: string
          p_direccion: string
          p_telefono: string
          p_correo: string
          p_sitio_web: string
        }
        Returns: {
          creado_en: string | null
          id: string
          nombre: string
          slug: string
          usuario_id: string | null
        }[]
      }
      verificar_disponibilidad: {
        Args: {
          p_negocio_id: string
          p_fecha: string
          p_hora_inicio: string
          p_hora_fin: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
