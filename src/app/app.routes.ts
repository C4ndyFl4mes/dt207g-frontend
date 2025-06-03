import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CafeMenuComponent } from './pages/cafe-menu/cafe-menu.component';
import { CafeMenuDetailsComponent } from './pages/cafe-menu-details/cafe-menu-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
    { path: "hem", component: HomeComponent },
    { path: "meny", component: CafeMenuComponent },
    { path: "meny/:categoryslug", component: CafeMenuComponent },
    { path: "meny/:categoryslug/:itemslug", component: CafeMenuDetailsComponent },
    { path: "instrumentpanelen", component: DashboardComponent },
    { path: "", pathMatch: "full", redirectTo: "hem" }
];
