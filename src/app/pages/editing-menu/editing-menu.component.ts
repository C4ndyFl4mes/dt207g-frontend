import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product';
import { CafeService } from '../../services/cafe.service';
import { Category } from '../../models/category';
import { Pagination } from '../../models/pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { FormMessageComponent } from "../../partials/form-message/form-message.component";
import { Response } from '../../models/response';
import { Validation } from '../../validation';


@Component({
  selector: 'app-editing-menu',
  imports: [FormsModule, FormMessageComponent],
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

  errors = signal<Array<string>>([]); // Lagrar felmeddelanden för inmatningsfälten.

  // Startvärde för success meddelandet.
  success = signal<Response<string>>({
    success: false,
    data: "",
    message: ""
  });

  constructor(private route: Router, private activeRoute: ActivatedRoute, private cafeService: CafeService) { }

  ngOnInit(): void {
    this.cafeService.getCategories().subscribe((response) => {
      this.categories.set(response.data.categories);
      this.loadProducts();
      this.loadCategories();
    });
  }

  /**
   * Hämtar kategorier.
   */
  loadCategories(): void {
    this.isLoading.set(true);
    this.cafeService.getCategories(this.categoryPagination().currentPage, this.categoryPagination().pageSize).subscribe({
      next: (response) => {
        this.categoriesPag.set(response.data.categories);
        this.categoryPagination.set(response.data.pagination!); // ! ska fungera eftersom vi skickar med currentPage och pageSize som ska alltid ge oss pagination.
        if (this.categoryPagination().totalPages === 0) this.categoryPagination().totalPages = 1;
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
    this.cafeService.getCategories().subscribe((response) => {
      this.categories.set(response.data.categories);
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
        if (this.pagination().totalPages === 0) this.pagination().totalPages = 1;
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errors().push(error.error.message);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Laddar om produkter när filter ändras.
   */
  filter(): void {
    this.loadProducts();
  }

  cancel(): void {
    this.category.name = "";
    this.categoryID = "";
    this.id = "";
    this.product = {
      name: "",
      price: "",
      description: "",
      categoryID: ""
    }
    this.errors.set([]);
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

  /**
   * Markerar en produkt för ändring.
   * @param itemdID - vilken produkt.
   * @param item - produkten.
   */
  markProduct(itemdID: string, item: Product): void {
    this.id = itemdID;
    this.product = {
      name: item.name.normal,
      price: String(item.price),
      description: item.description,
      categoryID: item.inCategory.id
    }
  }

  /**
   * Skapar en produkt.
   */
  createProduct(): void {
    const product = this.product;
    this.success().success = false;
    this.errors.set([]);

    const nameRange = Validation.range<string>(product.name, "Produktnamn", 2, 100);
    if (nameRange) this.errors().push(nameRange);

    const priceFormat = Validation.correctPriceFormat(product.price);
    if (priceFormat) this.errors().push(priceFormat);

    const descriptionRange = Validation.range(product.description, "Produktbeskrivning", 1, 2000);
    if (descriptionRange) this.errors().push(descriptionRange);
    const description = Validation.filterPossibleInjection(product.description, "Produktbeskrivning");
    if (description) this.errors().push(description);

    if (this.errors().length === 0) {
      this.cafeService.createProduct(product.name, Number(product.price), product.description, product.categoryID).subscribe({
        next: (response) => {
          this.success.set({
            success: response.success,
            data: "",
            message: "Produkten skapades."
          });
          this.loadProducts();
          this.id = "";
          this.product = {
            name: "",
            price: "",
            description: "",
            categoryID: ""
          };
          setTimeout(() => {
            this.success.set({
              success: false,
              data: "",
              message: ""
            });
          }, 1500);
        },
        error: (error) => {
          this.errors().push(error.error.message);
        }
      });
    }
  }

  /**
   * Ändrar en produkt.
   */
  editProduct(): void {
    const product = this.product;
    this.success().success = false;
    this.errors.set([]);

    const nameRange = Validation.range<string>(product.name, "Produktnamn", 2, 100);
    if (nameRange) this.errors().push(nameRange);

    const priceFormat = Validation.correctPriceFormat(product.price);
    if (priceFormat) this.errors().push(priceFormat);

    const descriptionRange = Validation.range(product.description, "Produktbeskrivning", 1, 2000);
    if (descriptionRange) this.errors().push(descriptionRange);
    const description = Validation.filterPossibleInjection(product.description, "Produktbeskrivning");
    if (description) this.errors().push(description);

    if (this.errors().length === 0) {
      this.cafeService.editProduct(this.id, product.name, Number(product.price), product.description, product.categoryID).subscribe({
        next: (response) => {
          this.success.set({
            success: response.success,
            data: "",
            message: "Produkten ändrades."
          });
          this.loadProducts();
          this.id = "";
          this.product = {
            name: "",
            price: "",
            description: "",
            categoryID: ""
          };
          setTimeout(() => {
            this.success.set({
              success: false,
              data: "",
              message: ""
            });
          }, 1500);
        },
        error: (error) => {
          this.errors().push(error.error.message);
        }
      });
    }
  }

  /**
   * Raderar en produkt.
   * @param id - vilken produkt som ska raderas.
   */
  deleteProduct(id: string): void {
    this.success().success = false;
    this.errors.set([]);
    this.cafeService.deleteProduct(id).subscribe({
      next: (response) => {
        this.success.set({
          success: response.success,
          data: "",
          message: "Produkten raderades."
        });
        this.loadProducts();
        setTimeout(() => {
          this.success.set({
            success: false,
            data: "",
            message: ""
          });
        }, 1500);
      }, error: (error) => {
        this.errors().push(error.error.message);
      }
    });
  }

  /**
   * Markerar en kategori för ändring.
   * @param id - vilken kategori.
   */
  markCategory(id: string): void {
    this.category.name = this.categoriesPag().filter(category => category.id === id)[0].name.normal;
    this.categoryID = id;
  }

  /**
   * Skapar en kategori.
   */
  createCategory(): void {
    this.success().success = false;
    this.errors.set([]);

    const nameRange = Validation.range<string>(this.category.name, "Kategorinamn", 2, 50);
    if (nameRange) this.errors().push(nameRange);
    const nameHasNumbers = Validation.unableToContainNumbers(this.category.name, "Kategorinamn");
    if (nameHasNumbers) this.errors().push(nameHasNumbers);

    if (this.errors().length === 0) {
      this.cafeService.createCategory(this.category.name).subscribe({
        next: (response) => {
          this.success.set({
            success: response.success,
            data: "",
            message: "Kategorin skapades."
          });
          this.loadCategories();
          this.loadProducts();
          this.categoryID = "";
          this.category.name = "";
          setTimeout(() => {
            this.success.set({
              success: false,
              data: "",
              message: ""
            });
          }, 1500);
        }, error: (error) => {
          this.errors().push(error.error.message);
        }
      });
    }
  }

  /**
   * Ändrar en kategori.
   */
  editCategory(): void {
    this.success().success = false;
    this.errors.set([]);

    const nameRange = Validation.range<string>(this.category.name, "Kategorinamn", 2, 50);
    if (nameRange) this.errors().push(nameRange);
    const nameHasNumbers = Validation.unableToContainNumbers(this.category.name, "Kategorinamn");
    if (nameHasNumbers) this.errors().push(nameHasNumbers);

    if (this.errors().length === 0) {
      this.cafeService.editCategory(this.categoryID, this.category.name).subscribe({
        next: (response) => {
          this.success.set({
            success: response.success,
            data: "",
            message: "Kategorin ändrades."
          });
          this.loadCategories();
          this.categoryID = "";
          this.category.name = "";
          setTimeout(() => {
            this.success.set({
              success: false,
              data: "",
              message: ""
            });
          }, 1500);
        }, error: (error) => {
          this.errors().push(error.error.message);
        }
      });
    }
  }

  /**
   * Raderar en kategori.
   * @param id - vilken kategori som ska raderas.
   */
  deleteCategory(id: string): void {
    this.success().success = false;
    this.errors.set([]);
    this.cafeService.deleteCategory(id).subscribe({
      next: (response) => {
        this.success.set({
          success: response.success,
          data: "",
          message: "Kategorin raderades."
        });
        this.loadCategories();
        setTimeout(() => {
          this.success.set({
            success: false,
            data: "",
            message: ""
          });
        }, 1500);
      }, error: (error) => {
        this.errors().push(error.error.message);
      }
    });
  }

  /**
   * Förflyttar användaren till instrumentpanelen.
   */
  back(): void {
    this.route.navigate([".."], { relativeTo: this.activeRoute });
  }
}
