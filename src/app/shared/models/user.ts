export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  tipo: 'cliente' | 'negocio';
  fechaRegistro: Date;
}

export interface UserCliente extends User {
  tipo: 'cliente';
}

export interface UserNegocio extends User {
  tipo: 'negocio';
  nombreNegocio: string;
  descripcion: string;
  direccion: string;
  categoria: string;
  planSuscripcion: 'gratuito' | 'basico' | 'premium';
}

export interface LoginRequest {
  email: string;
  password: string;
  tipo: 'cliente' | 'negocio';
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  tipo: 'cliente' | 'negocio';
  // Campos adicionales para negocio
  nombreNegocio?: string;
  descripcion?: string;
  direccion?: string;
  categoria?: string;
}
