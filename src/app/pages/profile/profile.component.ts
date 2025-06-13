import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../models/user';
import { Pagination } from '../../models/pagination';
import { Review } from '../../models/review';
import { AccountService } from '../../services/account.service';
import { UserService } from '../../services/user.service';
import { Response } from '../../models/response';
import { ReviewService } from '../../services/review.service';
import { FormMessageComponent } from "../../partials/form-message/form-message.component";

@Component({
  selector: 'app-profile',
  imports: [FormMessageComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  isLoading = signal<boolean>(false);

  userID: string | null = null; // Nuvarande användare som kollas, fås av params.

  errors = signal<Array<string>>([]); // Lagrar felmeddelanden för inmatningsfälten.

  // Startvärde för success meddelandet.
  success = signal<Response<string>>({
    success: false,
    data: "",
    message: ""
  });

  // Nuvarande användare som kollas data.
  currentUser = signal<User>({
    id: "",
    firstname: "",
    lastname: "",
    email: "",
    role: "",
    registered: ""
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

  constructor(private router: Router, private route: ActivatedRoute, private accountService: AccountService, private userService: UserService, private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userID = params.get("userid");
      this.loadProfile();
    });
  }

  /**
   * Laddar in profil.
   */
  loadProfile(): void {
    if (this.userID) {
      this.isLoading.set(true);
      this.userService.getProfile(this.userID).subscribe({
        next: (response) => {
          this.currentUser.set(response.data.account);
          this.reviews_section.set(response.data.reviews_section);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.log(error);
          this.isLoading.set(false);
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
    const token: string | null = this.accountService.getToken();
    if (token) {
      this.reviewService.deleteReview(token, id).subscribe({
        next: (response) => {
          this.loadProfile();
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
      })
    } else {
      console.log("Token är otillgänlig.");
    }
  }

  /**
   * Beräknar genomsnittsbetyget användaren har gett produkter.
   * @returns Genomsnittsbetyg.
   */
  calcAVGRating(): string {
    let sum: number = 0;
    this.reviews_section().reviews.forEach(review => {
      sum += review.rating;
    });
    const avgRating: number = sum / this.reviews_section().pagination.totalItems;
    if (!avgRating) {
      return "?";
    }
    return `${Math.round(avgRating * 100) / 100} ★`;
  }

  /**
   * Beräknar antalet ord från recensioner.
   * @returns antal ord.
   */
  calcTotalWords(): number {
    let sum: number = 0;
    this.reviews_section().reviews.forEach(review => {
      sum += review.message.split(" ").length;
    });
    return sum;
  }

  /**
   * Föregående menysida.
   */
  previous(): void {
    const current = this.reviews_section().pagination.currentPage;
    const total = this.reviews_section().pagination.totalPages;
    const newPage = current === 1 ? total : current - 1;

    this.reviews_section().pagination.currentPage = newPage;
    this.loadProfile();
  }

  /**
   * Nästa menysida.
   */
  next(): void {
    const current = this.reviews_section().pagination.currentPage;
    const total = this.reviews_section().pagination.totalPages;
    const newPage = current === total ? 1 : current + 1;
    this.reviews_section().pagination.currentPage = newPage;
    this.loadProfile();
  }

  /**
   * Navigerar tillbaka till användare.
   */
  back(): void {
    this.router.navigate([".."], { relativeTo: this.route });
  }
}