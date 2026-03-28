import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-description-generation',
  imports: [CommonModule, RouterModule],
  templateUrl: './description-generation.html',
  styleUrl: './description-generation.css',
  standalone: true,
})
export class DescriptionGeneration implements OnInit {
  productIds: string[] = [];
  prompts: string = '';
  loading = false;
  response: any[] = [];
  error: any;
  approvedCount = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.productIds = history.state.productIds;
    this.prompts = history.state.prompts;

    if (this.productIds && this.productIds.length > 0 && this.prompts) {
      this.loading = true;
      this.productService
        .generateDescription(this.productIds, this.prompts)
        .pipe(
          tap((data) => {
            console.log('Received response:', data);
            this.response = data; // 1. Assigln data first
            // 2. Then calculate count from the new data
            this.approvedCount = this.response.filter(p => p.approved).length;
          }),
          catchError((err) => {
            console.error('Error fetching description:', err);
            this.error = err;
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe();
    }
  }

  approve(product: any): void {
    this.productService.saveProduct(product).subscribe({
      next: () => {
        this.approvedCount++;
        product.approved = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error saving product:', err),
    });
  }

  reject(product: any): void {
    product.loading = true;
    this.productService
      .generateDescription([product.productId], this.prompts)
      .pipe(
        tap((newProduct) => {
          const index = this.response.findIndex(
            (p) => p.productId === product.productId
          );
          if (index !== -1) {
            this.response[index] = newProduct[0];
          }
        }),
        catchError((err) => {
          console.error('Error refetching description:', err);
          return of(null);
        }),
        finalize(() => {
          product.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

  trackByProductId(index: number, product: any): string {
    return product.productId;
  }
  goToDashboard() {
    // Example using Angular Router
    this.router.navigate(['/approve-dashboard']);
  }

}
