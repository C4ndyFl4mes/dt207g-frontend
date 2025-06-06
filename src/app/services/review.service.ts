import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Response } from '../models/response';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  url = "http://localhost:3000/api/reviews";
  constructor(private http: HttpClient) { }

  /**
   * Lägger till en recension.
   * @param token - för autentisering.
   * @param productID - id på produkten som recensionen är skriven för.
   * @param rating - betyget 1 till 5.
   * @param message - meddelandet.
   * @returns success, message, data: {review}.
   */
  postReview(token: string, productID: string, rating: number, message: string): Observable<Response<{review: Review}>> {
    return this.http.post<Response<{review: Review}>>(`${this.url}/post/${productID}`, { rating: rating, message: message }, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${token}`
      }
    });
  }

  /**
   * Raderar en recension.
   * @param token - för autentisering.
   * @param reviewID - id på recensionen som ska raderas.
   * @returns success, message, data: null.
   */
  deleteReview(token: string, reviewID: string): Observable<Response<null>> {
    return this.http.delete<Response<null>>(`${this.url}/delete/${reviewID}`, { 
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${token}`
      }
    });
  }

  /**
   * Kollar om användaren redan lagt till en recension på produkten.
   * @param token - för autentisering.
   * @param productID - id på produkten som skall kollas.
   * @returns success, message, data: null.
   */
  checkUserAlreadyPostedOnProduct(token: string, productID: string): Observable<Response<null>> {
    return this.http.get<Response<null>>(`${this.url}/check/${productID}`, { 
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${token}`
      }
    });
  }
}
