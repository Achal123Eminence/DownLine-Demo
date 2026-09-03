import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Downline } from './pages/downline/downline';
import { CreateUser } from './pages/create-user/create-user';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'login', component: Login},
  { path: 'downline', component: Downline },
  { path: 'downline/:userId', component: Downline},
  { path: 'create-user', component: CreateUser},
];
