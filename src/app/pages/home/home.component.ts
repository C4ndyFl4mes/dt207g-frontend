import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AccountService } from '../../services/account.service';
import { User } from '../../models/user';
import { Pagination } from '../../models/pagination';
import { Review } from '../../models/review';
import { FormsModule } from '@angular/forms';
import { FormMessageComponent } from "../../partials/form-message/form-message.component";
import { Response } from '../../models/response';
import { Validation } from '../../validation';

@Component({
  selector: 'app-home',
  imports: [FormsModule, FormMessageComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  isLoading = signal<boolean>(false);

  isUpdating = signal<boolean>(false);

  errors = signal<Array<string>>([]); // Lagrar felmeddelanden för inmatningsfälten.

  // Startvärde för success meddelandet.
  success = signal<Response<string>>({
    success: false,
    data: "",
    message: ""
  });

  updateUser = {
    firstname: "",
    lastname: "",
    email: "",
    password: ""
  }

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

  constructor(private router: Router, private route: ActivatedRoute, private accountService: AccountService, private userService: UserService) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const user = this.accountService.getUserInfo();
    if (user) {
      this.isLoading.set(true);
      this.userService.getProfile(user.id).subscribe({
        next: (response) => {
          console.log(response);
          this.currentUser.set(response.data.account);
          this.reviews_section.set(response.data.reviews_section);
          this.updateUser = {
            firstname: response.data.account.firstname,
            lastname: response.data.account.lastname,
            email: response.data.account.email,
            password: ""
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.log(error);
          this.isLoading.set(false);
        }
      });
    }
  }

  calcAVGRating(): string {
    let sum: number = 0;
    this.reviews_section().reviews.forEach(review => {
      sum += review.rating;
    });
    const avgRating: number = sum / this.reviews_section().pagination.totalItems;
    return `${Math.round(avgRating * 100) / 100} ★`;
  }

  calcTotalWords(): number {
    let sum: number = 0;
    this.reviews_section().reviews.forEach(review => {
      sum += review.message.split(" ").length;
    });
    return sum;
  }

  updateUserCompletely(): void {
    const user = this.updateUser;

    this.errors.set([]);

    // Valideringar för förnamn, mellan 2 och 32 tecken, får inte innehålla siffror eller specialtecken.
    const firstnameRange = Validation.range<string>(user.firstname, "Förnamn", 2, 32);
    if (firstnameRange) this.errors().push(firstnameRange);
    const firstnameHasNumbers = Validation.unableToContainNumbers(user.firstname, "Förnamn");
    if (firstnameHasNumbers) this.errors().push(firstnameHasNumbers);
    const firstnameHasSpecial = Validation.unableToContainSpecialChar(user.firstname, "Förnamn");
    if (firstnameHasSpecial) this.errors().push(firstnameHasSpecial);

    // Samma valideringar som för förnamn.
    const lastnameRange = Validation.range<string>(user.lastname, "Efternamn", 2, 32);
    if (lastnameRange) this.errors().push(lastnameRange);
    const lastnameHasNumbers = Validation.unableToContainNumbers(user.lastname, "Efternamn");
    if (lastnameHasNumbers) this.errors().push(lastnameHasNumbers);
    const lastnameHasSpecial = Validation.unableToContainSpecialChar(user.lastname, "Efternamn");
    if (lastnameHasSpecial) this.errors().push(lastnameHasSpecial);

    // Validerar att e-posten är korrekt formatterad, typ a@b.c
    const email = Validation.email(user.email, "E-post");
    if (email) this.errors().push(email);

    // Validerar att lösenordet är 8 tecken långt, har minst en av följande, gemen, versal, siffra och specialtecken.
    const passwordLength = Validation.passwordLength(user.password);
    if (passwordLength) this.errors().push(passwordLength);
    const passwordSmallChar = Validation.passwordSmallChar(user.password);
    if (passwordSmallChar) this.errors().push(passwordSmallChar);
    const passwordCapitalChar = Validation.passwordCapitalChar(user.password);
    if (passwordCapitalChar) this.errors().push(passwordCapitalChar);
    const passwordNumber = Validation.passwordNumber(user.password);
    if (passwordNumber) this.errors().push(passwordNumber);
    const passwordSpecialChar = Validation.passwordSpecialChar(user.password);
    if (passwordSpecialChar) this.errors().push(passwordSpecialChar);

    if (this.errors().length === 0) {
      this.userService.editUser(this.accountService.getUserInfo()!.id, user.firstname, user.lastname, user.email, user.password).subscribe({
        next: (response) => {

          this.accountService.setUser({
            id: this.accountService.getUserInfo()!.id,
            firstname: response.data.account.firstname,
            lastname: response.data.account.lastname,
            role: this.accountService.getUserInfo()!.role,
            email: response.data.account.email,
            registered: response.data.account.registered
          }, this.accountService.getToken()!);
          this.loadProfile();
          this.success.set({
            success: response.success,
            data: "",
            message: response.message
          });
          setTimeout(() => {
            this.isUpdating.set(false);
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
   * Skickar användaren till inloggningssidan.
   */
  login(): void {
    this.router.navigate(["/konto"]);
  }

  /**
   * Loggar ut och skickar användaren till inloggningssidan.
   */
  logout(): void {
    this.accountService.logout();
    this.router.navigate(["/konto"]);
  }
}
