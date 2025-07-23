import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { CitasService } from '../../shared/services/citas.service';
import { NegociosService } from '../../shared/services/negocios.service';
import { ReservasComponent } from '../reservas/reservas.component'; // AGREGAR ESTA LÍNEA
import { UserCliente } from '../../shared/models/user';
import { Cita, Negocio } from '../../shared/models/cita';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ReservasComponent], // AGREGAR ReservasComponent
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: UserCliente | null = null;
  proximasCitas: Cita[] = [];
  historialCitas: Cita[] = [];
  negociosDestacados: Negocio[] = [];
  
  // Búsqueda
  busquedaTermino = '';
  resultadosBusqueda: Negocio[] = [];
  mostrarResultados = false;
  isLoading = false;

  // Sistema de reservas - AGREGAR ESTAS LÍNEAS
  mostrarModalReservas = false;
  negocioSeleccionadoId = '';

  // Estadísticas
  stats = {
    proximasCitas: 0,
    citasCompletadas: 0,
    negociosFavoritos: 3,
    proximaCita: null as Cita | null
  };

  constructor(
    private authService: AuthService,
    private citasService: CitasService,
    private negociosService: NegociosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser() as UserCliente;
    if (this.currentUser) {
      this.cargarDatosCliente();
    }
  }

  cargarDatosCliente() {
    if (!this.currentUser) return;

    // Cargar próximas citas
    this.citasService.getProximasCitas(this.currentUser.id).subscribe(citas => {
      this.proximasCitas = citas;
      this.stats.proximasCitas = citas.length;
      this.stats.proximaCita = citas.length > 0 ? citas[0] : null;
    });

    // Cargar historial
    this.citasService.getCitasHistorial(this.currentUser.id).subscribe(citas => {
      this.historialCitas = citas;
      this.stats.citasCompletadas = citas.filter(c => c.estado === 'completada').length;
    });

    // Cargar negocios destacados
    this.negociosService.getAllNegocios().subscribe(negocios => {
      this.negociosDestacados = negocios.slice(0, 3);
    });
  }

  buscarNegocios() {
    if (this.busquedaTermino.trim().length < 2) {
      this.mostrarResultados = false;
      return;
    }

    this.isLoading = true;
    this.negociosService.buscarNegocios(this.busquedaTermino).subscribe(negocios => {
      this.resultadosBusqueda = negocios;
      this.mostrarResultados = true;
      this.isLoading = false;
    });
  }

  limpiarBusqueda() {
    this.busquedaTermino = '';
    this.mostrarResultados = false;
    this.resultadosBusqueda = [];
  }

  verDetalleCita(cita: Cita) {
    // TODO: Implementar vista detalle de cita
    console.log('Ver detalle de cita:', cita);
  }

  verDetalleNegocio(negocio: Negocio) {
    console.log('Abriendo modal para negocio:', negocio); // DEBUG
    console.log('ID del negocio:', negocio.id); // DEBUG
    this.abrirModalReservas(negocio.id);
  }

  cancelarCita(cita: Cita) {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.citasService.cancelarCita(cita.id).subscribe(success => {
        if (success) {
          this.cargarDatosCliente(); // Recargar datos
        }
      });
    }
  }

  agendarNuevaCita() {
    // ACTUALIZAR ESTA FUNCIÓN para mostrar búsqueda
    if (this.negociosDestacados.length > 0) {
      this.abrirModalReservas(this.negociosDestacados[0].id);
    }
  }

  // AGREGAR ESTAS NUEVAS FUNCIONES
  abrirModalReservas(negocioId: string) {
    console.log('Dashboard: Abriendo modal de reservas para ID:', negocioId); // DEBUG
    
    // Primero cerrar el modal si estaba abierto
    this.mostrarModalReservas = false;
    this.negocioSeleccionadoId = '';
    
    // Luego abrir con el nuevo negocio (usando setTimeout para forzar el cambio)
    setTimeout(() => {
      this.negocioSeleccionadoId = negocioId;
      this.mostrarModalReservas = true;
      console.log('Dashboard: Modal configurado con negocioId:', this.negocioSeleccionadoId); // DEBUG
    }, 100);
  }

  cerrarModalReservas() {
    console.log('Dashboard: Cerrando modal de reservas'); // DEBUG
    this.mostrarModalReservas = false;
    this.negocioSeleccionadoId = '';
  }

  onReservaCreada(cita: any) {
    // Reemplazar alert() por un toast elegante
    this.mostrarToastExito('¡Reserva creada exitosamente!');
    this.cargarDatosCliente();
    this.cerrarModalReservas();
  }

  private mostrarToastExito(mensaje: string) {
    // Implementar toast notification
  }

  // Funciones de utilidad existentes...
  getNombreNegocio(negocioId: string): string {
    const negocio = this.negociosDestacados.find(n => n.id === negocioId);
    return negocio ? negocio.nombre : `Negocio ${negocioId}`;
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(fecha);
  }

  formatearFechaCorta(fecha: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit'
    }).format(fecha);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'status-confirmada';
      case 'pendiente': return 'status-pendiente';
      case 'cancelada': return 'status-cancelada';
      case 'completada': return 'status-completada';
      default: return '';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
