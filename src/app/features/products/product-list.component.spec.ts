import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Product, ProductsResponse } from '../../core/models/product.model';
import { ProductListComponent } from './product-list.component';

const products: Product[] = [
  {
    id: 1,
    title: 'Eyeshadow Palette',
    description: 'A colorful palette for any occasion.',
    category: 'beauty',
    price: 32,
    brand: 'Studio',
    thumbnail: 'https://example.com/palette.webp',
    rating: 4.8,
  },
];

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProductListComponent);
    fixture.detectChanges();

    const response: ProductsResponse = {
      products,
      total: products.length,
      skip: 0,
      limit: 100,
    };
    httpTestingController.expectOne('http://localhost:8081/api/products').flush(response);
    fixture.detectChanges();
  });

  afterEach(() => httpTestingController.verify());

  it('should display catalog products in the redesigned card layout', () => {
    const catalog = fixture.nativeElement as HTMLElement;

    expect(catalog.querySelector('h1')?.textContent).toContain('Product catalog');
    expect(catalog.querySelector('.product-card h2')?.textContent).toContain('Eyeshadow Palette');
    expect(catalog.querySelector('.category-chip')?.textContent).toContain('beauty');
  });

  it('should show the selection toolbar after selecting a product', () => {
    const checkbox = fixture.nativeElement.querySelector(
      '.product-select input',
    ) as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.selection-toolbar')?.textContent)
      .toContain('1 product selected');
  });
});
