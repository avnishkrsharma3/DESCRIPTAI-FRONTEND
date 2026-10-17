import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { authInterceptor } from '../../core/interceptors/Auth.interceptor';
import { ProductDescription } from '../../core/models/product.model';
import { ApproveDashboard } from './approve-dashboard';

const descriptions: ProductDescription[] = [
  {
    id: 'draft-11-v3',
    productId: 11,
    productName: 'Annibale Colombo Bed',
    category: 'furniture',
    originalDescription: 'Original bed description.',
    versionNumber: 3,
    status: 'DRAFT',
    aiGeneratedDescription: 'Latest generated bed description.',
    imageURL: 'https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/1.webp',
    aiModel: 'openai/gpt-oss-120b',
    createdBy: 'Avnish',
    createdAt: '2026-10-16T19:00:00Z',
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    lockVersion: 0,
  },
  {
    id: 'approved-11-v2',
    productId: 11,
    productName: 'Annibale Colombo Bed',
    category: 'furniture',
    originalDescription: 'Original bed description.',
    versionNumber: 2,
    status: 'APPROVED',
    aiGeneratedDescription: 'Approved bed description.',
    imageURL: 'https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/1.webp',
    aiModel: 'openai/gpt-oss-120b',
    createdBy: 'Avnish',
    createdAt: '2026-10-15T19:00:00Z',
    reviewedBy: 'Jordan',
    reviewedAt: '2026-10-16T19:11:01Z',
    rejectionReason: null,
    lockVersion: 1,
  },
  {
    id: 'superseded-11-v1',
    productId: 11,
    productName: 'Annibale Colombo Bed',
    category: 'furniture',
    originalDescription: 'Original bed description.',
    versionNumber: 1,
    status: 'SUPERSEDED',
    aiGeneratedDescription: 'Older bed description.',
    imageURL: 'https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/1.webp',
    aiModel: 'openai/gpt-oss-120b',
    createdBy: 'Avnish',
    createdAt: '2026-10-11T16:18:11Z',
    reviewedBy: 'Avnish',
    reviewedAt: '2026-10-12T16:18:11Z',
    rejectionReason: null,
    lockVersion: 2,
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
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ApproveDashboard);
    fixture.detectChanges();

    const request = httpTestingController.expectOne(
      'http://localhost:8081/api/product/description/status',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush(descriptions);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('shows all statuses, versions, and description metadata', () => {
    const dashboard = fixture.nativeElement as HTMLElement;
    expect(dashboard.textContent).toContain('Annibale Colombo Bed');
    expect(dashboard.textContent).toContain('DRAFT');
    expect(dashboard.textContent).toContain('APPROVED');
    expect(dashboard.textContent).toContain('SUPERSEDED');
    expect(dashboard.textContent).toContain('Version 3');
    expect(dashboard.textContent).toContain('Jordan');
    expect(dashboard.textContent).toContain('openai/gpt-oss-120b');
  });

  it('shows actions only for drafts', () => {
    const cards = fixture.nativeElement.querySelectorAll('.description-record');
    expect(cards).toHaveLength(3);
    expect(cards[0].querySelectorAll('.record-actions button')).toHaveLength(3);
    expect(cards[1].querySelectorAll('.record-actions button')).toHaveLength(0);
    expect(cards[2].querySelectorAll('.record-actions button')).toHaveLength(0);
  });

  it('filters records by status', () => {
    const statusSelect = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    statusSelect.value = 'SUPERSEDED';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.description-record')).toHaveLength(1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Version 1');
  });

  it('approves the description document id and refreshes status', () => {
    const approveButton = fixture.nativeElement.querySelector(
      '.record-actions button:last-child',
    ) as HTMLButtonElement;
    approveButton.click();
    fixture.detectChanges();

    const approveRequest = httpTestingController.expectOne(
      'http://localhost:8081/api/product/description/approve',
    );
    expect(approveRequest.request.method).toBe('POST');
    expect(approveRequest.request.body).toEqual({ listOfIds: ['draft-11-v3'] });
    approveRequest.flush(null);

    const refreshRequest = httpTestingController.expectOne(
      'http://localhost:8081/api/product/description/status',
    );
    refreshRequest.flush(descriptions.map((description) => (
      description.id === 'draft-11-v3'
        ? { ...description, status: 'APPROVED' as const, reviewedBy: 'Avnish' }
        : description
    )));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('APPROVED');
  });

  it('reports status loading errors and allows retrying', () => {
    fixture.componentInstance.loadDescriptions();
    fixture.detectChanges();

    httpTestingController.expectOne(
      'http://localhost:8081/api/product/description/status',
    ).flush('Server error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent)
      .toContain('Could not load product descriptions');

    const retryButton = fixture.nativeElement.querySelector('.retry-button') as HTMLButtonElement;
    retryButton.click();
    fixture.detectChanges();
    httpTestingController.expectOne(
      'http://localhost:8081/api/product/description/status',
    ).flush(descriptions);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Annibale Colombo Bed');
  });
});
