import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceiptUploadComponent } from './receipt-upload-component';

describe('ReceiptUploadComponent', () => {
  let component: ReceiptUploadComponent;
  let fixture: ComponentFixture<ReceiptUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptUploadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptUploadComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
