import { Routes } from '@angular/router';
import { LoginComponent } from './login/login-component';
import { ProductListComponent } from '../products/product-list.component';
import { RegisterComponent } from './register/register-component';
import { authGuard } from '../../core/guards/auth-guard';
import { DescriptionGenerate } from '../descriptions/generate/description-generate/description-generate';
import { DescriptionGeneration } from '../descriptions/generate/description-generation/description-generation';
import { ApproveDashboard } from '../approve-dashboard/approve-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },


  // protected route
  { path: 'products',  component: ProductListComponent, canActivate:[authGuard] },
  { path: 'description',  component: ProductListComponent, canActivate:[authGuard] },
  { path: 'description-generate', component: DescriptionGenerate, canActivate:[authGuard]},
  { path: 'description-generation', component: DescriptionGeneration, canActivate:[authGuard]},
  { path: 'approve-dashboard', component:ApproveDashboard, canActivate:[authGuard]}

];