import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GeneratedDescription,
  ProductDescription,
  ProductsResponse,
} from '../models/product.model';
import { environment } from '../../../environments/environment';

export interface ApprovalRequest {
  listOfIds: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAllProducts(): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}/products`);
  }

  getDescriptionStatuses(): Observable<ProductDescription[]> {
    return this.http.get<ProductDescription[]>(`${this.apiUrl}/product/description/status`);
  }

  searchProducts(query: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}/products/search`, {
      params: { q: query },
    });
  }

  generateDescription(productIds: number[], prompts: string): Observable<GeneratedDescription[]> {
    return this.http.post<GeneratedDescription[]>(`${this.apiUrl}/AI/generate`, {
      productIds,
      prompts,
    });
  }

  approveDescriptions(listOfIds: string[]): Observable<void> {
    const body: ApprovalRequest = { listOfIds };
    return this.http.post<void>(`${this.apiUrl}/product/description/approve`, body);
  }

  deleteDescription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/product/description/delete/${encodeURIComponent(id)}`);
  }
}
