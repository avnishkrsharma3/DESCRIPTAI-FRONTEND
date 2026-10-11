import { Routes } from '@angular/router';
import { LoginComponent } from './login/login-component';
import { ProductListComponent } from '../products/product-list.component';
import { RegisterComponent } from './register/register-component';
import { authGuard } from '../../core/guards/auth-guard';
import { DescriptionGenerate } from '../descriptions/generate/description-generate/description-generate';
import { DescriptionGeneration } from '../descriptions/generate/description-generation/description-generation';
import { ApproveDashboard } from '../approve-dashboard/approve-dashboard';
import { Home } from '../home/home';
import { AppShell } from '../../core/layout/app-shell';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'products', component: ProductListComponent },
      { path: 'description', redirectTo: 'products', pathMatch: 'full' },
      { path: 'description-generate', component: DescriptionGenerate },
      { path: 'description-generation', component: DescriptionGeneration },
      { path: 'approve-dashboard', component: ApproveDashboard },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];