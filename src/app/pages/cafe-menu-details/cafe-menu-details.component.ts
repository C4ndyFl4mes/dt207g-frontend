import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CafeService } from '../../services/cafe.service';
import { Product } from '../../models/product';
import { Review } from '../../models/review';
import { Pagination } from '../../models/pagination';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { ReviewService } from '../../services/review.service';
import { FormMessageComponent } from "../../partials/form-message/form-message.component";
import { Response } from '../../models/response';
import { Validation } from '../../validation';

@Component({
  selector: 'app-cafe-menu-details',
  imports: [FormsModule, FormMessageComponent],
  templateUrl: './cafe-menu-details.component.html',
  styleUrl: './cafe-menu-details.component.scss'
})
export class CafeMenuDetailsComponent implements OnInit {

  loggedIn = signal<boolean>(false); // Håller reda på om användaren är inloggad eller inte.

  categorySlug = signal<string | null>(""); // Kategori i params.
  itemSlug = signal<string | null>(""); // Produkten i params.
  isLoading = signal<boolean>(false); // Håller reda på om produkten laddas in.

  posting = signal<boolean>(false); // Håller reda på om användaren håller på att lägga till en recension.
  alreadyPostedOnProduct = signal<boolean>(false); // Håller reda på om användaren har redan lagt till en recension på nuvarande produkt.

  loadingError = signal<string | null>(null); // Utifall det blir inladdningsfel.

  currentReviewID = ""; // Den review som håller på att ändras.
  // Inmatningsfälten för recension.
  reviewInput = {
    rating: 3,
    message: ""
  }

  // Startvärde för nuvarande produkt.
  product = signal<Product>({
    id: "",
    name: {
      normal: "",
      slug: ""
    },
    description: "",
    price: 0,
    rating: 0,
    inCategory: {
      id: "",
      name: {
        normal: "",
        slug: ""
      }
    },
    created: "",
    updated: ""
  });

  // Startvärde för recensionsektionen.
  reviews_section = signal<{ pagination: Pagination; reviews: Array<Review> }>({
    pagination: {
      currentPage: 1,
      pageSize: 5,
      totalItems: 0,
      totalPages: 0
    },
    reviews: []
  });

  errors = signal<Array<string>>([]); // Lagrar felmeddelanden för inmatningsfälten.

  // Startvärde för success meddelandet.
  success = signal<Response<string>>({
    success: false,
    data: "",
    message: ""
  });

