import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  isSidebarMenuCollapsed = input.required<boolean>();
  screenWidth = input.required<number>();
  sizeClass = computed(() => {
    const isSidebarMenuCollapsed = this.isSidebarMenuCollapsed();
    if (isSidebarMenuCollapsed) {
      return "";
    }
    return this.screenWidth() > 768 ? "body-trimmed" : "body-md-screen";
  });

}
