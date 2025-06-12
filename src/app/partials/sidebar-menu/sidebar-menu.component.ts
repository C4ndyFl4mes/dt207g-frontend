import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-sidebar-menu',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss'
})
export class SidebarMenuComponent implements OnInit {
  isSidebarMenuCollapsed = input.required<boolean>();
  changeIsSidebarMenuCollapsed = output<boolean>();

  isLoggedIn = signal<boolean>(false);
  userInfo = signal<User | null>(null);

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
    },
    {
      routeLink: "konto",
      icon: "fa-solid fa-user-secret",
      label: "Inte inloggad"
    }
  ];


  /**
   * 
   * @param accountService - hanterar konton.
   */
  constructor(private accountService: AccountService) { }

  /**
   * Kollar om användaren är inloggad eller inte. Detta används mest för att signalera vem som är inloggad. Syns nere till vänster.
   */
  ngOnInit(): void {
    this.accountService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn.set(loggedIn);

      this.userInfo.set(this.accountService.getUserInfo());

      // Används för att antingen ersätta eller pusha beroende på om index finns eller inte.
      const index = this.items.findIndex(i => i.routeLink === 'konto');

      // Det som visar att användaren är inloggad.
      const item = {
        routeLink: "konto",
        icon: loggedIn ? "fa-solid fa-user" : "fa-solid fa-user-secret",
        label: loggedIn ? `${this.userInfo()?.firstname} ${this.userInfo()?.lastname}` : "Inte inloggad"
      };

      // Ersätter eller lägger till item. Nu visas vem som är inloggad nere till vänster.
      if (index >= 0) {
        this.items[index] = item;
      } else {
        this.items.push(item);
      }
    });
  }

  /**
   * Automatiskt fäller ihop menyn när användaren navigerar mellan sidor.
   */
  autoHideWhenSelectedOnSmallScreen(): void {
    if (window.innerWidth < 700) {
      this.changeIsSidebarMenuCollapsed.emit(!this.isSidebarMenuCollapsed());
    }
  }

  canSeeItem(link: string): boolean {
    if (link === "instrumentpanelen") {
      return this.userInfo()?.role === "admin" || this.userInfo()?.role === "root";

    } else {
      return true;
    }
  }
  toggleCollapse(): void {
    this.changeIsSidebarMenuCollapsed.emit(!this.isSidebarMenuCollapsed());
  }

  closeSidenav(): void {
    this.changeIsSidebarMenuCollapsed.emit(true);
  }
}
