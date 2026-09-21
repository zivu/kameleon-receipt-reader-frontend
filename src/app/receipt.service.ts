import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReceiptResponse } from './receipt.model';
import { environment } from '../environments/environment';

@Service()
export class ReceiptService {

  private http = inject(HttpClient);

  uploadReceipt(file: File): Observable<ReceiptResponse> {
    const formData = new FormData();
    formData.append('receipt', file);
    return this.http.post<ReceiptResponse>(`${environment.apiUrl}/api/receipt`, formData, {
      withCredentials: true,
    });
  }

}
