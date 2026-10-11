import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { authInterceptor } from '../../core/interceptors/Auth.interceptor';
import { ApprovedProduct } from '../../core/models/product.model';
import { ApproveDashboard } from './approve-dashboard';

const approvedProducts: ApprovedProduct[] = [
  {
    productName: 'Eyeshadow Palette with Mirror',
    category: 'beauty',
    originalDescription: 'The original eyeshadow palette description.',
    aiGeneratedDescription: 'An improved eyeshadow palette description.',
    aiModel: 'openai/gpt-oss-120b',
    imageURL: 'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp',
    createdTime: '2026-10-11T05:49:37.949Z',
    approvedTime: '2026-10-11T05:49:43.586Z',
    productApprovedBy: 'Avnish',
  },
  {
    productName: 'Velvet Lipstick',
    category: 'beauty',
    originalDescription: 'Original lipstick description.',
    aiGeneratedDescription: 'AI lipstick description.',
    aiModel: 'openai/gpt-oss-120b',
    imageURL: 'https://cdn.dummyjson.com/product-images/beauty/1/1.webp',
    createdTime: '2026-10-12T05:49:37.949Z',
    approvedTime: '2026-10-12T05:49:43.586Z',
    productApprovedBy: 'Jordan',
  },
];

describe('ApproveDashboard', () => {
  let fixture: ComponentFixture<ApproveDashboard>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.setItem(
      'auth_data',
      JSON.stringify({ username: 'Avnish', token: 'test-token', expiresAt: Date.now() + 60_000 }),
    );

    await TestBed.configureTestingModule({
      imports: [ApproveDashboard],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ApproveDashboard);
    fixture.detectChanges();

    const request = httpTestingController.expectOne(
      'http://localhost:8081/api/products/aprroved/products',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush(approvedProducts);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should display the first approved product details', () => {
    const dashboard = fixture.nativeElement as HTMLElement;

    expect(dashboard.textContent).toContain('Eyeshadow Palette with Mirror');
    expect(dashboard.textContent).toContain('Original description');
    expect(dashboard.textContent).toContain('AI-generated description');
    expect(dashboard.textContent).toContain('openai/gpt-oss-120b');
    expect(dashboard.textContent).toContain('Approved by Avnish');
    expect(dashboard.textContent).toContain('Product 1 of 2');
  });

  it('should navigate through approved products', () => {
    const nextButton = fixture.nativeElement.querySelector('.next-button') as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Velvet Lipstick');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Product 2 of 2');
  });

  it('should filter by approver name and approval date', () => {
    const approverInput = fixture.nativeElement.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;
    approverInput.value = 'jordan';
    approverInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Velvet Lipstick');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Product 1 of 1');

    const dateInput = fixture.nativeElement.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement;
    dateInput.value = '2026-10-11';
    dateInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No matching products');
  });

  it('should show a request error and allow retrying', () => {
    fixture.componentInstance.loadProducts();
    fixture.detectChanges();

    httpTestingController.expectOne(
      'http://localhost:8081/api/products/aprroved/products',
    ).flush('Server error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent)
      .toContain('Could not load approved products');

    const retryButton = fixture.nativeElement.querySelector('.retry-button') as HTMLButtonElement;
    retryButton.click();
    fixture.detectChanges();
    httpTestingController.expectOne(
      'http://localhost:8081/api/products/aprroved/products',
    ).flush(approvedProducts);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Eyeshadow Palette with Mirror');
  });

  it('should provide descriptive alternative text for the product image', () => {
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.alt).toBe('Eyeshadow Palette with Mirror');
  });
});
