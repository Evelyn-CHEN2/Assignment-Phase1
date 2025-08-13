import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Register } from './components/register/register';
import { Account } from './components/account/account';
import { Users } from './components/users/users'
import { Admins } from './components/admins/admins'
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: '', component: Login
    },
    {
        path: 'login', component: Login
    },
    {
        path: 'register', component: Register
    },
    {
        path: 'dashboard', component: Dashboard, canActivate: [authGuard],
        children: [
            {
                path: 'users', component: Users
            },
            {
                path: 'admins', component: Admins
            },
            {
                path: '', component: Users
            }
        ]
    },
    {
        path: 'account', component: Account, canActivate: [authGuard]
    }
];
