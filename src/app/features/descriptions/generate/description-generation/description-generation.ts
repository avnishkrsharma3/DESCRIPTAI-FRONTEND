import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-description-generation',
  imports: [CommonModule, RouterLink],
  templateUrl: './description-generation.html',
  styleUrl: './description-generation.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionGeneration implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private productIds: number[] = [];
  private prompts = '';

  ngOnInit(): void {
    const state = history.state as { productIds?: unknown; prompts?: unknown };
    const rawIds = this.route.snapshot.queryParamMap.get('productIds') ?? state.productIds;
    this.productIds = (Array.isArray(rawIds) ? rawIds : String(rawIds ?? '').split(','))
      .map((id) => Number(id))
      .filter((id) => Number.isSafeInteger(id) && id > 0);
    this.prompts = (
      this.route.snapshot.queryParamMap.get('prompts')
      ?? (typeof state.prompts === 'string' ? state.prompts : '')
    ).trim();

    if (!this.productIds.length || !this.prompts) {
      this.error.set('The selected products or description instructions are missing. Return to the catalog and try again.');
      return;
    }

    this.generate();
  }

  private generate(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.generateDescription(this.productIds, this.prompts).subscribe({
      next: () => {
        void this.router.navigate(['/approve-dashboard'], {
          queryParams: {
            productIds: this.productIds.join(','),
            prompts: this.prompts,
          },
        });
      },
      error: (error: unknown) => {
        console.error('Failed to generate product descriptions.', error);
        this.error.set('Descriptions could not be generated. Please return to the catalog and try again.');
        this.loading.set(false);
      },
    });
  }
}
