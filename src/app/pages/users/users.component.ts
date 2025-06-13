import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AccountService } from '../../services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../../models/pagination';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FormMessageComponent } from "../../partials/form-message/form-message.component";
import { Response } from '../../models/response';
import { Validation } from '../../validation';

@Component({
  selector: 'app-users',
  imports: [FormsModule, FormMessageComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, OnDestroy {

  // Används för delay på inmatningsfältet som söker på namn.
  private fullnameSubject = new Subject<string>();
  private fullnameSub = this.fullnameSubject
    .pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadUsers();
    });

  isLoading = signal<boolean>(false); // Håller koll på om användare laddas in.
  users = signal<Array<User>>([]); // En array av användare.
  // Inmatningsfälten för att ändra en användare eller skapa en ny admin.
  user = {
    firstname: "",
    lastname: "",
    email: "",
    password: ""
  };

  userID: string = ""; // Den användare som är markerad för ändring

  // Inmatningsfält för filtrering. 
  filter = {
    role: "",
    name: ""
  };

  // Håller reda på pagneringen.
  pagination = signal<Pagination>({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 1
  });

  errors = signal<Array<string>>([]); // Lagrar felmeddelanden för inmatningsfälten.

  // Startvärde för success meddelandet.
  success = signal<Response<string>>({
    success: false,
    data: "",
    message: ""
  });

  constructor(private route: Router, private activeRoute: ActivatedRoute, private userService: UserService, private accountService: AccountService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.fullnameSub.unsubscribe();
  }

  /**
   * Laddar in användare.
   */
  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getUsers(this.filter.role, this.filter.name, this.pagination().currentPage, this.pagination().pageSize).subscribe({
      next: (response) => {
        this.pagination.set(response.data.pagination);
        this.users.set(response.data.users);
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
  * Föregående menysida.
  */
  previous(): void {
    const current = this.pagination().currentPage;
    const total = this.pagination().totalPages;
    const newPage = current === 1 ? total : current - 1;

    this.pagination().currentPage = newPage;
    this.loadUsers();
  }

  /**
   * Nästa menysida.
   */
  next(): void {
    const current = this.pagination().currentPage;
    const total = this.pagination().totalPages;
    const newPage = current === total ? 1 : current + 1;

    this.pagination().currentPage = newPage;
    this.loadUsers();
  }

  /**
   * Anropar subject för på börja delay.
   */
  setFilter(): void {
    this.fullnameSubject.next(this.filter.name);
  }

  setRoleFilter(): void {
    this.loadUsers();
  }

  /**
   * Skapar en ny admin. Endast root kan göra detta. Behöver inte felmeddelanden om det då knappen / fälten är antingen disabled eller display none för alla utom root.
   */
  createAdmin(): void {
    const user = this.user;

    this.success().success = false;
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
      this.userService.createAdmin(this.user.firstname, this.user.lastname, this.user.email, this.user.password).subscribe({
        next: (response) => {
          this.success.set({
            success: response.success,
            data: "",
            message: "Administratör tillagd."
          });
          this.loadUsers();
          this.user = {
            firstname: "",
            lastname: "",
            email: "",
            password: ""
          };
          this.userID = "";
        },
        error: (error) => {
          this.errors().push(error.error.message);
        }
      });
    }
  }

  /**
   * Markerar en användare inför ändring.
   * @param id - den användare som blir markerad.
   * @param item - användarinformation.
   */
  markUser(id: string, item: User): void {
    this.userID = id;
    this.user.firstname = item.firstname;
    this.user.lastname = item.lastname;
    this.user.email = item.email;
  }

  /**
   * Ändrar en användare.
   */
  editUser(): void {
    const user = this.user;

    this.success().success = false;
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

    if (this.errors().length === 0) {
      this.userService.editUser(this.userID, this.user.firstname, this.user.lastname, this.user.email).subscribe({
        next: (response) => {
          this.success.set({
            success: response.success,
            data: "",
            message: "Användaren ändrades."
          });
          if (response.data.account.id === this.accountService.getUserInfo()!.id) {
            this.accountService.setUser({
              id: this.accountService.getUserInfo()!.id,
              firstname: response.data.account.firstname,
              lastname: response.data.account.lastname,
              role: this.accountService.getUserInfo()!.role,
              email: response.data.account.email,
              registered: response.data.account.registered
            }, this.accountService.getToken()!);
          }
          this.loadUsers();
          this.user = {
            firstname: "",
            lastname: "",
            email: "",
            password: ""
          };
          this.userID = "";
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
   * Raderar en användare.
   * @param id - vilken användare som ska raderas.
   */
  deleteUser(id: string): void {
    this.success().success = false;
    this.errors.set([]);
    this.userService.deleteUser(id).subscribe({
      next: (response) => {
        this.success.set({
          success: response.success,
          data: "",
          message: "Användaren raderades."
        });
        this.loadUsers();
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

  cancel(): void {
    this.user = {
      firstname: "",
      lastname: "",
      email: "",
      password: ""
    };
    this.userID = "";
  }

  /**
   * Kollar om den inloggade användaren är root.
   * @returns är root eller inte.
   */
  isRoot(): boolean {
    return this.accountService.getUserInfo()?.role === "root";
  }

  /**
   * Kollar om den inloggade användaren är admin.
   * @returns är admin eller inte.
   */
  isAdmin(): boolean {
    return this.accountService.getUserInfo()?.role === "admin";
  }

  /**
   * Hämtar id på den inloggade användaren.
   * @returns id på den inloggade användaren.
   */
  getID(): string | undefined {
    return this.accountService.getUserInfo()?.id;
  }

  openProfile(id: string): void {
    this.route.navigate([id], { relativeTo: this.activeRoute });
  }

  /**
   * För flyttar användaren tillbaka till dashboard.
   */
  back(): void {
    this.route.navigate([".."], { relativeTo: this.activeRoute });
  }
}
