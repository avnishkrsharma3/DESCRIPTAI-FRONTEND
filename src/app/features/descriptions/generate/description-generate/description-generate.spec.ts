import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionGenerate } from './description-generate';

describe('DescriptionGenerate', () => {
  let component: DescriptionGenerate;
  let fixture: ComponentFixture<DescriptionGenerate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionGenerate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescriptionGenerate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