  /**
   * 
   * @param router - 
   * @param route - hanterar parametrar från url:en.
   * @param cafeService - hanterar produkter.
   * @param accountService - hanterar konton.
   * @param reviewService  - hanterar recensioner.
   */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cafeService: CafeService,
    private accountService: AccountService,
    private reviewService: ReviewService
  ) { }

  /**
   * Hämtar parametrarna för kategori och produkt från url:en, därefter kallar loadProduct som använder parametrarna.
   * Kallar isLoggedIn som sätter inloggningsstatus på loggedIn.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categorySlug.set(params.get("categoryslug"));
      this.itemSlug.set(params.get("itemslug"));
      this.isLoggedIn();
      this.loadProduct();
    });
  }

  /**
  * Sätter inloggningsstatus för användaren. Används för att dölja lägga till recension.
  */
  isLoggedIn(): void {
    this.accountService.isLoggedIn.subscribe((loggedIn) => {
      this.loggedIn.set(loggedIn);
    });
  }

  /**
   * Laddar in produkter utifrån parametrarna i url:en samt vilken sida användaren är på.
   */
  loadProduct(): void {
    this.isLoading.set(true); // Pågörjar inladdning.
    this.cafeService.getProduct(this.categorySlug()!, this.itemSlug()!, this.reviews_section().pagination.currentPage, this.reviews_section().pagination.pageSize).subscribe({
      next: (response) => {
        this.product.set(response.data.product);
        this.reviews_section.set(response.data.reviews_section);
        this.isLoading.set(false); // Avslutar inladdning.
        this.postedAlready(); // Anropas för att kolla om användaren har redan lagt till en recension.
      },
      error: () => {
        this.isLoading.set(false);
        this.loadingError.set("Inladdningsfel"); // Vet inte om den kommer hit, har inte lyckats med det.
      }
    });

  }

  /**
  * Föregående menysida.
  */
  previous(): void {
    const current = this.reviews_section().pagination.currentPage;
    const total = this.reviews_section().pagination.totalPages;
    const newPage = current === 1 ? total : current - 1;

    this.reviews_section().pagination.currentPage = newPage;
    this.loadProduct();
  }

  /**
   * Nästa menysida.
   */
  next(): void {
    const current = this.reviews_section().pagination.currentPage;
    const total = this.reviews_section().pagination.totalPages;
    const newPage = current === total ? 1 : current + 1;

    this.reviews_section().pagination.currentPage = newPage;
    this.loadProduct();
  }

  /**
   * Beräknar en avrundning.
   * @param rating - betyg.
   * @returns en sträng som visar betyget med upp till två decimaler.
   */
  setAVGRating(rating: number): string {
    let r = Math.round(rating * 100) / 100;

    if (r % 1 === 0) {
      return `${r}.0`;
    }
    return String(r);
  }

  /**
   * Lägger till en recension till nuvarande produkt.
   */
  postReview(): void {
    this.success().success = false;
    this.errors.set([]);

    const ratingRange = Validation.range<number>(this.reviewInput.rating, "Betyg", 1, 5);
    if (ratingRange) this.errors().push(ratingRange);

    const reviewRange = Validation.range<string>(this.reviewInput.message, "Recension", 1, 2000);
    if (reviewRange) this.errors().push(reviewRange);

    const reviewInjection = Validation.filterPossibleInjection(this.reviewInput.message, "Recension");
    if (reviewInjection) this.errors().push(reviewInjection);

    if (this.errors().length === 0) {
      this.reviewService.postReview(this.product().id, this.reviewInput.rating, this.reviewInput.message).subscribe({
        next: (response) => {
          this.success.set({
            success: response.success,
            data: "",
            message: "Recension tillagd."
          });
          this.loadProduct(); // Laddar om produkten och dess recensioner.
          setTimeout(() => {
            this.success.set({
              success: false,
              data: "",
              message: ""
            });
          }, 1000);
        },
        error: (error) => {
          this.errors().push(error.error.message);
        }
      });
    }
  }

  /**
   * Markerar en recension inför ändring.
   * @param review - vilken recension som ska markeras.
   */
  markReview(review: Review): void {
    this.currentReviewID = review.id;
    this.reviewInput = {
      rating: review.rating,
      message: review.message
    }
  }

  /**
   * Ändrar en recension.
   */
  editReview(): void {
    this.success().success = false;
    this.errors.set([]);

    // Valideringar:
    const ratingRange = Validation.range<number>(this.reviewInput.rating, "Betyg", 1, 5);
    if (ratingRange) this.errors().push(ratingRange);

    const reviewRange = Validation.range<string>(this.reviewInput.message, "Recension", 1, 2000);
    if (reviewRange) this.errors().push(reviewRange);

    const reviewInjection = Validation.filterPossibleInjection(this.reviewInput.message, "Recension");
    if (reviewInjection) this.errors().push(reviewInjection);

    if (this.errors().length === 0) {
      this.reviewService.editReview(this.currentReviewID, this.reviewInput.rating, this.reviewInput.message).subscribe({
        next: (response) => {
          this.success.set({
            success: response.success,
            data: "",
            message: "Recension ändrad."
          });
          this.loadProduct();
          this.currentReviewID = "";
          this.reviewInput = {
            rating: 3,
            message: ""
          }
          setTimeout(() => {
            this.success.set({
              success: false,
              data: "",
              message: ""
            });
          }, 1000);
        },
        error: (error) => {
          this.errors().push(error.error.message);
        }
      });
    }
  }

  /**
   * Raderar en recension, skyddad av autentisering.
   * @param id - vilket id recensionen har.
   */
  deleteReview(id: string): void {
    this.success().success = false;
    this.errors.set([]);
    this.reviewService.deleteReview(id).subscribe({
      next: (response) => {
        this.loadProduct();
        this.currentReviewID = "";
        this.reviewInput = {
          rating: 3,
          message: ""
        }
        this.success.set({
          success: response.success,
          data: "",
          message: "Recension raderad."
        });
        setTimeout(() => {
          this.success.set({
            success: false,
            data: "",
            message: ""
          });
        }, 1000);
      },
      error: (error) => {
        this.errors().push(error.error.message);
      }
    });
  }

  /**
   * Återställer fälten för att lägga till en recension.
   */
  cancelPost(): void {
    this.currentReviewID = "";
    this.reviewInput = {
      rating: 3,
      message: ""
    }
    this.errors.set([]);
  }

  /**
   * Kollar om användaren äger recensionen. Används för att styra om ta bort knappen syns eller inte.
   * Det spelar ingen roll om någon gör att ta bort knappen syns ändå, routern kräver autentisering och auktoriserar korrekt.
   * @param id - recensionens id.
   * @returns - en boolean om användaren äger recensionen eller inte.
   */
  userOwnThisReview(id: string): boolean {
    return this.accountService.getUserInfo()?.id === id;
  }

  /**
   * Kollar om användaren kan radera andras recensioner. Används för att styra om ta bort knappen syns eller inte.
   * Det spelar ingen roll om någon gör att ta bort knappen syns ändå, routern kräver autentisering och auktoriserar korrekt.
   * @returns - en boolean om användaren kan radera andras recensioner eller inte.
   */
  checkRole(): boolean {
    const role = this.accountService.getUserInfo()?.role;
    return role === "admin" || role === "root";
  }

  /**
   * Kollar om användaren redan lagt till en recension. Används för att dölja lägga till recension.
   */
  postedAlready(): void {
    this.reviewService.checkUserAlreadyPostedOnProduct(this.product().id).subscribe({
      next: (response) => {
        this.alreadyPostedOnProduct.set(response.success);
      }, error: (error) => {
        this.alreadyPostedOnProduct.set(error.error.success);
        console.log(error);
      }
    });
  }

  /**
  * Förflyttar användaren till föregående meny.
  */
  back(): void {
    this.router.navigate(['/meny', this.categorySlug()]);
  }
}
