import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservasService, HorarioDisponible, ReservaRequest } from '../../shared/services/reservas.service';
import { NegociosService } from '../../shared/services/negocios.service';
import { AuthService } from '../../auth/services/auth.service';
import { Negocio, Servicio } from '../../shared/models/cita';

@Component({
  selector: 'app-reservas',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent implements OnInit, OnChanges { // AGREGAR OnChanges
  @Input() negocioId: string = '';
  @Input() mostrarModal: boolean = false;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() reservaCreada = new EventEmitter<any>();

  // Datos del negocio y servicios
  negocio: Negocio | null = null;
  servicios: Servicio[] = [];
  
  // Estado del formulario
  paso = 1; // 1: Servicio, 2: Fecha, 3: Hora, 4: Confirmación
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Datos de la reserva
  reserva: ReservaRequest = {
    clienteId: '',
    negocioId: '',
    servicioId: '',
    fecha: new Date(),
    hora: '',
    notas: ''
  };

  // Opciones disponibles
  servicioSeleccionado: Servicio | null = null;
  fechasDisponibles: Date[] = [];
  horariosDisponibles: HorarioDisponible[] = [];
  fechaSeleccionada: Date | null = null;
  horarioSeleccionado: HorarioDisponible | null = null;

  // Estados de carga
  cargandoFechas = false;
  cargandoHorarios = false;

  constructor(
    private reservasService: ReservasService,
    private negociosService: NegociosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('ReservasComponent ngOnInit - negocioId:', this.negocioId); // DEBUG
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.reserva.clienteId = currentUser.id;
    }
  }

  // IMPLEMENTAR OnChanges para detectar cambios en los inputs
  ngOnChanges(changes: SimpleChanges) {
    console.log('ReservasComponent ngOnChanges:', changes); // DEBUG
    
    // Si el negocioId cambió y no está vacío
    if (changes['negocioId'] && this.negocioId && this.negocioId !== '') {
      console.log('Nuevo negocioId detectado:', this.negocioId); // DEBUG
      this.reserva.negocioId = this.negocioId;
      this.cargarDatosNegocio();
    }
    
    // Si el modal se abrió y tenemos un negocioId válido
    if (changes['mostrarModal'] && this.mostrarModal && this.negocioId && this.negocioId !== '') {
      console.log('Modal abierto con negocioId:', this.negocioId); // DEBUG
      this.reserva.negocioId = this.negocioId;
      this.cargarDatosNegocio();
    }
  }

  cargarDatosNegocio() {
    if (!this.negocioId || this.negocioId === '') {
      console.log('No hay negocioId válido para cargar datos'); // DEBUG
      return;
    }

    this.isLoading = true;
    
    console.log('Cargando datos para negocio ID:', this.negocioId); // DEBUG
    
    // Cargar datos del negocio
    this.negociosService.getNegocioById(this.negocioId).subscribe({
      next: (negocio) => {
        this.negocio = negocio || null;
        console.log('Negocio encontrado:', negocio); // DEBUG
      },
      error: (error) => {
        console.error('Error cargando negocio:', error); // DEBUG
        this.negocio = null;
      }
    });

    // Cargar servicios del negocio
    this.negociosService.getServiciosByNegocio(this.negocioId).subscribe({
      next: (servicios) => {
        console.log('Servicios encontrados para negocio', this.negocioId, ':', servicios); // DEBUG
        this.servicios = servicios.filter(s => s.activo);
        console.log('Servicios activos filtrados:', this.servicios); // DEBUG
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando servicios:', error); // DEBUG
        this.servicios = [];
        this.isLoading = false;
      }
    });
  }

  // PASO 1: Seleccionar servicio
  seleccionarServicio(servicio: Servicio) {
    this.servicioSeleccionado = servicio;
    this.reserva.servicioId = servicio.id;
    this.errorMessage = '';
    this.siguientePaso();
  }

  // PASO 2: Seleccionar fecha
  cargarFechasDisponibles() {
    this.cargandoFechas = true;
    this.reservasService.getFechasDisponibles(this.negocioId).subscribe(fechas => {
      this.fechasDisponibles = fechas;
      this.cargandoFechas = false;
    });
  }

  seleccionarFecha(fecha: Date) {
    this.fechaSeleccionada = fecha;
    this.reserva.fecha = fecha;
    this.errorMessage = '';
    this.siguientePaso();
  }

  // PASO 3: Seleccionar horario
  cargarHorariosDisponibles() {
    if (!this.fechaSeleccionada || !this.servicioSeleccionado) return;

    this.cargandoHorarios = true;
    this.reservasService.getHorariosDisponibles(
      this.negocioId,
      this.servicioSeleccionado.id,
      this.fechaSeleccionada
    ).subscribe(horarios => {
      this.horariosDisponibles = horarios;
      this.cargandoHorarios = false;
    });
  }

  seleccionarHorario(horario: HorarioDisponible) {
    if (!horario.disponible) return;
    
    this.horarioSeleccionado = horario;
    this.reserva.hora = horario.hora;
    this.errorMessage = '';
    this.siguientePaso();
  }

  // PASO 4: Confirmar reserva
  confirmarReserva() {
    console.log('Iniciando confirmación de reserva'); // DEBUG
    
    if (!this.validarReserva()) {
      console.log('Validación falló'); // DEBUG
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Enviando reserva:', this.reserva); // DEBUG

    this.reservasService.crearReserva(this.reserva).subscribe({
      next: (cita) => {
        console.log('Reserva creada exitosamente:', cita); // DEBUG
        this.isLoading = false;
        this.successMessage = '¡Reserva creada exitosamente!';
        
        console.log('Emitiendo evento reservaCreada'); // DEBUG
        this.reservaCreada.emit(cita);
        
        setTimeout(() => {
          console.log('Cerrando modal después de 2 segundos'); // DEBUG
          this.cerrarReservas();
        }, 2000);
      },
      error: (error) => {
        console.error('Error al crear reserva:', error); // DEBUG
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al crear la reserva';
      }
    });
  }

  // Navegación entre pasos
  siguientePaso() {
    if (this.paso < 4) {
      this.paso++;
      
      // Cargar datos según el paso
      if (this.paso === 2) {
        this.cargarFechasDisponibles();
      } else if (this.paso === 3) {
        this.cargarHorariosDisponibles();
      }
    }
  }

  pasoAnterior() {
    if (this.paso > 1) {
      this.paso--;
      this.errorMessage = '';
    }
  }

  irAPaso(numeroPaso: number) {
    if (numeroPaso <= this.paso && numeroPaso >= 1) {
      this.paso = numeroPaso;
      this.errorMessage = '';
    }
  }

  // Validaciones
  validarReserva(): boolean {
    if (!this.servicioSeleccionado) {
      this.errorMessage = 'Debe seleccionar un servicio';
      return false;
    }

    if (!this.fechaSeleccionada) {
      this.errorMessage = 'Debe seleccionar una fecha';
      return false;
    }

    if (!this.horarioSeleccionado) {
      this.errorMessage = 'Debe seleccionar un horario';
      return false;
    }

    return true;
  }

  // Utilidades
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

  esFechaHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  esFechaManana(fecha: Date): boolean {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return fecha.toDateString() === manana.toDateString();
  }

  getPrecioTotal(): number {
    return this.horarioSeleccionado?.precio || 0;
  }

  getDuracionTotal(): number {
    return this.horarioSeleccionado?.duracion || 0;
  }

  // Control del modal
  cerrarReservas() {
    this.resetearFormulario();
    this.cerrarModal.emit();
  }

  resetearFormulario() {
    this.paso = 1;
    this.servicioSeleccionado = null;
    this.fechaSeleccionada = null;
    this.horarioSeleccionado = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.reserva = {
      clienteId: this.authService.getCurrentUser()?.id || '',
      negocioId: this.negocioId,
      servicioId: '',
      fecha: new Date(),
      hora: '',
      notas: ''
    };
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.cerrarReservas();
    }
  }
}