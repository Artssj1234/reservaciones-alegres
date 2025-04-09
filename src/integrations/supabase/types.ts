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
          {
            foreignKeyName: "citas_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "vista_bloques_disponibles"
            referencedColumns: ["servicio_id"]
          },
          {
            foreignKeyName: "citas_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "vista_bloques_disponibles_libres"
            referencedColumns: ["servicio_id"]
          },
          {
            foreignKeyName: "citas_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "vista_disponibilidad_negocios"
            referencedColumns: ["servicio_id"]
          },
          {
            foreignKeyName: "citas_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "vista_horarios_disponibles"
            referencedColumns: ["servicio_id"]
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
          dia_semana: number | null
          hora_fin: string
          hora_inicio: string
          id: string
          negocio_id: string | null
        }
        Insert: {
          dia_semana?: number | null
          hora_fin: string
          hora_inicio: string
          id?: string
          negocio_id?: string | null
        }
        Update: {
          dia_semana?: number | null
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
          creado_en: string | null
          fecha: string
          hora_fin: string
          hora_inicio: string
          id: string
          motivo: string | null
          negocio_id: string | null
        }
        Insert: {
          creado_en?: string | null
          fecha: string
          hora_fin: string
          hora_inicio: string
          id?: string
          motivo?: string | null
          negocio_id?: string | null
        }
        Update: {
          creado_en?: string | null
          fecha?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          motivo?: string | null
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
          correo: string | null
          creado_en: string | null
          descripcion: string | null
          direccion: string | null
          id: string
          nombre: string
          sitio_web: string | null
          slug: string
          telefono: string | null
          usuario_id: string | null
        }
        Insert: {
          correo?: string | null
          creado_en?: string | null
          descripcion?: string | null
          direccion?: string | null
          id?: string
          nombre: string
          sitio_web?: string | null
          slug: string
          telefono?: string | null
          usuario_id?: string | null
        }
        Update: {
          correo?: string | null
          creado_en?: string | null
          descripcion?: string | null
          direccion?: string | null
          id?: string
          nombre?: string
          sitio_web?: string | null
          slug?: string
          telefono?: string | null
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
          descripcion: string | null
          duracion_minutos: number
          id: string
          negocio_id: string | null
          nombre: string
          precio: number | null
        }
        Insert: {
          activo?: boolean | null
          descripcion?: string | null
          duracion_minutos: number
          id?: string
          negocio_id?: string | null
          nombre: string
          precio?: number | null
        }
        Update: {
          activo?: boolean | null
          descripcion?: string | null
          duracion_minutos?: number
          id?: string
          negocio_id?: string | null
          nombre?: string
          precio?: number | null
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
      vista_bloques_disponibles: {
        Row: {
          fecha: string | null
          fin_bloque: string | null
          inicio_bloque: string | null
          negocio_id: string | null
          servicio_id: string | null
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
      vista_bloques_disponibles_libres: {
        Row: {
          fecha: string | null
          fin_bloque: string | null
          inicio_bloque: string | null
          negocio_id: string | null
          servicio_id: string | null
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
      vista_disponibilidad_negocios: {
        Row: {
          dia_semana: number | null
          fin_bloque: string | null
          inicio_bloque: string | null
          negocio_id: string | null
          nombre_servicio: string | null
          servicio_id: string | null
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
      vista_horarios_disponibles: {
        Row: {
          dia_semana: number | null
          duracion_minutos: number | null
          hora_fin: string | null
          hora_inicio: string | null
          negocio_id: string | null
          servicio_id: string | null
          servicio_nombre: string | null
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
    }
    Functions: {
      custom_login: {
        Args: { p_username: string; p_password: string }
        Returns: Json
      }
      eliminar_bloqueos_expirados: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      execute_sql: {
        Args: { query: string }
        Returns: Json
      }
      get_bloques_disponibles: {
        Args: { p_negocio_id: string; p_servicio_id: string; p_fecha: string }
        Returns: {
          inicio_bloque: string
          fin_bloque: string
        }[]
      }
      get_business_by_user_id: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_citas_hoy: {
        Args: { p_negocio_id: string }
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
        Args: { p_negocio_id: string }
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
      get_dias_con_disponibilidad: {
        Args: {
          p_negocio_id: string
          p_servicio_id: string
          p_anio: number
          p_mes: number
        }
        Returns: {
          fecha: string
        }[]
      }
      get_estadisticas_negocio: {
        Args: { p_negocio_id: string }
        Returns: Json
      }
      obtener_dias_disponibles: {
        Args: {
          p_negocio_id: string
          p_servicio_id: string
          p_anio: number
          p_mes: number
        }
        Returns: {
          dia: number
        }[]
      }
      obtener_dias_disponibles_mes: {
        Args: {
          p_negocio_id: string
          p_servicio_id: string
          p_anio: string
          p_mes: string
        }
        Returns: {
          dia_disponible: string
        }[]
      }
      obtener_horarios_disponibles: {
        Args: { p_negocio_id: string; p_servicio_id: string; p_fecha: string }
        Returns: {
          inicio_bloque: string
          fin_bloque: string
        }[]
      }
      obtener_horas_disponibles: {
        Args: { p_negocio_id: string; p_servicio_id: string; p_fecha: string }
        Returns: {
          inicio_bloque: string
          fin_bloque: string
        }[]
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
          correo: string | null
          creado_en: string | null
          descripcion: string | null
          direccion: string | null
          id: string
          nombre: string
          sitio_web: string | null
          slug: string
          telefono: string | null
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
    Enums: {},
  },
} as const
