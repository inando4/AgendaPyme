import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { NegocioDashboardService } from '../../shared/services/negocio-dashboard.service';
import { NegociosService } from '../../shared/services/negocios.service';
import { User, UserNegocio } from '../../shared/models/user';
import { Cita, Servicio, Negocio } from '../../shared/models/cita';
import { QrCodeService } from '../../shared/services/qr-code.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: UserNegocio | null = null;
  datosNegocio: Negocio | null = null;
  citasHoy: Cita[] = [];
  citasPendientes: Cita[] = [];
  servicios: Servicio[] = [];
  mostrarFormServicio = false;
  editandoServicio: Servicio | null = null;
  mostrarModalQR = false;
  qrCodeDataURL = '';
  linkReserva = '';
  copiandoLink = false;
  fechaHoy = new Date(); // AGREGAR ESTA LÍNEA

  // Estadísticas
  stats = {
    citasHoy: 0,
    citasPendientes: 0,
    ingresosSemana: 0,
    serviciosActivos: 0
  };

  // Formulario de servicio
  nuevoServicio: Omit<Servicio, 'id'> = {
    negocioId: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    duracion: 30,
    categoria: '',
    activo: true
  };

  categorias = [
    'Corte', 'Coloración', 'Tratamientos', 'Peinados',
    'Belleza', 'Manicure', 'Pedicure', 'Depilación',
    'Masajes', 'Faciales', 'Otros'
  ];

  constructor(
    private authService: AuthService,
    private negocioDashboardService: NegocioDashboardService,
    private negociosService: NegociosService,
    private qrCodeService: QrCodeService, // AGREGAR
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser() as UserNegocio;
    if (this.currentUser) {
      this.nuevoServicio.negocioId = this.currentUser.id;
      this.cargarDatosNegocio();
    }
  }

  cargarDatosNegocio() {
    if (!this.currentUser) return;

    // Cargar datos del negocio
    this.negociosService.getNegocioById(this.currentUser.id).subscribe(negocio => {
      this.datosNegocio = negocio || null;
    });

    // Cargar citas de hoy
    this.negocioDashboardService.getCitasDelDia(this.currentUser.id).subscribe(citas => {
      this.citasHoy = citas;
    });

    // Cargar citas pendientes
    this.negocioDashboardService.getCitasPendientes(this.currentUser.id).subscribe(citas => {
      this.citasPendientes = citas;
    });

    // Cargar servicios
    this.negocioDashboardService.getServiciosByNegocio(this.currentUser.id).subscribe(servicios => {
      this.servicios = servicios;
    });

    // Cargar estadísticas
    this.negocioDashboardService.getEstadisticas(this.currentUser.id).subscribe(stats => {
      this.stats = stats;
    });
  }

  // Gestión de citas
  confirmarCita(cita: Cita) {
    this.negocioDashboardService.confirmarCita(cita.id).subscribe(success => {
      if (success) {
        this.cargarDatosNegocio();
      }
    });
  }

  completarCita(cita: Cita) {
    if (confirm('¿Marcar esta cita como completada?')) {
      this.negocioDashboardService.completarCita(cita.id).subscribe(success => {
        if (success) {
          this.cargarDatosNegocio();
        }
      });
    }
  }

  cancelarCita(cita: Cita) {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.negocioDashboardService.cancelarCita(cita.id).subscribe(success => {
        if (success) {
          this.cargarDatosNegocio();
        }
      });
    }
  }

  // Gestión de servicios
  mostrarNuevoServicio() {
    this.editandoServicio = null;
    this.nuevoServicio = {
      negocioId: this.currentUser?.id || '',
      nombre: '',
      descripcion: '',
      precio: 0,
      duracion: 30,
      categoria: '',
      activo: true
    };
    this.mostrarFormServicio = true;
  }

  editarServicio(servicio: Servicio) {
    this.editandoServicio = servicio;
    this.nuevoServicio = { ...servicio };
    this.mostrarFormServicio = true;
  }

  guardarServicio() {
    if (!this.validarServicio()) return;

    if (this.editandoServicio) {
      // Actualizar servicio existente
      const servicioActualizado: Servicio = {
        ...this.nuevoServicio,
        id: this.editandoServicio.id
      };
      
      this.negocioDashboardService.actualizarServicio(servicioActualizado).subscribe(() => {
        this.cargarDatosNegocio();
        this.cancelarFormServicio();
      });
    } else {
      // Crear nuevo servicio
      this.negocioDashboardService.crearServicio(this.nuevoServicio).subscribe(() => {
        this.cargarDatosNegocio();
        this.cancelarFormServicio();
      });
    }
  }

  eliminarServicio(servicio: Servicio) {
    if (confirm(`¿Eliminar el servicio "${servicio.nombre}"?`)) {
      this.negocioDashboardService.eliminarServicio(servicio.id).subscribe(success => {
        if (success) {
          this.cargarDatosNegocio();
        }
      });
    }
  }

  toggleServicioActivo(servicio: Servicio) {
    const servicioActualizado = { ...servicio, activo: !servicio.activo };
    this.negocioDashboardService.actualizarServicio(servicioActualizado).subscribe(() => {
      this.cargarDatosNegocio();
    });
  }

  cancelarFormServicio() {
    this.mostrarFormServicio = false;
    this.editandoServicio = null;
  }

  validarServicio(): boolean {
    return !!(
      this.nuevoServicio.nombre.trim() &&
      this.nuevoServicio.precio > 0 &&
      this.nuevoServicio.duracion > 0 &&
      this.nuevoServicio.categoria
    );
  }

  // Utilidades
  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(fecha);
  }

  formatearHora(hora: string): string {
    return hora;
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

  async abrirModalQR() {
    if (!this.currentUser) return;

    this.mostrarModalQR = true;
    this.linkReserva = this.qrCodeService.generarLinkReserva(this.currentUser.id);
    
    try {
      this.qrCodeDataURL = await this.qrCodeService.generarQRReserva(this.currentUser.id);
      console.log('QR generado exitosamente'); // DEBUG
    } catch (error) {
      console.error('Error generando QR:', error);
      alert('Error al generar el código QR');
    }
  }

  cerrarModalQR() {
    this.mostrarModalQR = false;
    this.qrCodeDataURL = '';
    this.linkReserva = '';
  }

  async copiarLink() {
    this.copiandoLink = true;
    
    try {
      const exito = await this.qrCodeService.copiarAlPortapapeles(this.linkReserva);
      if (exito) {
        this.mostrarToastExito('¡Link copiado al portapapeles!');
      } else {
        alert('No se pudo copiar el link');
      }
    } catch (error) {
      console.error('Error copiando link:', error);
      alert('Error al copiar el link');
    } finally {
      this.copiandoLink = false;
    }
  }

  descargarQR() {
    if (this.qrCodeDataURL && this.datosNegocio) {
      const nombreArchivo = `qr-${this.datosNegocio.nombre.replace(/\s+/g, '-').toLowerCase()}.png`;
      this.qrCodeService.descargarQR(this.qrCodeDataURL, nombreArchivo);
      this.mostrarToastExito('¡Código QR descargado!');
    }
  }

  private mostrarToastExito(mensaje: string) {
    // Crear toast temporal
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-check-circle mr-2"></i>
        ${mensaje}
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}
