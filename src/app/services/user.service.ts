import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { Observable } from 'rxjs';
import { Response } from '../models/response';
import { Pagination } from '../models/pagination';
import { User } from '../models/user';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url: string = "http://localhost:3000/api/users";
  rootURL: string = "http://localhost:3000/api/auth/root/register";

  constructor(private http: HttpClient, private accountService: AccountService) { }

  getProfile(id: string): Observable<Response<{ account: User; reviews_section: { pagination: Pagination; reviews: Array<Review> }; }>> {
    return this.http.get<Response<{ account: User; reviews_section: { pagination: Pagination; reviews: Array<Review> }; }>>(`${this.url}/profile?id=${id}`, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  /**
   * Hämtar användare.
   * @param roles - filtrerar på roller.
   * @param name - filtrerar på för- och efternamn.
   * @param page - vilken sida användaren startar på.
   * @param limit - antal användare per sida.
   * @returns 
   */
  getUsers(
    roles: string = "",
    name: string = "",
    page: number = 1,
    limit: number = 10
  ): Observable<Response<{ pagination: Pagination, users: Array<User> }>> {
    const query = [];
    let queryURL = "";

    if (roles !== "") {
      query.push(`roles=${roles}`);
    }

    if (name !== "") {
      query.push(`name=${name}`);
    }

    query.push(`page=${page}`);
    query.push(`limit=${limit}`);

    queryURL = query.toString().replaceAll(",", "&");

    return this.http.get<Response<{ pagination: Pagination, users: Array<User> }>>(`${this.url}/?${queryURL}`, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  /**
   * Skapar en admin.
   * @param firstname - förnamn.
   * @param lastname - efternamn.
   * @param email - e-post.
   * @param password - lösenord.
   * @returns 
   */
  createAdmin(firstname: string, lastname: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.rootURL}`, { firstname, lastname, email, password, role: "admin" }, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  /**
   * Ändrar en användare.
   * @param id - vem som ska ändras.
   * @param firstname - nytt värde.
   * @param lastname - nytt värde.
   * @param email - nytt värde.
   * @returns 
   */
  editUser(id: string, firstname: string, lastname: string, email?: string, currentPassword?: string): Observable<Response<any>> {
    return this.http.put<Response<any>>(`${this.url}/user/${id}`, { firstname, lastname, email, currentPassword }, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  /**
   * Raderar en användare.
   * @param id - vem som ska raderas.
   * @returns 
   */
  deleteUser(id: string): Observable<Response<null>> {
    return this.http.delete<Response<null>>(`${this.url}/user/${id}`, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }
}
