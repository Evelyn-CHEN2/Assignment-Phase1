import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Register } from './components/register/register';
import { Account } from './components/account/account';
import { Users } from './components/users/users'
import { Groups } from './components/groups/groups'
import { authGuard } from './guards/auth-guard';
import { adminAuthGuard } from './guards/admin-auth-guard';
import { GroupForm } from './components/group-form/group-form';
import { Chatwindow } from './components/chatwindow/chatwindow';

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
                path: '', component: Users
            },
            {
                path: 'users', component: Users, canActivate: [adminAuthGuard]
            },
            {
                path: 'groups', component: Groups
            },
            {
                path: 'group-form', component: GroupForm, canActivate: [adminAuthGuard]
            },
            {
                path: 'notifications', component: Users, canActivate: [adminAuthGuard]
            }
        ]
    },
    {
        path: 'account', component: Account, canActivate: [authGuard]
    },
    {
        path: 'account/:id', component: Account, canActivate: [authGuard, adminAuthGuard],
    },
    {
        path: 'chatwindow/:id', component: Chatwindow, canActivate: [authGuard]
    }
];
