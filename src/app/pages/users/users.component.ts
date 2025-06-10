import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AccountService } from '../../services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../../models/pagination';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [FormsModule],
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
        console.log(response);
        this.pagination.set(response.data.pagination);
        this.users.set(response.data.users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.log(error);
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

  /**
   * Skapar en ny admin. Endast root kan göra detta.
   */
  createAdmin(): void {
    this.userService.createAdmin(this.user.firstname, this.user.lastname, this.user.email, this.user.password).subscribe({
      next: () => {
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
        console.log(error);
      }
    });
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
    this.userService.editUser(this.userID, this.user.firstname, this.user.lastname, this.user.email).subscribe({
      next: () => {
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
        console.log(error);
      }
    });
  }

  /**
   * Raderar en användare.
   * @param id - vilken användare som ska raderas.
   */
  deleteUser(id: string): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.log(error);
      }
    });
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

  /**
   * För flyttar användaren tillbaka till dashboard.
   */
  back(): void {
    this.route.navigate([".."], { relativeTo: this.activeRoute });
  }
}
