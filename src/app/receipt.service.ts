import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { ReceiptResponse } from './receipt.model';
import { environment } from '../environments/environment';
import QRCode from 'qrcode';

@Service()
export class ReceiptService {
  private http = inject(HttpClient);

  async uploadReceipt(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('receipt', file);
    const uuid = await firstValueFrom(
      this.http.post<string>(`${environment.apiUrl}/api/receipt`, formData, {
        withCredentials: true,
      }),
    );
    return `${environment.frontEndUrl}/meal-calculator/${uuid}`;
  }

  fetchReceipt(uuid: string): Observable<ReceiptResponse> {
    console.log("fetching receipt");
    const fetchReceiptUrl = `${environment.apiUrl}/api/receipt/${uuid}`;
    return this.http.get<ReceiptResponse>(fetchReceiptUrl);
  }

}
