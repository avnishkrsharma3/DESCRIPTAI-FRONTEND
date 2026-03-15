import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

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
  response: any;
  error: any;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productIds = history.state.productIds;
    this.prompts = history.state.prompts;

    if (this.productIds && this.productIds.length > 0 && this.prompts) {
      this.loading = true;
      this.productService
        .generateDescription(this.productIds, this.prompts)
        .pipe(
          tap((response) => {
            console.log('Received response:', response);
            this.response = response;
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
}
