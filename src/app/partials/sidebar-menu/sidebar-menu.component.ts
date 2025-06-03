import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-menu',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss'
})
export class SidebarMenuComponent {
  isSidebarMenuCollapsed = input.required<boolean>();
  changeIsSidebarMenuCollapsed = output<boolean>();

  items = [
    {
      routeLink: "hem",
      icon: "fa-solid fa-house",
      label: "Hem"
    },
    {
      routeLink: "meny",
      icon: "fa-solid fa-list",
      label: "Meny"
    },
    {
      routeLink: "instrumentpanelen",
      icon: "fa-solid fa-gear",
      label: "Instrumentpanelen"
    }
  ];

  toggleCollapse(): void {
    this.changeIsSidebarMenuCollapsed.emit(!this.isSidebarMenuCollapsed());
  }

  closeSidenav(): void {
    this.changeIsSidebarMenuCollapsed.emit(true);
  }
}
