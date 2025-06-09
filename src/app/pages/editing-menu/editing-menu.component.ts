import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product';
import { CafeService } from '../../services/cafe.service';
import { Category } from '../../models/category';
import { Pagination } from '../../models/pagination';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-editing-menu',
  imports: [FormsModule],
  templateUrl: './editing-menu.component.html',
  styleUrl: './editing-menu.component.scss'
})
export class EditingMenuComponent implements OnInit {

  id: string = "";
  categoryID: string = "";
  onProducts = signal<boolean>(true);
  categories = signal<Array<Category>>([]);
  categoriesPag = signal<Array<Category>>([]);
  products = signal<Array<Product>>([]);

  categoryFilter = "";

  pagination = signal<Pagination>({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 1
  });

  categoryPagination = signal<Pagination>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  isLoading = signal(false);

  product = {
    name: "",
    categoryID: "",
    price: "",
    description: ""
  };

  category = {
    name: "",
  }

  constructor(private route: Router, private activeRoute: ActivatedRoute, private cafeService: CafeService) { }

  ngOnInit(): void {
    this.cafeService.getCategories().subscribe((response) => {
      this.categories.set(response.data.categories);
      this.loadProducts();
      this.loadCategories();
    });
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.cafeService.getCategoriesPag(this.categoryPagination().currentPage, this.categoryPagination().pageSize).subscribe({
      next: (response) => {
        this.categoriesPag.set(response.data.categories);
        this.categoryPagination.set(response.data.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
  /**
   * Hämtar produkter.
   */
  loadProducts(): void {
    const category = this.categoryFilter;
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

  filter(): void {
    this.loadProducts();
  }


  /**
  * Föregående menysida.
  */
  previous(): void {
    const current = this.onProducts() ? this.pagination().currentPage : this.categoryPagination().currentPage;
    const total = this.onProducts() ? this.pagination().totalPages : this.categoryPagination().totalPages;
    const newPage = current === 1 ? total : current - 1;


    if (this.onProducts()) {
      this.pagination.update(p => ({ ...p, currentPage: newPage }));
      this.loadProducts();
    } else {
      this.categoryPagination.update(p => ({ ...p, currentPage: newPage }));
      this.loadCategories();
    }
  }

  /**
   * Nästa menysida.
   */
  next(): void {
    const current = this.onProducts() ? this.pagination().currentPage : this.categoryPagination().currentPage;
    const total = this.onProducts() ? this.pagination().totalPages : this.categoryPagination().totalPages;
    const newPage = current === total ? 1 : current + 1;

    if (this.onProducts()) {
      this.pagination.update(p => ({ ...p, currentPage: newPage }));
      this.loadProducts();
    } else {
      this.categoryPagination.update(p => ({ ...p, currentPage: newPage }));
      this.loadCategories();

    }
  }

  markProduct(itemdID: string, item: Product): void {
    this.id = itemdID;
    this.product = {
      name: item.name.normal,
      price: String(item.price),
      description: item.description,
      categoryID: item.inCategory.id
    }
  }

  createProduct(): void {
    const product = this.product;
    this.cafeService.createProduct(product.name, Number(product.price), product.description, product.categoryID).subscribe((response) => {
      console.log(response);
      this.loadProducts();
      this.id = "";
      this.product = {
        name: "",
        price: "",
        description: "",
        categoryID: ""
      };
    });
  }

  editProduct(): void {
    const product = this.product;
    this.cafeService.editProduct(this.id, product.name, Number(product.price), product.description, product.categoryID).subscribe((response) => {
      console.log(response);
      this.loadProducts();
      this.id = "";
      this.product = {
        name: "",
        price: "",
        description: "",
        categoryID: ""
      };
    });
  }

  deleteProduct(id: string): void {
    this.cafeService.deleteProduct(id).subscribe((response) => {
      console.log(response);
      this.loadProducts();
    });
  }

  markCategory(id: string): void {
    this.category.name = this.categoriesPag().filter(category => category.id === id)[0].name.normal;
    this.categoryID = id;
  }

  createCategory(): void {
    this.cafeService.createCategory(this.category.name).subscribe((response) => {
      console.log(response);
      this.loadCategories();
      this.categoryID = "";
      this.category.name = "";
    });
  }

  editCategory(): void {
    this.cafeService.editCategory(this.categoryID, this.category.name).subscribe((response) => {
      console.log(response);
      this.loadCategories();
      this.categoryID = "";
      this.category.name = "";
    });
  }

  deleteCategory(id: string): void {
    this.cafeService.deleteCategory(id).subscribe((response) => {
      console.log(response);
      this.loadCategories();
    });
  }

  back(): void {
    this.route.navigate([".."], { relativeTo: this.activeRoute });
  }



}
