import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category';
import { Response } from '../models/response';
import { Pagination } from '../models/pagination';
import { Product } from '../models/product';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class CafeService {

  url: string = "http://localhost:3000/api/menu";

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Response<{ categories: Array<Category> }>> {
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

}
