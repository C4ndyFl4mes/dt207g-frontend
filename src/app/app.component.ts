import { Component, HostListener, OnInit, signal } from '@angular/core';
import { SidebarMenuComponent } from "./partials/sidebar-menu/sidebar-menu.component";
import { MainComponent } from "./partials/main/main.component";

@Component({
  selector: 'app-root',
  imports: [SidebarMenuComponent, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'cafe';
  isSidebarMenuCollapsed = signal<boolean>(true);
  screenWidth = signal<number>(window.innerWidth);

  @HostListener("window:resize")
    onResize() {
      this.screenWidth.set(window.innerWidth);
      if (this.screenWidth() < 768) {
        this.isSidebarMenuCollapsed.set(true);
      }
    }

  ngOnInit(): void {
    this.isSidebarMenuCollapsed.set(this.screenWidth() < 1200);
  }
  
  changeIsSidebarMenuCollapsed(isSidebarMenuCollapsed: boolean): void {
    this.isSidebarMenuCollapsed.set(isSidebarMenuCollapsed);
  }
}
