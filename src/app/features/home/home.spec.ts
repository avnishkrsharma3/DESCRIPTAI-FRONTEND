import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
  });

  it('should provide routes to the product catalog and approvals dashboard', () => {
    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;

    expect([...links].some((link) => link.textContent?.includes('Product catalog')
      && link.getAttribute('href') === '/products')).toBe(true);
    expect([...links].some((link) => link.textContent?.includes('Approval dashboard')
      && link.getAttribute('href') === '/approve-dashboard')).toBe(true);
  });
});
