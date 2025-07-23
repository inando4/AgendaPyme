export interface Cita {
  id: string;
  clienteId: string;
  negocioId: string;
  servicioId: string;
  fecha: Date;
  hora: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  notas?: string;
  precio: number;
  duracion: number; // en minutos
}

export interface Servicio {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number; // en minutos
  categoria: string;
  activo: boolean;
}

export interface Negocio {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  direccion: string;
  telefono: string;
  email: string;
  horarioAtencion: {
    [key: string]: { inicio: string; fin: string; activo: boolean };
  };
  calificacion: number;
  totalResenas: number; // CAMBIAR: quitar la ñ
  imagen?: string;
}