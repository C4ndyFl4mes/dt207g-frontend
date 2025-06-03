import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cafe-menu',
  imports: [],
  templateUrl: './cafe-menu.component.html',
  styleUrl: './cafe-menu.component.scss'
})
export class CafeMenuComponent implements OnInit {

  categorySlug = signal<string>("");


  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.categorySlug.set(this.route.snapshot.paramMap.get('categoryslug')!);
  }

}
