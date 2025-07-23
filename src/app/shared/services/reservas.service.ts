import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita, Servicio, Negocio } from '../models/cita';
import { CitasService } from './citas.service'; // AGREGAR IMPORT
import { NegocioDashboardService } from './negocio-dashboard.service'; // AGREGAR IMPORT

export interface HorarioDisponible {
  hora: string;
  disponible: boolean;
  precio: number;
  duracion: number;
}

export interface ReservaRequest {
  clienteId: string;
  negocioId: string;
  servicioId: string;
  fecha: Date;
  hora: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private reservasSubject = new BehaviorSubject<Cita[]>([]);
  public reservas$ = this.reservasSubject.asObservable();

  // INYECTAR CitasService
  private citasService = inject(CitasService);
  private negocioDashboardService = inject(NegocioDashboardService); // INYECTAR

  // Horarios de trabajo (se puede personalizar por negocio)
  private horariosTrabajo = {
    inicio: '08:00',
    fin: '20:00',
    intervalos: 30 // minutos
  };

  // Días de la semana
  private diasSemana = [
    'domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'
  ];

  constructor() {}

  // CORREGIR ESTE MÉTODO
  getHorariosDisponibles(
    negocioId: string, 
    servicioId: string, 
    fecha: Date
  ): Observable<HorarioDisponible[]> {
    // Convertir Promise a Observable usando 'from'
    return from(
      new Promise<HorarioDisponible[]>((resolve) => {
        setTimeout(() => {
          const horarios = this.generarHorarios(negocioId, servicioId, fecha);
          resolve(horarios);
        }, 500);
      })
    );
  }

  private generarHorarios(
    negocioId: string, 
    servicioId: string, 
    fecha: Date
  ): HorarioDisponible[] {
    const horarios: HorarioDisponible[] = [];
    const diaSemana = this.diasSemana[fecha.getDay()];
    
    // Obtener horario del negocio (mock)
    const horarioNegocio = this.getHorarioNegocio(negocioId, diaSemana);
    if (!horarioNegocio.activo) {
      return horarios; // Negocio cerrado
    }

    // Obtener servicio info (mock)
    const servicio = this.getServicioInfo(servicioId);
    if (!servicio) {
      return horarios;
    }

    // Generar slots de tiempo
    const inicio = this.parseTime(horarioNegocio.inicio);
    const fin = this.parseTime(horarioNegocio.fin);
    const duracionServicio = servicio.duracion;
    
    for (let tiempo = inicio; tiempo + duracionServicio <= fin; tiempo += this.horariosTrabajo.intervalos) {
      const horaStr = this.formatTime(tiempo);
      const disponible = this.isHorarioDisponible(negocioId, fecha, horaStr, duracionServicio);
      
      horarios.push({
        hora: horaStr,
        disponible,
        precio: servicio.precio,
        duracion: servicio.duracion
      });
    }

    return horarios;
  }

  private getHorarioNegocio(negocioId: string, dia: string) {
    const horariosMock: any = {
      '1': {
        'lunes': { inicio: '09:00', fin: '18:00', activo: true },
        'martes': { inicio: '09:00', fin: '18:00', activo: true },
        'miercoles': { inicio: '09:00', fin: '18:00', activo: true },
        'jueves': { inicio: '09:00', fin: '18:00', activo: true },
        'viernes': { inicio: '09:00', fin: '18:00', activo: true },
        'sabado': { inicio: '09:00', fin: '16:00', activo: true },
        'domingo': { inicio: '10:00', fin: '14:00', activo: false }
      },
      '2': {
        'lunes': { inicio: '08:00', fin: '20:00', activo: true },
        'martes': { inicio: '08:00', fin: '20:00', activo: true },
        'miercoles': { inicio: '08:00', fin: '20:00', activo: true },
        'jueves': { inicio: '08:00', fin: '20:00', activo: true },
        'viernes': { inicio: '08:00', fin: '18:00', activo: true },
        'sabado': { inicio: '08:00', fin: '14:00', activo: true },
        'domingo': { inicio: '08:00', fin: '12:00', activo: false }
      },
      '3': {
        'lunes': { inicio: '10:00', fin: '21:00', activo: true },
        'martes': { inicio: '10:00', fin: '21:00', activo: true },
        'miercoles': { inicio: '10:00', fin: '21:00', activo: true },
        'jueves': { inicio: '10:00', fin: '21:00', activo: true },
        'viernes': { inicio: '10:00', fin: '21:00', activo: true },
        'sabado': { inicio: '09:00', fin: '20:00', activo: true },
        'domingo': { inicio: '10:00', fin: '18:00', activo: true }
      }
    };

    return horariosMock[negocioId]?.[dia] || { inicio: '09:00', fin: '18:00', activo: false };
  }

