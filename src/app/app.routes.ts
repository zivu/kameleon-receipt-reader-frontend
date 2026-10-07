import { Routes } from '@angular/router';
import { MealCalculator } from './meal-calculator/meal-calculator';
import { ReceiptUploadComponent } from './receipt-upload-component/receipt-upload-component';

export const routes: Routes = [
  {
    path: '',
    component: ReceiptUploadComponent
  },
  {
    path: 'meal-calculator/:uuid',
    component: MealCalculator
  }
];
