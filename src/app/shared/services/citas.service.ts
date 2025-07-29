import { Injectable, inject } from '@angular/core'; // AGREGAR inject aquí
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita } from '../models/cita';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private citasSubject = new BehaviorSubject<Cita[]>([]);
  public citas$ = this.citasSubject.asObservable();

  private localStorageService = inject(LocalStorageService);

  // Mock data de citas (como respaldo si no hay nada en localStorage)
  private mockCitas: Cita[] = [
    {
      id: '1',
      clienteId: '1',
      negocioId: '1',
      servicioId: '1',
      fecha: new Date(Date.now() + 86400000), // Mañana
      hora: '10:00',
      estado: 'confirmada',
      notas: 'Corte y Peinado',
      precio: 25.00,
      duracion: 60
    },
    {
      id: '2',
      clienteId: '1',
      negocioId: '2',
      servicioId: '2',
      fecha: new Date(Date.now() + 172800000), // Pasado mañana
      hora: '15:00',
      estado: 'pendiente',
      notas: 'Limpieza Dental',
      precio: 80.00,
      duracion: 90
    }
  ];

  constructor() {
    this.cargarCitasDesdeStorage();
  }

  private cargarCitasDesdeStorage(): void {
    // Intentar cargar desde localStorage
    const citasGuardadas = this.localStorageService.getCitas();
    
    if (citasGuardadas.length > 0) {
      // Si hay citas guardadas, usarlas
      this.citasSubject.next(citasGuardadas);
      console.log('CitasService: Citas cargadas desde localStorage:', citasGuardadas.length);
    } else {
      // Si no hay citas guardadas, usar datos mock e inicializar localStorage
      this.localStorageService.setCitas(this.mockCitas);
      this.citasSubject.next(this.mockCitas);
      console.log('CitasService: Inicializado con datos mock:', this.mockCitas.length);
    }
  }

  private sincronizarConStorage(): void {
    const citasActuales = this.citasSubject.value;
    this.localStorageService.setCitas(citasActuales);
  }

  getProximasCitas(clienteId: string): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const proximasCitas = citas.filter(cita => {
          const fechaCita = new Date(cita.fecha);
          fechaCita.setHours(0, 0, 0, 0);
          
          return cita.clienteId === clienteId && 
                 fechaCita >= hoy && 
                 (cita.estado === 'pendiente' || cita.estado === 'confirmada');
        }).sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        
        console.log('Próximas citas para cliente', clienteId, ':', proximasCitas.length);
        return proximasCitas;
      })
    );
  }

  getCitasHistorial(clienteId: string): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => {
        const historial = citas
          .filter(cita => cita.clienteId === clienteId)
          .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        
        console.log('Historial de citas para cliente', clienteId, ':', historial.length);
        return historial;
      })
    );
  }

  cancelarCita(citaId: string): Observable<boolean> {
    const citasActuales = this.citasSubject.value;
    const cita = citasActuales.find(c => c.id === citaId);
    
    if (cita) {
      cita.estado = 'cancelada';
      this.citasSubject.next([...citasActuales]);
      this.sincronizarConStorage(); // SINCRONIZAR CON LOCALSTORAGE
      console.log('Cita cancelada y sincronizada:', cita);
      return of(true);
    }
    
    console.log('Cita no encontrada para cancelar:', citaId);
    return of(false);
  }

  agregarCita(nuevaCita: Cita): void {
    console.log('CitasService: Agregando nueva cita:', nuevaCita);
    const citasActuales = this.citasSubject.value;
    const citasActualizadas = [...citasActuales, nuevaCita];
    this.citasSubject.next(citasActualizadas);
    this.sincronizarConStorage(); // SINCRONIZAR CON LOCALSTORAGE
    console.log('CitasService: Cita agregada y sincronizada. Total:', citasActualizadas.length);
  }

  // Métodos adicionales para compatibilidad
  getCitasByCliente(clienteId: string): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => citas.filter(cita => cita.clienteId === clienteId))
    );
  }
}