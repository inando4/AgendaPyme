import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Negocio, Servicio } from '../models/cita';

@Injectable({
  providedIn: 'root'
})
export class NegociosService {
  // Datos mock para negocios
  private mockNegocios: Negocio[] = [
    {
      id: '1', // VERIFICAR que este ID coincida
      nombre: 'Peluquería Bella',
      descripcion: 'Servicios de belleza y cuidado personal con más de 10 años de experiencia',
      categoria: 'Belleza y Cuidado Personal',
      direccion: 'Av. Principal 123, Lima Centro',
      telefono: '987654321',
      email: 'contacto@peluqueriabella.com',
      horarioAtencion: {
        'lunes': { inicio: '09:00', fin: '18:00', activo: true },
        'martes': { inicio: '09:00', fin: '18:00', activo: true },
        'miercoles': { inicio: '09:00', fin: '18:00', activo: true },
        'jueves': { inicio: '09:00', fin: '18:00', activo: true },
        'viernes': { inicio: '09:00', fin: '18:00', activo: true },
        'sabado': { inicio: '09:00', fin: '16:00', activo: true },
        'domingo': { inicio: '10:00', fin: '14:00', activo: false }
      },
      calificacion: 4.8,
      totalResenas: 127 // CAMBIAR: quitar la ñ
    },
    {
      id: '2', // VERIFICAR que este ID coincida
      nombre: 'Clínica Dental Sonrisa',
      descripcion: 'Servicios odontológicos integrales con tecnología de vanguardia',
      categoria: 'Salud y Bienestar',
      direccion: 'Jr. Salud 456, San Isidro',
      telefono: '987654322',
      email: 'citas@clinicasonrisa.com',
      horarioAtencion: {
        'lunes': { inicio: '08:00', fin: '20:00', activo: true },
        'martes': { inicio: '08:00', fin: '20:00', activo: true },
        'miercoles': { inicio: '08:00', fin: '20:00', activo: true },
        'jueves': { inicio: '08:00', fin: '20:00', activo: true },
        'viernes': { inicio: '08:00', fin: '18:00', activo: true },
        'sabado': { inicio: '08:00', fin: '14:00', activo: true },
        'domingo': { inicio: '08:00', fin: '12:00', activo: false }
      },
      calificacion: 4.9,
      totalResenas: 89 // CAMBIAR: quitar la ñ
    },
    {
      id: '3', // VERIFICAR que este ID coincida
      nombre: 'Spa Relax & Wellness',
      descripcion: 'Centro de relajación y bienestar con tratamientos personalizados',
      categoria: 'Salud y Bienestar',
      direccion: 'Av. Bienestar 789, Miraflores',
      telefono: '987654323',
      email: 'reservas@sparelax.com',
      horarioAtencion: {
        'lunes': { inicio: '10:00', fin: '21:00', activo: true },
        'martes': { inicio: '10:00', fin: '21:00', activo: true },
        'miercoles': { inicio: '10:00', fin: '21:00', activo: true },
        'jueves': { inicio: '10:00', fin: '21:00', activo: true },
        'viernes': { inicio: '10:00', fin: '21:00', activo: true },
        'sabado': { inicio: '09:00', fin: '20:00', activo: true },
        'domingo': { inicio: '10:00', fin: '18:00', activo: true }
      },
      calificacion: 4.7,
      totalResenas: 203 // CAMBIAR: quitar la ñ
    }
  ];

  private mockServicios: Servicio[] = [
    // Servicios de Peluquería Bella (negocio '1')
    {
      id: '1',
      negocioId: '1',
      nombre: 'Corte y Peinado',
      descripcion: 'Corte de cabello profesional con peinado incluido',
      precio: 25.00,
      duracion: 60,
      categoria: 'Corte',
      activo: true
    },
    {
      id: '3',
      negocioId: '1',
      nombre: 'Manicure',
      descripcion: 'Cuidado completo de uñas y cutículas',
      precio: 15.00,
      duracion: 45,
      categoria: 'Belleza',
      activo: true
    },
    {
      id: '4',
      negocioId: '1',
      nombre: 'Tinte de Cabello',
      descripcion: 'Tinte completo con productos de calidad',
      precio: 40.00,
      duracion: 90,
      categoria: 'Coloración',
      activo: true
    },
    {
      id: '5',
      negocioId: '1',
      nombre: 'Pedicure',
      descripcion: 'Cuidado completo de pies y uñas',
      precio: 18.00,
      duracion: 50,
      categoria: 'Belleza',
      activo: true
    },
    
    // Servicios de Clínica Dental Sonrisa (negocio '2')
    {
      id: '2',
      negocioId: '2',
      nombre: 'Limpieza Dental',
      descripcion: 'Limpieza profunda y revisión dental completa',
      precio: 80.00,
      duracion: 90,
      categoria: 'Preventivo',
      activo: true
    },
    {
      id: '6',
      negocioId: '2',
      nombre: 'Consulta General',
      descripcion: 'Evaluación dental general y diagnóstico',
      precio: 50.00,
      duracion: 45,
      categoria: 'Consulta',
      activo: true
    },
    {
      id: '7',
      negocioId: '2',
      nombre: 'Blanqueamiento Dental',
      descripcion: 'Tratamiento de blanqueamiento profesional',
      precio: 150.00,
      duracion: 120,
      categoria: 'Estético',
      activo: true
    },
    
    // Servicios de Spa Relax & Wellness (negocio '3')
    {
      id: '8',
      negocioId: '3',
      nombre: 'Masaje Relajante',
      descripcion: 'Masaje terapéutico de cuerpo completo',
      precio: 60.00,
      duracion: 60,
      categoria: 'Masajes',
      activo: true
    },
    {
      id: '9',
      negocioId: '3',
      nombre: 'Facial Antienvejecimiento',
      descripcion: 'Tratamiento facial con productos premium',
      precio: 85.00,
      duracion: 75,
      categoria: 'Faciales',
      activo: true
    },
    {
      id: '10',
      negocioId: '3',
      nombre: 'Aromaterapia',
      descripcion: 'Sesión de relajación con aceites esenciales',
      precio: 45.00,
      duracion: 45,
      categoria: 'Relajación',
      activo: true
    }
  ];

  constructor() { }

  getAllNegocios(): Observable<Negocio[]> {
    return of(this.mockNegocios);
  }

  getNegocioById(id: string): Observable<Negocio | undefined> {
    const negocio = this.mockNegocios.find(n => n.id === id);
    return of(negocio);
  }

  buscarNegocios(termino: string, categoria?: string): Observable<Negocio[]> {
    let resultados = this.mockNegocios;

    if (termino) {
      resultados = resultados.filter(negocio => 
        negocio.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        negocio.descripcion.toLowerCase().includes(termino.toLowerCase())
      );
    }

    if (categoria) {
      resultados = resultados.filter(negocio => negocio.categoria === categoria);
    }

    return of(resultados);
  }

  getServiciosByNegocio(negocioId: string): Observable<Servicio[]> {
    const servicios = this.mockServicios.filter(s => s.negocioId === negocioId);
    return of(servicios);
  }

  getCategorias(): Observable<string[]> {
    const categorias = [...new Set(this.mockNegocios.map(n => n.categoria))];
    return of(categorias);
  }
}