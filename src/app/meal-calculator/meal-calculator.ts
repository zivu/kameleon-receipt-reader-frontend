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
        this.items.set(receipt.items);
        this.isLoading.set(false);
      });
    } catch (error) {
      console.log("Failed to fetch receipt", error);
    }
  }

  getQuantity(item: ReceiptItem): number {
    return this.quantities[item.name] ?? 0;
  }

  increaseQuantity(item: ReceiptItem): void {
    this.quantities[item.name] = this.getQuantity(item) + 1;
  }

  decreaseQuantity(item: ReceiptItem): void {
    const currentQuantity = this.getQuantity(item);

    if (currentQuantity > 0) {
      this.quantities[item.name] = currentQuantity - 1;
    }
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
