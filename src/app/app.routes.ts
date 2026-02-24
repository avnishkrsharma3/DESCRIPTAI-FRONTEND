import { Routes } from '@angular/router';
import { LoginComponent } from './components/login-component/login-component';
import { ProductListComponent } from './components/product-list.component/product-list.component';
import { RegisterComponent } from './components/register-component/register-component';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },


  // protected route
  { path: 'products',  component: ProductListComponent, canActivate:[authGuard] },
  { path: 'description',  component: ProductListComponent, canActivate:[authGuard] }


];