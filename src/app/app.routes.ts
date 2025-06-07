import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CafeMenuComponent } from './pages/cafe-menu/cafe-menu.component';
import { CafeMenuDetailsComponent } from './pages/cafe-menu-details/cafe-menu-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AccountComponent } from './pages/account/account.component';
import { AuthGuard } from './guards/auth.guard';
import { UsersComponent } from './pages/users/users.component';
import { EditingMenuComponent } from './pages/editing-menu/editing-menu.component';
import { ServicesComponent } from './pages/services/services.component';

export const routes: Routes = [
    { path: "hem", component: HomeComponent },
    { path: "konto", component: AccountComponent },
    { path: "meny", component: CafeMenuComponent },
    { path: "meny/:categoryslug", component: CafeMenuComponent },
    { path: "meny/:categoryslug/:itemslug", component: CafeMenuDetailsComponent },
    { path: "instrumentpanelen", component: DashboardComponent, canActivate: [AuthGuard]  },
    { path: "instrumentpanelen/anvandare", component: UsersComponent, canActivate: [AuthGuard] },
    { path: "instrumentpanelen/meny", component: EditingMenuComponent, canActivate: [AuthGuard] },
    { path: "instrumentpanelen/services", component: ServicesComponent, canActivate: [AuthGuard] },
    { path: "", pathMatch: "full", redirectTo: "hem" }
];
