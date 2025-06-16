import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { Response } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  // Används för att uppdatera om användaren är inloggad eller inte i realtid:
  private loggedIn = new BehaviorSubject<boolean>(false); 
  public isLoggedIn = this.loggedIn.asObservable(); // Denna anropas för att veta om användaren är inloggad.

  private authURL: string = "https://rymdrosten.onrender.com/api/auth"; // För registrering och inloggning.
  private usersURL: string = "https://rymdrosten.onrender.com/api/users"; // För att hantera användare i allmänhet.

  constructor(private http: HttpClient) {
    this.checkInitialLogin(); // Anropas för att kolla inloggningsstatusen i tidigt läge.
  }

  /**
   * Registrerar ny användare.
   * @param user - användarinformation.
   * @returns - success, message, data: null.
   */
  register(firstname: string, lastname: string, email: string, password: string): Observable<Response<null>> {
    return this.http.post<Response<null>>(`${this.authURL}/register`, {firstname, lastname, email, password});
  }

  /**
   * Loggar in användare.
   * @param user - användarinformation.
   * @returns - success, message, data: {token och account}.
   */
  login(email: string, password: string): Observable<Response<{token: string; account: User}>> {
    return this.http.post<Response<{token: string; account: User}>>(`${this.authURL}/login`, { email, password });
  }

  /**
   * Kollar om användaren har rätt uppgifter.
   * @returns - success, message, data: null.
   */
  checkLogin(): Observable<Response<null>> {
    return this.http.get<Response<null>>(`${this.usersURL}/check/${this.getUserInfo()?.id}`, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.getToken()}`
      }
    });
  }

  /**
   * Uppdaterar inloggningsstatus till sant om användaren kan vara inloggad.
   * @returns - avslutar metoden tidigt.
   */
  checkInitialLogin(): void {
    if (!this.getToken() || !this.getUserInfo()) {
      this.loggedIn.next(false);
      return;
    }

    this.checkLogin().subscribe({
      next: (response) => {
        this.loggedIn.next(response.success);
      },
      error: (error) => {
        console.log(error);
        this.loggedIn.next(false);
      }
    });
  }

  /**
   * Loggar ut och raderar sessionStorage.
   */
  logout(): void {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("tokenExpiresAt");
    this.loggedIn.next(false);
  }

  /**
   * Sätter värden i sessionStorage.
   * @param user - användarinformation.
   * @param token - token.
   */
  setUser(user: User, token: string): void {
    const u = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      registered: user.registered
    }

    sessionStorage.setItem("user", JSON.stringify(u));
    sessionStorage.setItem("token", JSON.stringify(token));
    this.setTokenExpiration(token); // Anropar metoden som beräknar tidpunkten för när token går ut.
    this.autoLogout(); // Påbörjar nedräkningen till användaren ska loggas ut automatiskt (1h).
    this.loggedIn.next(true); // Uppdaterar inloggningsstatusen till inloggad.
  }

  /**
   * Hämtar användarinformation från sessionStorage.
   * @returns användarinformation.
   */
  getUserInfo(): User | null {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  /**
   * Hämtar tokeninformation från sessionStorage.
   * @returns token
   */
  getToken(): string | null {
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }
    const token = sessionStorage.getItem("token");
    return token ? JSON.parse(token) : null;
  }

  /**
   * Sätter tidpunkten för tokens utgång i sessionStorage.
   * @param token - den token som utgångstiden ska tas ifrån.
   */
  setTokenExpiration(token: string): void {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresAt = new Date(payload.exp * 1000);
    sessionStorage.setItem("tokenExpiresAt", expiresAt.toISOString());
  }

  /**
   * Kollar om token är utgången.
   * @returns boolean om token är utgången eller inte.
   */
  isTokenExpired(): boolean {
    const expiresAt: string | null = sessionStorage.getItem("tokenExpiresAt");
    if (!expiresAt) return true;

    return new Date(expiresAt) < new Date();
  }

  /**
   * Loggar ut användaren automatiskt när token har utgått. Detta syns utan sidomladdning
   * (precis som allt annat gällande inloggningsstatus).
   * @returns avbryter metoden tidigt.
   */
  autoLogout(): void {
    const expiresAt: string | null = sessionStorage.getItem("tokenExpiresAt");
    if (!expiresAt) return;

    const expiresIn = new Date(expiresAt).getTime() - new Date().getTime(); // Detta blir en timme då token är inställt på det i backend.

    if (expiresIn > 0) {
      setTimeout(() => {
        this.logout();
      }, expiresIn);
    } else {
      this.logout();
    }
  }
}
