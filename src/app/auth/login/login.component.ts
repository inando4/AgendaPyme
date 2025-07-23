import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../../shared/models/user';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: '',
    password: '',
    tipo: 'cliente'
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user) {
          // Mostrar mensaje de éxito brevemente
          this.successMessage = `¡Login exitoso! Bienvenido ${user.nombre}`;
          
          // Redirigir según el tipo de usuario después de 1.5 segundos
          setTimeout(() => {
            if (user.tipo === 'cliente') {
              this.router.navigate(['/cliente/dashboard']);
            } else if (user.tipo === 'negocio') {
              this.router.navigate(['/negocio/dashboard']);
            }
          }, 1500);
          
          // Limpiar el formulario
          this.loginData = {
            email: '',
            password: '',
            tipo: 'cliente'
          };
        } else {
          this.errorMessage = 'Credenciales incorrectas';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al iniciar sesión';
        console.error('Login error:', error);
      }
    });
  }

  switchUserType(tipo: 'cliente' | 'negocio') {
    this.loginData.tipo = tipo;
    this.errorMessage = '';
    this.successMessage = '';
  }

  logout() {
    this.authService.logout();
    this.successMessage = '';
    this.errorMessage = '';
  }
}
