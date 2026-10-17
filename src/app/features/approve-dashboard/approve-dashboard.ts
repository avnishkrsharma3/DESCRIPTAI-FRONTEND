import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { DescriptionStatus, ProductDescription } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-approve-dashboard',
  imports: [DatePipe, NgOptimizedImage],
  templateUrl: './approve-dashboard.html',
  styleUrl: './approve-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveDashboard {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly descriptions = signal<ProductDescription[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly approvedByFilter = signal('');
  readonly reviewedDateFilter = signal('');
  readonly statusFilter = signal<DescriptionStatus | 'ALL'>('ALL');
  readonly productIdsFilter = signal<number[]>([]);
  readonly busyIds = signal<ReadonlySet<string>>(new Set());
  readonly statuses: readonly (DescriptionStatus | 'ALL')[] = [
    'ALL',
    'DRAFT',
    'APPROVED',
    'SUPERSEDED',
    'REJECTED',
  ];
  private prompts = 'professional,seo,short';

  readonly filteredDescriptions = computed(() => {
    const approver = this.approvedByFilter().trim().toLocaleLowerCase();
    const date = this.reviewedDateFilter();
    const status = this.statusFilter();
    const productIds = this.productIdsFilter();

    return this.descriptions().filter((description) => {
      const matchesProduct = productIds.length === 0 || productIds.includes(description.productId);
      const reviewer = (description.reviewedBy ?? '').toLocaleLowerCase();
      const reviewedAt = description.reviewedAt ? new Date(description.reviewedAt) : null;
      const reviewedDate = reviewedAt && !Number.isNaN(reviewedAt.getTime())
        ? [
            reviewedAt.getFullYear(),
            String(reviewedAt.getMonth() + 1).padStart(2, '0'),
            String(reviewedAt.getDate()).padStart(2, '0'),
          ].join('-')
        : '';

      return matchesProduct
        && (!approver || reviewer.includes(approver))
        && (!date || date === reviewedDate)
        && (status === 'ALL' || description.status === status);
    });
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const rawIds = params.get('productIds');
      const ids = (rawIds ?? '')
        .split(',')
        .map((value) => Number(value))
        .filter((value) => Number.isSafeInteger(value) && value > 0);
      this.productIdsFilter.set([...new Set(ids)]);
      this.prompts = params.get('prompts') || 'professional,seo,short';
      this.loadDescriptions();
    });
  }

  loadDescriptions(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.productService.getDescriptionStatuses().subscribe({
      next: (descriptions) => {
        this.descriptions.set(descriptions);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load description statuses.', error);
        this.loadError.set('Could not load product descriptions. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  setApprovedByFilter(value: string): void {
    this.approvedByFilter.set(value);
  }

  setReviewedDateFilter(value: string): void {
    this.reviewedDateFilter.set(value);
  }

  setStatusFilter(value: string): void {
    if (this.statuses.includes(value as DescriptionStatus | 'ALL')) {
      this.statusFilter.set(value as DescriptionStatus | 'ALL');
    }
  }

  clearFilters(): void {
    this.approvedByFilter.set('');
    this.reviewedDateFilter.set('');
    this.statusFilter.set('ALL');
    this.productIdsFilter.set([]);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { productIds: null, prompts: null },
      queryParamsHandling: 'merge',
    });
  }

  approve(description: ProductDescription): void {
    if (description.status !== 'DRAFT' || this.isBusy(description.id)) {
      return;
    }
    this.runDraftAction(description.id, () => this.productService.approveDescriptions([description.id]));
  }

  delete(description: ProductDescription): void {
    if (description.status !== 'DRAFT' || this.isBusy(description.id)) {
      return;
    }
    this.runDraftAction(description.id, () => this.productService.deleteDescription(description.id));
  }

  regenerate(description: ProductDescription): void {
    if (description.status !== 'DRAFT' || this.isBusy(description.id)) {
      return;
    }
    this.runDraftAction(description.id, () =>
      this.productService.generateDescription([description.productId], this.prompts),
    );
  }

  isBusy(id: string): boolean {
    return this.busyIds().has(id);
  }

  private runDraftAction(id: string, action: () => import('rxjs').Observable<unknown>): void {
    this.actionError.set(null);
    this.busyIds.update((ids) => new Set(ids).add(id));
    action()
      .pipe(
        finalize(() => {
          this.busyIds.update((ids) => {
            const updated = new Set(ids);
            updated.delete(id);
            return updated;
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.loadDescriptions(),
        error: (error: unknown) => {
          console.error('Description action failed.', error);
          this.actionError.set('The description could not be updated. Please try again.');
        },
      });
  }
}
