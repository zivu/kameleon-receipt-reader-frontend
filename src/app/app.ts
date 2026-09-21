import { Component, inject, signal } from '@angular/core';
import { ReceiptService } from './receipt.service';
import { ReceiptItem } from './receipt.model';
import { MealCalculator } from './meal-calculator/meal-calculator';
import localePl from '@angular/common/locales/pl';
import { registerLocaleData } from '@angular/common';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

registerLocaleData(localePl);

@Component({
  imports: [MealCalculator],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private http = inject(HttpClient);
  private receiptService = inject(ReceiptService);
  items = signal<ReceiptItem[]>([]);
  status = signal('Nie wybrano pliku');
  authenticated = signal(false);
  isLoading = false;

  login(): void {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }

  constructor() {
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    // @ts-ignore
    this.http
      .get<{ authenticated: boolean }>(`${environment.apiUrl}/api/auth/me`, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          if (response.authenticated) {
            this.authenticated.set(true);
          } else {
            this.login();
          }
        },
        error: () => {
          this.login();
        },
      });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.isLoading = true;

    try {
      const file = await this.convertHeicToJpeg(input.files[0]);

      this.status.set(`Wybrano: ${file.name}`);

      const response = await firstValueFrom(this.receiptService.uploadReceipt(file));

      this.items.set(response.items);
      this.status.set('Paragon został przetworzony');
    } catch (error) {
      this.status.set('Wystąpił błąd podczas przetwarzania paragonu');
    } finally {
      this.isLoading = false;
    }
  }

  async convertHeicToJpeg(file: File): Promise<File> {
    const isHeic =
      file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name);

    if (!isHeic) {
      return file;
    }

    const { default: heic2any } = await import('heic2any');

    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    const blob = Array.isArray(result) ? result[0] : result;

    return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
      type: 'image/jpeg',
    });
  }
}
