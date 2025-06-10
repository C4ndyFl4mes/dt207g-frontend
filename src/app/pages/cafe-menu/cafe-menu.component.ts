import { Component, OnInit, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Category } from '../../models/category';
import { CafeService } from '../../services/cafe.service';
import { CommonModule } from '@angular/common';
import { Pagination } from '../../models/pagination';
import { Product } from '../../models/product';
import { switchMap, tap } from 'rxjs/operators';
import { Response } from '../../models/response';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cafe-menu',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './cafe-menu.component.html',
  styleUrl: './cafe-menu.component.scss'
})
export class CafeMenuComponent implements OnInit {

  activeCategorySelection = "";
  activeCategorySlug = signal<string | null>(""); // Den nuvarande kategorin.
  categories = signal<Array<Category>>([]); // Array av kategorier.
  products = signal<Array<Product>>([]); // Array av produkter.

  isCategoriesDown = signal<boolean>(true); // Används för kategorilistans dropdown.
  // Paginationsinställningar.
  pagination = signal<Pagination>({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 1
  });
  isLoading = signal(false); // Används för att skydda från att ändra kategori innan innehåll har hämtats vid föregående kategori.


  constructor(private router: Router, private route: ActivatedRoute, private cafeService: CafeService) { }

  ngOnInit(): void {
    // Hämtar kategorier.
    this.cafeService.getCategories().subscribe((data) => {
      this.categories.set(data.data.categories);
    });

    // Hämtar param från url därefter kallar på loadProducts.
    this.route.paramMap.subscribe(params => {
      const category = params.get("categoryslug");
      this.activeCategorySlug.set(category);
      this.pagination.update(p => ({ ...p, currentPage: 1 }));
      this.loadProducts();
      this.navigate();
    });

  }

  /**
   * Hämtar produkter.
   */
  loadProducts(): void {
    const category = this.activeCategorySlug();
    const page = this.pagination().currentPage;
    this.isLoading.set(true); 

    // Bereonde på en kategori är vald eller inte, antingen hämtar alla produkter eller enbart från en kategori.
    const fetch = category
      ? this.cafeService.getProductsFromCategory(category, page, this.pagination().pageSize)
      : this.cafeService.getAllProducts(page, this.pagination().pageSize);

      // Utför själva hämtningen.
    fetch.subscribe({
      next: (response) => {
        this.products.set(response.data.products);
        this.pagination.set(response.data.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Navigerar mellan kategorier.
   */
  navigate(): void {
    this.router.navigate(['/meny', this.activeCategorySelection]);
  }

  /**
   * Föregående menysida.
   */
  previous(): void {
    const current = this.pagination().currentPage;
    const total = this.pagination().totalPages;
    const newPage = current === 1 ? total : current - 1;

    this.pagination.update(p => ({ ...p, currentPage: newPage }));
    this.loadProducts();
  }

  /**
   * Nästa menysida.
   */
  next(): void {
    const current = this.pagination().currentPage;
    const total = this.pagination().totalPages;
    const newPage = current === total ? 1 : current + 1;

    this.pagination.update(p => ({ ...p, currentPage: newPage }));
    this.loadProducts();
  }

  toggleCategoriesList(): void {
    this.isCategoriesDown.set(!this.isCategoriesDown());
  }

  productDetails(item: Product) {
    this.router.navigate(['/meny', this.activeCategorySlug() || item.inCategory.name.slug, item.name.slug]);
  }

  setRating(rating: number): string {
    switch (Math.round(rating * 2) / 2) {
      case 0:
        return "☆☆☆☆☆";
      case 0.5:
        return "⯪☆☆☆☆";
      case 1.0:
        return "★☆☆☆☆";
      case 1.5:
        return "★⯪☆☆☆";
      case 2.0:
        return "★★☆☆☆";
      case 2.5:
        return "★★⯪☆☆";
      case 3.0:
        return "★★★☆☆";
      case 3.5:
        return "★★★⯪☆";
      case 4.0:
        return "★★★★☆";
      case 4.5:
        return "★★★★⯪";
      case 5.0:
        return "★★★★★";
      default:
        return "error";
    }
  }

  setTitle(name: string): string {
    return `Öppna recensioner för ${name}`;
  }

}