  private getServicioInfo(servicioId: string) {
    // Mock - ACTUALIZADO para coincidir con todos los servicios
    const serviciosMock: any = {
      // Peluquería Bella
      '1': { precio: 25, duracion: 60 },   // Corte y Peinado
      '3': { precio: 15, duracion: 45 },   // Manicure
      '4': { precio: 40, duracion: 90 },   // Tinte de Cabello
      '5': { precio: 18, duracion: 50 },   // Pedicure
      
      // Clínica Dental
      '2': { precio: 80, duracion: 90 },   // Limpieza Dental
      '6': { precio: 50, duracion: 45 },   // Consulta General
      '7': { precio: 150, duracion: 120 }, // Blanqueamiento
      
      // Spa Relax & Wellness
      '8': { precio: 60, duracion: 60 },   // Masaje Relajante
      '9': { precio: 85, duracion: 75 },   // Facial
      '10': { precio: 45, duracion: 45 }   // Aromaterapia
    };

    return serviciosMock[servicioId];
  }

  private isHorarioDisponible(
    negocioId: string, 
    fecha: Date, 
    hora: string, 
    duracion: number
  ): boolean {
    // Verificar si no hay conflictos con citas existentes
    // Mock - en producción verificaría contra la base de datos
    
    const fechaStr = fecha.toISOString().split('T')[0];
    const citasExistentes = this.getCitasExistentes(negocioId, fechaStr);
    
    const inicioReserva = this.parseTime(hora);
    const finReserva = inicioReserva + duracion;
    
    return !citasExistentes.some(cita => {
      const inicioCita = this.parseTime(cita.hora);
      const finCita = inicioCita + cita.duracion;
      
      // Verificar solapamiento
      return (inicioReserva < finCita && finReserva > inicioCita);
    });
  }

  private getCitasExistentes(negocioId: string, fecha: string): any[] {
    // Mock de citas existentes
    const citasMock: any = {
      '2024-12-25': [
        { hora: '10:00', duracion: 60 },
        { hora: '14:00', duracion: 45 }
      ],
      '2024-12-26': [
        { hora: '09:00', duracion: 120 }
      ]
    };

    return citasMock[fecha] || [];
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // CORREGIR ESTE MÉTODO TAMBIÉN
  crearReserva(reserva: ReservaRequest): Observable<Cita> {
    return from(
      new Promise<Cita>((resolve, reject) => {
        setTimeout(() => {
          console.log('Creando reserva:', reserva); // DEBUG
          
          // Verificar disponibilidad una vez más
          const disponible = this.isHorarioDisponible(
            reserva.negocioId,
            reserva.fecha,
            reserva.hora,
            this.getServicioInfo(reserva.servicioId)?.duracion || 60
          );

          if (!disponible) {
            console.error('Horario no disponible'); // DEBUG
            reject(new Error('Horario ya no disponible'));
            return;
          }

          // Crear nueva cita
          const nuevaCita: Cita = {
            id: Date.now().toString(),
            clienteId: reserva.clienteId,
            negocioId: reserva.negocioId,
            servicioId: reserva.servicioId,
            fecha: reserva.fecha,
            hora: reserva.hora,
            estado: 'pendiente',
            notas: reserva.notas || '',
            precio: this.getServicioInfo(reserva.servicioId)?.precio || 0,
            duracion: this.getServicioInfo(reserva.servicioId)?.duracion || 60
          };

          console.log('Nueva cita creada:', nuevaCita); // DEBUG

          // IMPLEMENTAR: Persistir la cita en los servicios correspondientes
          this.persistirNuevaCita(nuevaCita);
          
          resolve(nuevaCita);
        }, 1000);
      })
    );
  }

  // IMPLEMENTAR persistencia real
  private persistirNuevaCita(cita: Cita) {
    console.log('Persistiendo nueva cita:', cita); // DEBUG
    
    // Agregar a CitasService para que aparezca en el dashboard del cliente
    this.citasService.agregarCita(cita);
    
    // Negocio - AGREGAR ESTO
    this.negocioDashboardService.agregarCitaPendiente(cita);
    
    // También emitir en el subject local
    const citasActuales = this.reservasSubject.value;
    this.reservasSubject.next([...citasActuales, cita]);
    
    console.log('Cita persistida exitosamente'); // DEBUG
  }

  // Obtener fechas disponibles (próximos 30 días)
  getFechasDisponibles(negocioId: string): Observable<Date[]> {
    const fechas: Date[] = [];
    const hoy = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      
      const diaSemana = this.diasSemana[fecha.getDay()];
      const horario = this.getHorarioNegocio(negocioId, diaSemana);
      
      if (horario.activo) {
        fechas.push(fecha);
      }
    }

    return of(fechas);
  }

  // Validar disponibilidad antes de mostrar el formulario
  validarDisponibilidad(
    negocioId: string, 
    servicioId: string, 
    fecha: Date, 
    hora: string
  ): Observable<boolean> {
    const servicio = this.getServicioInfo(servicioId);
    if (!servicio) {
      return of(false);
    }

    const disponible = this.isHorarioDisponible(
      negocioId, 
      fecha, 
      hora, 
      servicio.duracion
    );

    return of(disponible);
  }

  // CORREGIR ESTE MÉTODO TAMBIÉN
  cancelarReserva(citaId: string): Observable<boolean> {
    return from(
      new Promise<boolean>((resolve) => {
        setTimeout(() => {
          // Simular cancelación
          resolve(true);
        }, 500);
      })
    );
  }
}