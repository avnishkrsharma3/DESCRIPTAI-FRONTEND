import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionGeneration } from './description-generation';

describe('DescriptionGeneration', () => {
  let component: DescriptionGeneration;
  let fixture: ComponentFixture<DescriptionGeneration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionGeneration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescriptionGeneration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
