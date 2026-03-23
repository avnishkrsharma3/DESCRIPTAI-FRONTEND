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
    return this.http.get<ProductsResponse>(`${this.apiUrl}/products`);
  }

  // Search for products
  searchProducts(query: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}/products/search?q=${query}`);
  }

  generateDescription(productIds: string[], prompts: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/AI/generate`, { productIds, prompts });
  }

  saveProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/AI/save`, product);
  }
  
}