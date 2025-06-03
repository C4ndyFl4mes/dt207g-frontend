import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CafeMenuComponent } from './pages/cafe-menu/cafe-menu.component';
import { CafeMenuDetailsComponent } from './pages/cafe-menu-details/cafe-menu-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
    { path: "home", component: HomeComponent },
    { path: "menu", component: CafeMenuComponent },
    { path: "menu/:categoryslug", component: CafeMenuComponent },
    { path: "menu/:categoryslug/:itemslug", component: CafeMenuDetailsComponent },
    { path: "dashboard", component: DashboardComponent },
    { path: "", pathMatch: "full", redirectTo: "home" }
];
