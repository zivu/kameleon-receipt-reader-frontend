export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  linePriceBeforeDiscount: number;
  discount: number;
  linePrice: number;
  unitPricePaid: number;
}

export interface ReceiptResponse {
  items: ReceiptItem[];
}
