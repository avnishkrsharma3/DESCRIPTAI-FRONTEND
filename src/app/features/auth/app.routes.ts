import { Routes } from '@angular/router';
import { LoginComponent } from './login/login-component';
import { ProductListComponent } from '../products/product-list.component';
import { RegisterComponent } from './register/register-component';
import { authGuard } from '../../core/guards/auth-guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },


  // protected route
  { path: 'products',  component: ProductListComponent, canActivate:[authGuard] },
  { path: 'description',  component: ProductListComponent, canActivate:[authGuard] }


];