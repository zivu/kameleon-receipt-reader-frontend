import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MealCalculator } from './meal-calculator';

describe('MealCalculator', () => {
  let component: MealCalculator;
  let fixture: ComponentFixture<MealCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealCalculator],
    }).compileComponents();

    fixture = TestBed.createComponent(MealCalculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
