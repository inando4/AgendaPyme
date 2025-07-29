import { Injectable } from '@angular/core';
import { Cita } from '../models/cita';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  // Guardar citas (separado de la sesión de usuario)
  setCitas(citas: Cita[]): void {
    try {
      localStorage.setItem('app_citas', JSON.stringify(citas));
      console.log('LocalStorage: Citas guardadas:', citas.length); // DEBUG
    } catch (error) {
      console.error('Error guardando citas en localStorage:', error);
    }
  }

  // Obtener todas las citas
  getCitas(): Cita[] {
    try {
      const citas = localStorage.getItem('app_citas');
      if (citas) {
        const citasParseadas = JSON.parse(citas).map((cita: any) => ({
          ...cita,
          fecha: new Date(cita.fecha) // Convertir string a Date
        }));
        console.log('LocalStorage: Citas cargadas:', citasParseadas.length); // DEBUG
        return citasParseadas;
      }
      console.log('LocalStorage: No hay citas guardadas'); // DEBUG
      return [];
    } catch (error) {
      console.error('Error leyendo citas de localStorage:', error);
      return [];
    }
  }

  // Agregar una cita nueva
  agregarCita(nuevaCita: Cita): void {
    console.log('LocalStorage: Agregando nueva cita:', nuevaCita); // DEBUG
    const citasActuales = this.getCitas();
    citasActuales.push(nuevaCita);
    this.setCitas(citasActuales);
  }

  // Actualizar una cita existente
  actualizarCita(citaActualizada: Cita): void {
    console.log('LocalStorage: Actualizando cita:', citaActualizada); // DEBUG
    const citasActuales = this.getCitas();
    const index = citasActuales.findIndex(c => c.id === citaActualizada.id);
    if (index !== -1) {
      citasActuales[index] = citaActualizada;
      this.setCitas(citasActuales);
    }
  }

  // Eliminar una cita
  eliminarCita(citaId: string): void {
    console.log('LocalStorage: Eliminando cita:', citaId); // DEBUG
    const citasActuales = this.getCitas();
    const citasFiltradas = citasActuales.filter(c => c.id !== citaId);
    this.setCitas(citasFiltradas);
  }

  // Métodos generales
  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error leyendo de localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error eliminando de localStorage:', error);
    }
  }
}