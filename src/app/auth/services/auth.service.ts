import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, UserCliente, UserNegocio, LoginRequest, RegisterRequest } from '../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Datos mock para pruebas
  private mockUsers: (UserCliente | UserNegocio)[] = [
    {
      id: '1',
      email: 'cliente@test.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '987654321',
      tipo: 'cliente',
      fechaRegistro: new Date()
    },
    {
      id: '2',
      email: 'negocio@test.com',
      nombre: 'María',
      apellido: 'García',
      telefono: '987654322',
      tipo: 'negocio',
      nombreNegocio: 'Peluquería Bella',
      descripcion: 'Servicios de belleza y cuidado personal',
      direccion: 'Av. Principal 123, Lima',
      categoria: 'Belleza',
      planSuscripcion: 'gratuito',
      fechaRegistro: new Date()
    }
  ];

  constructor() {
    // Verificar si hay un usuario logueado en localStorage al inicializar
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        // Si hay error al parsear, limpiar localStorage
        this.logout();
      }
    }
  }

  login(loginData: LoginRequest): Observable<User | null> {
    // Simular autenticación con datos mock
    const user = this.mockUsers.find(u => 
      u.email === loginData.email && u.tipo === loginData.tipo
    );

    if (user) {
      // Simular verificación de password (en producción sería validado en el backend)
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', 'mock-jwt-token');
      this.currentUserSubject.next(user);
      return of(user);
    }

    return of(null);
  }

  // AGREGAR ESTE MÉTODO
  checkEmailExists(email: string): boolean {
    return this.mockUsers.some(user => user.email === email);
  }

  // ACTUALIZAR EL MÉTODO REGISTER - reemplazar el método completo
  register(registerData: RegisterRequest): Observable<User | null> {
    // Verificar si el email ya existe
    if (this.checkEmailExists(registerData.email)) {
      return of(null); // Email ya existe
    }

    // Generar ID único
    const newId = (this.mockUsers.length + 1).toString();

    // Crear nuevo usuario según el tipo
    let newUser: UserCliente | UserNegocio;

    if (registerData.tipo === 'cliente') {
      newUser = {
        id: newId,
        email: registerData.email,
        nombre: registerData.nombre,
        apellido: registerData.apellido,
        telefono: registerData.telefono,
        tipo: 'cliente',
        fechaRegistro: new Date()
      };
    } else {
      newUser = {
        id: newId,
        email: registerData.email,
        nombre: registerData.nombre,
        apellido: registerData.apellido,
        telefono: registerData.telefono,
        tipo: 'negocio',
        nombreNegocio: registerData.nombreNegocio || '',
        descripcion: registerData.descripcion || '',
        direccion: registerData.direccion || '',
        categoria: registerData.categoria || '',
        planSuscripcion: 'gratuito',
        fechaRegistro: new Date()
      };
    }

    // Agregar a la lista mock
    this.mockUsers.push(newUser);
    
    // Auto-login después del registro
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('authToken', 'mock-jwt-token');
    this.currentUserSubject.next(newUser);

    return of(newUser);
  }

  // AGREGAR ESTOS MÉTODOS
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    return !!(token && user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  isCliente(): boolean {
    const user = this.getCurrentUser();
    return user?.tipo === 'cliente';
  }

  isNegocio(): boolean {
    const user = this.getCurrentUser();
    return user?.tipo === 'negocio';
  }
}
