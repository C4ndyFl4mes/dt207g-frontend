import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cafe-menu-details',
  imports: [],
  templateUrl: './cafe-menu-details.component.html',
  styleUrl: './cafe-menu-details.component.scss'
})
export class CafeMenuDetailsComponent implements OnInit {

  categorySlug = signal<string>("");
  itemSlug = signal<string>("");

  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    this.categorySlug.set(this.route.snapshot.paramMap.get('categoryslug')!);
    this.itemSlug.set( this.route.snapshot.paramMap.get('itemslug')!);
  }

}
