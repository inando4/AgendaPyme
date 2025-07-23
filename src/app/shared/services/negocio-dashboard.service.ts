import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Cita, Servicio } from '../models/cita';

@Injectable({
  providedIn: 'root'
})
export class NegocioDashboardService {
  private serviciosSubject = new BehaviorSubject<Servicio[]>([]);
  public servicios$ = this.serviciosSubject.asObservable();

  // Datos mock de servicios expandidos
  private mockServicios: Servicio[] = [
    {
      id: '1',
      negocioId: '2', // ID del negocio de prueba
      nombre: 'Corte y Peinado',
      descripcion: 'Corte de cabello profesional con peinado incluido',
      precio: 25.00,
      duracion: 60,
      categoria: 'Corte',
      activo: true
    },
    {
      id: '2',
      negocioId: '2',
      nombre: 'Tinte Completo',
      descripcion: 'Tinte de cabello completo con productos premium',
      precio: 45.00,
      duracion: 120,
      categoria: 'Coloración',
      activo: true
    },
    {
      id: '3',
      negocioId: '2',
      nombre: 'Manicure',
      descripcion: 'Cuidado completo de uñas y cutículas',
      precio: 15.00,
      duracion: 45,
      categoria: 'Belleza',
      activo: true
    },
    {
      id: '4',
      negocioId: '2',
      nombre: 'Pedicure',
      descripcion: 'Cuidado completo de pies y uñas',
      precio: 20.00,
      duracion: 60,
      categoria: 'Belleza',
      activo: false
    }
  ];

  // Datos mock de citas del negocio
  private mockCitasNegocio: Cita[] = [
    {
      id: '1',
      clienteId: '1',
      negocioId: '2',
      servicioId: '1',
      fecha: new Date(), // Hoy
      hora: '09:00',
      estado: 'confirmada',
      notas: 'Corte y Peinado',
      precio: 25.00,
      duracion: 60
    },
    {
      id: '2',
      clienteId: '3',
      negocioId: '2',
      servicioId: '2',
      fecha: new Date(), // Hoy
      hora: '11:00',
      estado: 'pendiente',
      notas: 'Tinte Completo',
      precio: 45.00,
      duracion: 120
    },
    {
      id: '3',
      clienteId: '1',
      negocioId: '2',
      servicioId: '3',
      fecha: new Date(Date.now() + 86400000), // Mañana
      hora: '14:00',
      estado: 'confirmada',
      notas: 'Manicure',
      precio: 15.00,
      duracion: 45
    },
    {
      id: '4',
      clienteId: '4',
      negocioId: '2',
      servicioId: '1',
      fecha: new Date(Date.now() - 86400000), // Ayer
      hora: '16:00',
      estado: 'completada',
      notas: 'Corte y Peinado',
      precio: 25.00,
      duracion: 60
    }
  ];

  constructor() {
    this.serviciosSubject.next(this.mockServicios);
  }

  // Servicios del negocio
  getServiciosByNegocio(negocioId: string): Observable<Servicio[]> {
    const servicios = this.mockServicios.filter(s => s.negocioId === negocioId);
    return of(servicios);
  }

  crearServicio(servicio: Omit<Servicio, 'id'>): Observable<Servicio> {
    const newId = (this.mockServicios.length + 1).toString();
    const nuevoServicio: Servicio = { ...servicio, id: newId };
    this.mockServicios.push(nuevoServicio);
    this.serviciosSubject.next([...this.mockServicios]);
    return of(nuevoServicio);
  }

  actualizarServicio(servicio: Servicio): Observable<Servicio> {
    const index = this.mockServicios.findIndex(s => s.id === servicio.id);
    if (index !== -1) {
      this.mockServicios[index] = servicio;
      this.serviciosSubject.next([...this.mockServicios]);
    }
    return of(servicio);
  }

  eliminarServicio(servicioId: string): Observable<boolean> {
    const index = this.mockServicios.findIndex(s => s.id === servicioId);
    if (index !== -1) {
      this.mockServicios.splice(index, 1);
      this.serviciosSubject.next([...this.mockServicios]);
      return of(true);
    }
    return of(false);
  }

  // Citas del negocio
  getCitasByNegocio(negocioId: string): Observable<Cita[]> {
    const citas = this.mockCitasNegocio.filter(c => c.negocioId === negocioId);
    return of(citas);
  }

  getCitasDelDia(negocioId: string, fecha: Date = new Date()): Observable<Cita[]> {
    const fechaStr = fecha.toDateString();
    const citasDelDia = this.mockCitasNegocio.filter(c => 
      c.negocioId === negocioId && 
      c.fecha.toDateString() === fechaStr
    );
    return of(citasDelDia.sort((a, b) => a.hora.localeCompare(b.hora)));
  }

  getCitasPendientes(negocioId: string): Observable<Cita[]> {
    const pendientes = this.mockCitasNegocio.filter(c => 
      c.negocioId === negocioId && 
      c.estado === 'pendiente'
    );
    return of(pendientes);
  }

  confirmarCita(citaId: string): Observable<boolean> {
    const cita = this.mockCitasNegocio.find(c => c.id === citaId);
    if (cita) {
      cita.estado = 'confirmada';
      return of(true);
    }
    return of(false);
  }

  completarCita(citaId: string): Observable<boolean> {
    const cita = this.mockCitasNegocio.find(c => c.id === citaId);
    if (cita) {
      cita.estado = 'completada';
      return of(true);
    }
    return of(false);
  }

  cancelarCita(citaId: string): Observable<boolean> {
    const cita = this.mockCitasNegocio.find(c => c.id === citaId);
    if (cita) {
      cita.estado = 'cancelada';
      return of(true);
    }
    return of(false);
  }

  agregarCitaPendiente(cita: Cita): void {
    this.mockCitasNegocio.push(cita);
  }

  // Estadísticas
  getEstadisticas(negocioId: string): Observable<any> {
    const citasNegocio = this.mockCitasNegocio.filter(c => c.negocioId === negocioId);
    const hoy = new Date().toDateString();
    
    const stats = {
      citasHoy: citasNegocio.filter(c => c.fecha.toDateString() === hoy).length,
      citasPendientes: citasNegocio.filter(c => c.estado === 'pendiente').length,
      ingresosSemana: citasNegocio
        .filter(c => c.estado === 'completada')
        .reduce((sum, c) => sum + c.precio, 0),
      serviciosActivos: this.mockServicios.filter(s => s.negocioId === negocioId && s.activo).length
    };

    return of(stats);
  }
}