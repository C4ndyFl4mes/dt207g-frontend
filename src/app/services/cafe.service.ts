import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category';
import { Response } from '../models/response';
import { Pagination } from '../models/pagination';
import { Product } from '../models/product';
import { Review } from '../models/review';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class CafeService {

  url: string = "https://rymdrosten.onrender.com/api/menu";

  constructor(private http: HttpClient, private accountService: AccountService) { }

  getCategories(page?: number, limit?: number): Observable<Response<{ pagination?: Pagination; categories: Array<Category> }>> {
    if (page && limit) {
      return this.http.get<Response<{ pagination: Pagination; categories: Array<Category> }>>(`${this.url}/categories?page=${page}&limit=${limit}`);
    }
    return this.http.get<Response<{ categories: Array<Category> }>>(`${this.url}/categories`);
  }

  getAllProducts(page: number = 1, limit: number = 10): Observable<Response<{ pagination: Pagination; products: Array<Product> }>> {
    return this.http.get<Response<{ pagination: Pagination; products: Array<Product> }>>(`${this.url}?page=${page}&limit=${limit}`);
  }

  getProductsFromCategory(slug: string, page: number = 1, limit: number = 10): Observable<Response<{ pagination: Pagination; products: Array<Product> }>> {
    return this.http.get<Response<{ pagination: Pagination; products: Array<Product> }>>(`${this.url}/category/${slug}?page=${page}&limit=${limit}`);
  }

  getProduct(categorySlug: string, productSlug: string, page: number = 1, limit: number = 10): Observable<Response<{ product: Product; reviews_section: { pagination: Pagination; reviews: Array<Review> } }>> {
    return this.http.get<Response<{ product: Product; reviews_section: { pagination: Pagination; reviews: Array<Review> } }>>(`${this.url}/${categorySlug}/${productSlug}?page=${page}&limit=${limit}`);
  }


  createCategory(name: string): Observable<Response<{ category: Category }>> {
    return this.http.post<Response<{ category: Category }>>(`${this.url}/category`, { name }, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  editCategory(id: string, name: string): Observable<Response<{ category: Category }>> {
    return this.http.put<Response<{ category: Category }>>(`${this.url}/category/${id}`, { name }, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  deleteCategory(id: string): Observable<Response<{ category: Category }>> {
    return this.http.delete<Response<{ category: Category }>>(`${this.url}/category/${id}`, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  createProduct(name: string, price: number, description: string, categoryID: string): Observable<Response<null>> {
    return this.http.post<Response<null>>(`${this.url}/product`, { name, price, description, inCategory: categoryID }, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  editProduct(id: string, name: string, price: number, description: string, categoryID: string): Observable<Response<null>> {
    return this.http.put<Response<null>>(`${this.url}/product/${id}`, { name, price, description, inCategory: categoryID }, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

  deleteProduct(id: string): Observable<Response<null>> {
    return this.http.delete<Response<null>>(`${this.url}/product/${id}`, {
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.accountService.getToken()}`
      }
    });
  }

}
