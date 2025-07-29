import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita, Servicio } from '../models/cita';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class NegocioDashboardService {
  private serviciosSubject = new BehaviorSubject<Servicio[]>([]);
  public servicios$ = this.serviciosSubject.asObservable();

  // AGREGAR ESTOS SUBJECTS PARA CITAS
  private citasSubject = new BehaviorSubject<Cita[]>([]);
  public citas$ = this.citasSubject.asObservable();

  private localStorageService = inject(LocalStorageService);

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

  // Datos mock de citas del negocio (como respaldo)
  private mockCitasNegocio: Cita[] = [
    {
      id: '100',
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
      id: '101',
      clienteId: '3',
      negocioId: '2',
      servicioId: '2',
      fecha: new Date(), // Hoy
      hora: '11:00',
      estado: 'pendiente',
      notas: 'Tinte Completo',
      precio: 45.00,
      duracion: 120
    }
  ];

  constructor() {
    this.serviciosSubject.next(this.mockServicios);
    console.log('NegocioDashboard: Inicializando...'); // DEBUG
    // CARGAR CITAS DESDE LOCALSTORAGE
    this.cargarCitasDesdeStorage();
  }

  // CORREGIR COMPLETAMENTE ESTE MÉTODO
  private cargarCitasDesdeStorage(): void {
    console.log('NegocioDashboard: Intentando cargar citas desde localStorage...'); // DEBUG
    
    // Obtener todas las citas desde localStorage
    const citasGuardadas = this.localStorageService.getCitas();
    console.log('NegocioDashboard: Citas encontradas en localStorage:', citasGuardadas); // DEBUG
    
    if (citasGuardadas.length > 0) {
      // Usar todas las citas (no filtrar por negocio específico aquí)
      // porque necesitamos todas las citas para que los negocios las vean
      this.citasSubject.next(citasGuardadas);
      console.log('NegocioDashboard: Citas cargadas exitosamente:', citasGuardadas.length); // DEBUG
    } else {
      // Si no hay citas guardadas, inicializar con datos mock
      console.log('NegocioDashboard: No hay citas en localStorage, usando datos mock'); // DEBUG
      this.localStorageService.setCitas(this.mockCitasNegocio);
      this.citasSubject.next(this.mockCitasNegocio);
    }
    
    // Verificar qué citas tiene cada negocio
    const todasLasCitas = this.citasSubject.value;
    console.log('NegocioDashboard: Resumen de citas por negocio:'); // DEBUG
    console.log('  - Negocio 1:', todasLasCitas.filter(c => c.negocioId === '1').length, 'citas'); // DEBUG
    console.log('  - Negocio 2:', todasLasCitas.filter(c => c.negocioId === '2').length, 'citas'); // DEBUG
    console.log('  - Negocio 3:', todasLasCitas.filter(c => c.negocioId === '3').length, 'citas'); // DEBUG
  }

  // ACTUALIZAR MÉTODOS DE CITAS PARA USAR EL SUBJECT Y LOCALSTORAGE
  getCitasByNegocio(negocioId: string): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => {
        const citasDelNegocio = citas.filter(c => c.negocioId === negocioId);
        console.log(`NegocioDashboard: Citas para negocio ${negocioId}:`, citasDelNegocio); // DEBUG
        return citasDelNegocio;
      })
    );
  }

  getCitasDelDia(negocioId: string, fecha: Date = new Date()): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => {
        const fechaStr = fecha.toDateString();
        const citasDelDia = citas
          .filter(c => c.negocioId === negocioId && c.fecha.toDateString() === fechaStr)
          .sort((a, b) => a.hora.localeCompare(b.hora));
        console.log(`NegocioDashboard: Citas del día ${fechaStr} para negocio ${negocioId}:`, citasDelDia); // DEBUG
        return citasDelDia;
      })
    );
  }

  getCitasPendientes(negocioId: string): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => {
        const citasPendientes = citas.filter(c => c.negocioId === negocioId && c.estado === 'pendiente');
        console.log(`NegocioDashboard: Citas pendientes para negocio ${negocioId}:`, citasPendientes); // DEBUG
        return citasPendientes;
      })
    );
  }

  // ACTUALIZAR ESTE MÉTODO CRÍTICO
  agregarCitaPendiente(cita: Cita): void {
    console.log('NegocioDashboard: Agregando cita pendiente:', cita); // DEBUG
    
    // Obtener citas actuales del subject
    const citasActuales = this.citasSubject.value;
    
    // Agregar la nueva cita
    const citasActualizadas = [...citasActuales, cita];
    
    // Actualizar el subject
    this.citasSubject.next(citasActualizadas);
    
    // SINCRONIZAR CON LOCALSTORAGE
    this.localStorageService.setCitas(citasActualizadas);
    
    console.log('NegocioDashboard: Cita agregada. Total citas:', citasActualizadas.length); // DEBUG
    console.log('NegocioDashboard: Citas pendientes para negocio', cita.negocioId, ':', 
      citasActualizadas.filter(c => c.negocioId === cita.negocioId && c.estado === 'pendiente').length); // DEBUG
  }

  // ACTUALIZAR MÉTODOS QUE MODIFICAN CITAS
  confirmarCita(citaId: string): Observable<boolean> {
    const citasActuales = this.citasSubject.value;
    const cita = citasActuales.find(c => c.id === citaId);
    if (cita) {
      cita.estado = 'confirmada';
      this.citasSubject.next([...citasActuales]);
      this.localStorageService.setCitas(citasActuales); // SINCRONIZAR
      console.log('Cita confirmada y sincronizada:', cita);
      return of(true);
    }
    return of(false);
  }

  completarCita(citaId: string): Observable<boolean> {
    const citasActuales = this.citasSubject.value;
    const cita = citasActuales.find(c => c.id === citaId);
    if (cita) {
      cita.estado = 'completada';
      this.citasSubject.next([...citasActuales]);
      this.localStorageService.setCitas(citasActuales); // SINCRONIZAR
      console.log('Cita completada y sincronizada:', cita);
      return of(true);
    }
    return of(false);
  }

  cancelarCita(citaId: string): Observable<boolean> {
    const citasActuales = this.citasSubject.value;
    const cita = citasActuales.find(c => c.id === citaId);
    if (cita) {
      cita.estado = 'cancelada';
      this.citasSubject.next([...citasActuales]);
      this.localStorageService.setCitas(citasActuales); // SINCRONIZAR
      console.log('Cita cancelada y sincronizada:', cita);
      return of(true);
    }
    return of(false);
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

  // Estadísticas
  getEstadisticas(negocioId: string): Observable<any> {
    return this.citas$.pipe(
      map(citas => {
        const citasNegocio = citas.filter(c => c.negocioId === negocioId);
        const hoy = new Date().toDateString();
        
        return {
          citasHoy: citasNegocio.filter(c => c.fecha.toDateString() === hoy).length,
          citasPendientes: citasNegocio.filter(c => c.estado === 'pendiente').length,
          ingresosSemana: citasNegocio
            .filter(c => c.estado === 'completada')
            .reduce((sum, c) => sum + c.precio, 0),
          serviciosActivos: this.mockServicios.filter(s => s.negocioId === negocioId && s.activo).length
        };
      })
    );
  }
}