import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AccountService } from '../services/account.service';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private accountService: AccountService) {}

  /**
   * Skyddar dashboard från otillåten tillgång.
   * @returns om användaren har tillgång till sidan eller inte.
   */
  canActivate(): Observable<boolean> {
    return this.accountService.isLoggedIn.pipe(
      map((loggedIn) => {
        if (loggedIn) {
          const user: User | null = this.accountService.getUserInfo();
          if (user) {
            if (user.role === "admin" || user.role === "root") {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          this.router.navigate(["/konto"]);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(["/konto"]);
        return of(false);
      })
    );
  }
}
