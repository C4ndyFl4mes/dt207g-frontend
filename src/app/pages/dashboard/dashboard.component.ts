import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  items = [
    {
      routeLink: "anvandare",
      icon: "users.svg",
      label: "Användare"
    },
    {
      routeLink: "meny",
      icon: "menu.svg",
      label: "Meny"
    }
  ];
}
