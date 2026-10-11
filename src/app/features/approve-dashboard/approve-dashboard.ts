import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ApprovedProduct } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-approve-dashboard',
  imports: [DatePipe, NgOptimizedImage],
  templateUrl: './approve-dashboard.html',
  styleUrl: './approve-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveDashboard implements OnInit {
  private readonly productService = inject(ProductService);

  readonly approvedProducts = signal<ApprovedProduct[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly approvedByFilter = signal('');
  readonly approvedDateFilter = signal('');
  readonly currentIndex = signal(0);

  readonly filteredProducts = computed(() => {
    const approver = this.approvedByFilter().trim().toLocaleLowerCase();
    const date = this.approvedDateFilter();

    return this.approvedProducts().filter((product) => {
      const matchesApprover = !approver
        || product.productApprovedBy.toLocaleLowerCase().includes(approver);
      const approvedDate = new Date(product.approvedTime);
      const approvedDateKey = Number.isNaN(approvedDate.getTime())
        ? ''
        : [
            approvedDate.getFullYear(),
            String(approvedDate.getMonth() + 1).padStart(2, '0'),
            String(approvedDate.getDate()).padStart(2, '0'),
          ].join('-');
      const matchesDate = !date
        || approvedDateKey === date;

      return matchesApprover && matchesDate;
    });
  });

  readonly activeProduct = computed(
    () => this.filteredProducts()[this.currentIndex()] ?? null,
  );

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.productService.getApprovedProducts().subscribe({
      next: (products) => {
        this.approvedProducts.set(products);
        this.currentIndex.set(0);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load approved products.', error);
        this.loadError.set('Could not load approved products. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  setApprovedByFilter(value: string): void {
    this.approvedByFilter.set(value);
    this.currentIndex.set(0);
  }

  setApprovedDateFilter(value: string): void {
    this.approvedDateFilter.set(value);
    this.currentIndex.set(0);
  }

  clearFilters(): void {
    this.approvedByFilter.set('');
    this.approvedDateFilter.set('');
    this.currentIndex.set(0);
  }

  showPrevious(): void {
    this.currentIndex.update((index) => Math.max(0, index - 1));
  }

  showNext(): void {
    this.currentIndex.update((index) => Math.min(this.filteredProducts().length - 1, index + 1));
  }
}
