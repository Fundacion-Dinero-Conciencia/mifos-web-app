import { Pipe, PipeTransform } from '@angular/core';

export type Country = 'chile' | 'argentina';

@Pipe({
  name: 'documentFormat'
})
export class DocumentFormatPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (!value) return '';

    const raw = String(value).trim();
    const country = localStorage.getItem('mifosXTenantIdentifier') as Country;
    switch (country) {
      // =====================================
      // ARGENTINA
      // =====================================
      case 'argentina':
        return this.formatArgentina(raw);

      // =====================================
      // CHILE
      // =====================================
      case 'chile':
        return this.formatChile(raw);

      default:
        return raw;
    }
  }

  // =====================================================
  // ARGENTINA
  // =====================================================

  private formatArgentina(value: string): string {
    const digits = value.replace(/\D/g, '');

    // =====================
    // CUIT / CUIL
    // 11 dígitos
    // 20-12345678-9
    // =====================
    if (digits.length === 11) {
      return digits.replace(/^(\d{2})(\d{8})(\d)$/, '$1-$2-$3');
    }

    // =====================
    // DNI
    // 7 u 8 dígitos
    // 12.345.678
    // =====================
    if (digits.length >= 7 && digits.length <= 8) {
      return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    return value;
  }

  // =====================================================
  // CHILE
  // =====================================================

  private formatChile(value: string): string {
    const clean = value.replace(/[^\dkK]/g, '');

    if (clean.length < 2) {
      return value;
    }

    const body = clean.slice(0, -1);

    const verifier = clean.slice(-1).toUpperCase();

    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formattedBody}-${verifier}`;
  }
}
