
export type Role = 'admin' | 'negocio';

export interface Usuario {
  id: string;
  rol: Role;
  usuario: string;
  contrasena: string;
  creado_en: string;
}

export interface SolicitudNegocio {
  id: string;
  nombre_negocio: string;
  nombre_contacto: string;
  telefono: string;
  correo: string;
  slug: string;
  estado: 'pendiente' | 'aceptado' | 'rechazado';
  mensaje_opcional: string;
  creada_en: string;
  usuario: string;
  contrasena: string;
}

export interface Negocio {
  id: string;
  usuario_id: string;
  nombre: string;
  slug: string;
  creado_en: string;
}

export interface Servicio {
  id: string;
  negocio_id: string;
  nombre: string;
  duracion_minutos: number;
  activo: boolean;
}

export interface HorarioRecurrente {
  id: string;
  negocio_id: string;
  dia_semana: 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';
  hora_inicio: string;
  hora_fin: string;
}

export interface HoraBloqueada {
  id: string;
  negocio_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo?: string;
}

export interface Cita {
  id: string;
  negocio_id: string;
  nombre_cliente: string;
  telefono_cliente: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  creada_en: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  usuario: Usuario | null;
  negocio: Negocio | null;
}
