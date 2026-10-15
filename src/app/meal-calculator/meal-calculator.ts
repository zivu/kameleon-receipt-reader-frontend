import { Component, inject, Input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReceiptItem } from '../receipt.model';
import { ActivatedRoute } from '@angular/router';
import { ReceiptService } from '../receipt.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-meal-calculator',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './meal-calculator.component.html',
  styleUrl: './meal-calculator.component.css',
})
export class MealCalculator {
  items = signal<ReceiptItem[]>([]);
  receiptService = inject(ReceiptService);
  quantities: Record<string, number> = {};
  uuid: string = '';
  isLoading = signal<boolean>(true);

  constructor(private route: ActivatedRoute) {
    console.log(this.route.snapshot.paramMap.get('uuid'));
  }

   ngOnInit() {
    this.uuid = this.route.snapshot.paramMap.get('uuid')!;
    try {
      const receipt = firstValueFrom(this.receiptService.fetchReceipt(this.uuid));
      receipt.then((receipt) => {
        const uniqueItems = new Map<string, ReceiptItem>();
        for (const item of receipt.items) {
          const key = this.itemKey(item);
          if (!uniqueItems.has(key)) {
            uniqueItems.set(key, item);
          }
        }
        this.items.set([...uniqueItems.values()]);
        this.isLoading.set(false);
      });
    } catch (error) {
      console.log("Failed to fetch receipt", error);
    }
  }
  
  private itemKey(item: ReceiptItem): string {
    return JSON.stringify([
      item.name,
      item.quantity,
      item.unitPricePaid
    ]);
  }
  
  getQuantity(item: ReceiptItem): number {
    return this.quantities[this.itemKey(item)] ?? 0;
  }
  
  increaseQuantity(item: ReceiptItem): void {
    this.quantities[this.itemKey(item)] = this.getQuantity(item) + 1;
  }

  decreaseQuantity(item: ReceiptItem): void {
    const key = this.itemKey(item);
    this.quantities[key] = Math.max(0, this.getQuantity(item) - 1);
  }

  isSelected(item: ReceiptItem): boolean {
    return this.getQuantity(item) > 0;
  }

  get selectionCount(): number {
    return Object.values(this.quantities).reduce((sum, quantity) => sum + quantity, 0);
  }

  get total(): number {
    return this.items().reduce((sum, item) => {
      return sum + item.unitPricePaid * this.getQuantity(item);
    }, 0);
  }

  clearSelection(): void {
    this.quantities = {};
  }
}
