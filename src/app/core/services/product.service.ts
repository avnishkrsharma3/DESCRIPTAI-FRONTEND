import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductsResponse } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all products
  getAllProducts(limit: number = 100): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}`);
  }

  // Search for products
  searchProducts(query: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}/search?q=${query}`);
  }

}