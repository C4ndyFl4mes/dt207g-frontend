import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Response } from '../models/response';
import { Review } from '../models/review';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  url = "https://rymdrosten.onrender.com/api/reviews";
  constructor(private http: HttpClient, private accountService: AccountService) { }

  /**
   * Lägger till en recension.
   * @param productID - id på produkten som recensionen är skriven för.
   * @param rating - betyget 1 till 5.
   * @param message - meddelandet.
   * @returns success, message, data: {review}.
   */
  postReview(productID: string, rating: number, message: string): Observable<Response<{review: Review}>> {
    return this.http.post<Response<{review: Review}>>(`${this.url}/review/${productID}`, { rating: rating, message: message }, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  /**
   * Ändrar en recension.
   * @param reviewID - den recension som ska ändras.
   * @param rating - nytt värde.
   * @param message - nytt värde.
   * @returns 
   */
  editReview(reviewID: string, rating: number, message: string): Observable<any> {
    return this.http.put<any>(`${this.url}/review/${reviewID}`, { rating, message}, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  /**
   * Raderar en recension.
   * @param reviewID - id på recensionen som ska raderas.
   * @returns success, message, data: null.
   */
  deleteReview(reviewID: string): Observable<Response<null>> {
    return this.http.delete<Response<null>>(`${this.url}/review/${reviewID}`, { 
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  /**
   * Kollar om användaren redan lagt till en recension på produkten.
   * @param token - för autentisering.
   * @param productID - id på produkten som skall kollas.
   * @returns success, message, data: null.
   */
  checkUserAlreadyPostedOnProduct(productID: string): Observable<Response<null>> {
    return this.http.get<Response<null>>(`${this.url}/check/${productID}`, { 
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }
}
