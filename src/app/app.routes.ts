import { Routes } from '@angular/router';
import { LoginComponent } from './components/login-component/login-component';
import { ProductListComponent } from './components/product-list.component/product-list.component';
import { RegisterComponent } from './components/register-component/register-component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'register', component: RegisterComponent }
];