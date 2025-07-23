import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../../shared/models/user';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    tipo: 'cliente'
  };

  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Lista de categorías para negocios
  categorias = [
    'Belleza y Cuidado Personal',
    'Salud y Bienestar',
    'Servicios Profesionales',
    'Educación y Capacitación',
    'Reparación y Mantenimiento',
    'Servicios a Domicilio',
    'Consultoría',
    'Otros'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    // Validaciones básicas
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user) {
          this.successMessage = `¡Registro exitoso! Bienvenido ${user.nombre}`;
          
          // Limpiar formulario
          this.resetForm();
          
          // Redirigir según el tipo de usuario después de 2 segundos
          setTimeout(() => {
            if (user.tipo === 'cliente') {
              this.router.navigate(['/cliente/dashboard']);
            } else if (user.tipo === 'negocio') {
              this.router.navigate(['/negocio/dashboard']);
            }
          }, 2000);
        } else {
          this.errorMessage = 'Error al registrar usuario';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al registrar usuario';
        console.error('Register error:', error);
      }
    });
  }

  validateForm(): boolean {
    // Validar campos básicos
    if (!this.registerData.email || !this.registerData.password || 
        !this.registerData.nombre || !this.registerData.apellido || 
        !this.registerData.telefono) {
      this.errorMessage = 'Por favor complete todos los campos obligatorios';
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage = 'Por favor ingrese un email válido';
      return false;
    }

    // Validar contraseña
    if (this.registerData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    // Validar confirmación de contraseña
    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return false;
    }

    // Validar teléfono (solo números y al menos 9 dígitos)
    const phoneRegex = /^\d{9,}$/;
    if (!phoneRegex.test(this.registerData.telefono)) {
      this.errorMessage = 'El teléfono debe tener al menos 9 dígitos';
      return false;
    }

    // AGREGAR ESTA VALIDACIÓN - verificar email duplicado
    if (this.authService.checkEmailExists(this.registerData.email)) {
      this.errorMessage = 'Este email ya está registrado';
      return false;
    }

    // Validaciones específicas para negocio
    if (this.registerData.tipo === 'negocio') {
      if (!this.registerData.nombreNegocio || !this.registerData.direccion || 
          !this.registerData.categoria) {
        this.errorMessage = 'Complete todos los campos del negocio';
        return false;
      }
    }

    return true;
  }

  switchUserType(tipo: 'cliente' | 'negocio') {
    this.registerData.tipo = tipo;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Limpiar campos específicos del negocio si cambia a cliente
    if (tipo === 'cliente') {
      this.registerData.nombreNegocio = '';
      this.registerData.descripcion = '';
      this.registerData.direccion = '';
      this.registerData.categoria = '';
    }
  }

  resetForm() {
    this.registerData = {
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      telefono: '',
      tipo: 'cliente'
    };
    this.confirmPassword = '';
  }
}
