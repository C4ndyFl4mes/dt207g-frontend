import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CafeMenuComponent } from './pages/cafe-menu/cafe-menu.component';
import { CafeMenuDetailsComponent } from './pages/cafe-menu-details/cafe-menu-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AccountComponent } from './pages/account/account.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: "hem", component: HomeComponent },
    { path: "konto", component: AccountComponent },
    { path: "meny", component: CafeMenuComponent },
    { path: "meny/:categoryslug", component: CafeMenuComponent },
    { path: "meny/:categoryslug/:itemslug", component: CafeMenuDetailsComponent },
    { path: "instrumentpanelen", component: DashboardComponent, canActivate: [AuthGuard]  },
    { path: "", pathMatch: "full", redirectTo: "hem" }
];
