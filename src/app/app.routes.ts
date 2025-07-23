import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  
  // Rutas de autenticación
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./auth/register/register.component').then(c => c.RegisterComponent)
  },
  
  // Rutas protegidas - Cliente
  {
    path: 'cliente/dashboard',
    loadComponent: () => import('./cliente/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },
  
  // Rutas protegidas - Negocio
  {
    path: 'negocio/dashboard',
    loadComponent: () => import('./negocio/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },
  
  // Ruta de error 404
  { path: '**', redirectTo: '/auth/login' }
];