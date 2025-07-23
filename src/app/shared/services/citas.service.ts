import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Cita } from '../models/cita';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private citasSubject = new BehaviorSubject<Cita[]>([]);
  public citas$ = this.citasSubject.asObservable();

  // Datos mock para citas
  private mockCitas: Cita[] = [
    {
      id: '1',
      clienteId: '1', // ID del cliente de prueba
      negocioId: '1',
      servicioId: '1',
      fecha: new Date(2024, 11, 25), // 25 de diciembre
      hora: '10:00',
      estado: 'confirmada',
      notas: 'Corte y peinado',
      precio: 25.00,
      duracion: 60
    },
    {
      id: '2',
      clienteId: '1',
      negocioId: '2',
      servicioId: '2',
      fecha: new Date(2024, 11, 28), // 28 de diciembre
      hora: '15:30',
      estado: 'pendiente',
      notas: 'Limpieza dental',
      precio: 80.00,
      duracion: 90
    },
    {
      id: '3',
      clienteId: '1',
      negocioId: '1',
      servicioId: '3',
      fecha: new Date(2024, 11, 15), // 15 de diciembre (pasada)
      hora: '09:00',
      estado: 'completada',
      notas: 'Manicure',
      precio: 15.00,
      duracion: 45
    }
  ];

  constructor() {
    this.citasSubject.next(this.mockCitas); // AGREGAR ESTA LÍNEA
  }

  getCitasByCliente(clienteId: string): Observable<Cita[]> {
    const citasCliente = this.mockCitas.filter(cita => cita.clienteId === clienteId);
    return of(citasCliente);
  }

  agregarCita(nuevaCita: Cita): void {
    console.log('CitasService: Agregando nueva cita:', nuevaCita); // DEBUG
    const citasActuales = this.citasSubject.value;
    const citasActualizadas = [...citasActuales, nuevaCita];
    this.citasSubject.next(citasActualizadas);
    console.log('CitasService: Citas actualizadas:', citasActualizadas); // DEBUG
  }

  getProximasCitas(clienteId: string): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => {
        const hoy = new Date();
        return citas
          .filter(cita => 
            cita.clienteId === clienteId && 
            cita.fecha >= hoy && 
            (cita.estado === 'pendiente' || cita.estado === 'confirmada')
          )
          .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
      })
    );
  }

  getCitasHistorial(clienteId: string): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => {
        return citas
          .filter(cita => cita.clienteId === clienteId)
          .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      })
    );
  }

  cancelarCita(citaId: string): Observable<boolean> {
    const citasActuales = this.citasSubject.value;
    const cita = citasActuales.find(c => c.id === citaId);
    
    if (cita) {
      cita.estado = 'cancelada';
      this.citasSubject.next([...citasActuales]);
      return of(true);
    }
    
    return of(false);
  }
}