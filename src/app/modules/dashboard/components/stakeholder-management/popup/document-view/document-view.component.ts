import { Component, ViewEncapsulation, Inject, HostListener, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChangeDetectionStrategy, inject } from '@angular/core';
import { ApplicationRejectionComponent } from '../application-rejection/application-rejection.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

interface Certificate {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  file?: string;
  url?: string;
  date?: string | Date;
  type?: string;
}

interface DialogData {
  certificate?: Certificate;
  certificates?: Certificate[];
  index?: number;
}

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrl: './document-view.component.css',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentViewComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  readonly cdr = inject(ChangeDetectorRef);
  
  certificate: Certificate | null = null;
  certificates: Certificate[] = [];
  currentIndex: number = 0;
  imageLoading: boolean = false;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<DocumentViewComponent>
  ) {
    this.initializeData();
  }

  ngOnInit() {
    // Set focus to the modal for keyboard navigation
    setTimeout(() => {
      const modalElement = document.querySelector('[tabindex="-1"]') as HTMLElement;
      if (modalElement) {
        modalElement.focus();
      }
    }, 100);
  }

  private initializeData(): void {
    console.log("Document data:", this.data);

    if (this.data) {
      if (Array.isArray(this.data.certificates) && this.data.certificates.length) {
        this.certificates = this.data.certificates;
        this.currentIndex = Math.max(0, Math.min(this.data.index || 0, this.certificates.length - 1));
      } else if (this.data.certificate) {
        this.certificates = [this.data.certificate];
        this.currentIndex = 0;
      }
      
      if (this.certificates.length > 0) {
        this.certificate = this.certificates[this.currentIndex];
      }
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.certificate = this.certificates[this.currentIndex];
      this.cdr.markForCheck();
    }
  }

  next(): void {
    if (this.currentIndex < this.certificates.length - 1) {
      this.currentIndex++;
      this.certificate = this.certificates[this.currentIndex];
      this.cdr.markForCheck();
    }
  }

  downloadPDF(): void {
    if (!this.certificate || (!this.certificate.url && !this.certificate.file)) {
      console.warn('No download URL available');
      return;
    }

    try {
      const link = document.createElement('a');
      const downloadUrl = this.certificate.url || this.certificate.file!;
      
      link.href = downloadUrl;
      
      // Determine file extension and name
      const fileName = this.getFileName();
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Temporarily add to DOM and click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Downloaded: ${fileName}`);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      this.openInNewTab();
    }
  }

  private getFileName(): string {
    const baseName = this.certificate?.name || this.certificate?.title || 'document';
    const fileUrl = this.certificate?.file || this.certificate?.url || '';
    
    // Check if it's a PDF
    if (fileUrl.toLowerCase().includes('.pdf') || this.certificate?.type === 'pdf') {
      return baseName.endsWith('.pdf') ? baseName : `${baseName}.pdf`;
    }
    
    // Extract extension from URL if possible
    const urlParts = fileUrl.split('.');
    const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split('?')[0] : '';
    
    if (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension.toLowerCase())) {
      return baseName.includes('.') ? baseName : `${baseName}.${extension}`;
    }
    
    return baseName;
  }

  private openInNewTab(): void {
    const url = this.certificate?.url || this.certificate?.file;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ApplicationRejectionComponent, {
      width: '580px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      position: {
        top: '120px'
      },
      panelClass: 'custom-dialog-top-center',
      backdropClass: 'blurred-backdrop1',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result:`, result);
      // Refocus the main modal
      setTimeout(() => {
        const modalElement = document.querySelector('[tabindex="-1"]') as HTMLElement;
        if (modalElement) {
          modalElement.focus();
        }
      }, 100);
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.warn('Image failed to load:', target.src);
    
    // Try fallback image
    const fallbackUrl = '/assets/images/certificate-1.png';
    if (target.src !== fallbackUrl) {
      target.src = fallbackUrl;
      return;
    }
    
    // Ultimate fallback: SVG placeholder
    target.src = this.createFallbackImageUrl();
    target.onerror = null; // Prevent infinite loop
  }

  private createFallbackImageUrl(): string {
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#F3F4F6" rx="8"/>
        <circle cx="150" cy="80" r="20" fill="#D1D5DB"/>
        <path d="M130 80 L150 60 L170 80 L160 90 L150 80 L140 90 Z" fill="#9CA3AF"/>
        <text x="150" y="130" text-anchor="middle" fill="#6B7280" font-family="Arial, sans-serif" font-size="14">
          Image not available
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Only handle if this modal is focused or no other modal is open
    if (!this.dialogRef || this.dialog.openDialogs.length > 1) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.prev();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;
      case 'Escape':
        event.preventDefault();
        this.dialogRef.close();
        break;
      case 'Enter':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.downloadPDF();
        }
        break;
      case 'd':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.downloadPDF();
        }
        break;
    }
  }

  // Handle backdrop clicks
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.dialogRef.close();
    }
  }

  // Get file type for display
  getFileType(): string {
    if (!this.certificate?.file && !this.certificate?.url) return 'unknown';
    
    const fileUrl = this.certificate.file || this.certificate.url || '';
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return 'image';
      default:
        return 'document';
    }
  }

  // Check if document is viewable inline
  isInlineViewable(): boolean {
    return this.getFileType() === 'image';
  }

  // Format file size if available
  formatFileSize(bytes?: number): string {
    if (!bytes) return '';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  }
}