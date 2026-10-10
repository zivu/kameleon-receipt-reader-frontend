import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import QRCode from 'qrcode';
import { ReceiptService } from '../receipt.service';
import { ReceiptItem } from '../receipt.model';
import { environment } from '../../environments/environment';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  imports: [],
  selector: 'app-receipt-upload-component',
  styleUrl: './receipt-upload-component.css',
  templateUrl: './receipt-upload-component.html',
})
export class ReceiptUploadComponent {
  private http = inject(HttpClient);
  private receiptService = inject(ReceiptService);
  items = signal<ReceiptItem[]>([]);
  status = signal('Nie wybrano pliku');
  authenticated = signal(false);
  isLoading = false;
  qrCode = '';
  fetchReceiptUrl = '';
  private clipboard = inject(Clipboard);
  copied = signal(false);

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

      this.fetchReceiptUrl = await this.receiptService.uploadReceipt(file);
      this.qrCode = await QRCode.toDataURL(this.fetchReceiptUrl);
      this.status.set('Paragon został przetworzony');
    } catch (error) {
      this.status.set('Wystąpił błąd podczas przetwarzania paragonu');
    } finally {
      this.isLoading = false;
    }
  }

  copyUrl(): void {
    const linkCopied = this.clipboard.copy(this.fetchReceiptUrl);
    if (linkCopied) {
      this.copied.set(true);
      setTimeout(() => {
        this.copied.set(false);
      }, 2000);
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
