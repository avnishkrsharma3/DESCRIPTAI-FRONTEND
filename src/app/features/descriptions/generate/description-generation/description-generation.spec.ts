import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { DescriptionGeneration } from './description-generation';

describe('DescriptionGeneration', () => {
  let fixture: ComponentFixture<DescriptionGeneration>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionGeneration],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({
                productIds: '11',
                prompts: 'Professional,Short,Seo',
              }),
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    history.replaceState({}, '');
    fixture = TestBed.createComponent(DescriptionGeneration);
  });

  afterEach(() => {
    httpTestingController.verify();
    history.replaceState({}, '');
  });

  it('reads the URL context, generates descriptions, then filters the dashboard by product', () => {
    const navigation = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    const request = httpTestingController.expectOne('http://localhost:8081/api/AI/generate');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      productIds: [11],
      prompts: 'Professional,Short,Seo',
    });
    request.flush([]);

    expect(navigation).toHaveBeenCalledWith(['/approve-dashboard'], {
      queryParams: {
        productIds: '11',
        prompts: 'Professional,Short,Seo',
      },
    });
  });
});
