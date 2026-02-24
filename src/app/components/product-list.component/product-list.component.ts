import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  logout() {
    this.authService.logout();
  }
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];

  searchQuery: string = '';
  selectedCategory: string = 'all';
  loading: boolean = false;
  isChecked: boolean = true;
  public selectedProducts: Product[] = [];

  constructor(private productService: ProductService, private cdr: ChangeDetectorRef, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  toggleSelection(product: Product): void {
    if (this.isSelected(product)) {
      this.selectedProducts = this.selectedProducts.filter(p => p.id !== product.id);
    } else {
      this.selectedProducts.push(product);
    }
  }

  isSelected(product: Product): boolean {
    return this.selectedProducts.some(p => p.id === product.id);
  }

  isAllSelected(): boolean {
    if (this.filteredProducts.length === 0) {
      return false;
    }
    return this.selectedProducts.length === this.filteredProducts.length;
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedProducts = [];
    } else {
      this.selectedProducts = [...this.filteredProducts];
    }
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        this.products = response.products;
        this.filteredProducts = response.products;
        this.categories = [...new Set(this.products.map(p => p.category))];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.loadProducts();
      return;
    }

    this.loading = true;
    this.productService.searchProducts(this.searchQuery).subscribe({
      next: (response) => {
        this.products = response.products;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error searching products:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let tempProducts = this.products;

    if (this.selectedCategory !== 'all') {
      tempProducts = tempProducts.filter(p => p.category === this.selectedCategory);
    }

    this.filteredProducts = tempProducts;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.loadProducts();
  }

  generateDescriptions(): void {
    console.log('Generating descriptions for:', this.selectedProducts);
    // Future implementation: call a service to generate descriptions
  }

  clearSelection(): void {
    this.selectedProducts = [];
  }
}