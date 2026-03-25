import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DocumentValidatorService {
  validate(value: string): boolean {
    const tenant = localStorage.getItem('mifosXTenantIdentifier');
    if (!value || !tenant) return false;

    switch (tenant.toLowerCase()) {
      case 'chile':
        return this.validateRut(value);

      default:
        return true;
    }
  }

  private validateRut(rut: string): boolean {
    rut = rut.toString();
    const limpio = rut.replace(/\./g, '').replace('-', '').toUpperCase();

    if (!/^\d{7,8}[0-9K]$/.test(limpio)) {
      return false;
    }

    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const resto = 11 - (suma % 11);

    let dvCalculado = '';
    if (resto === 11) {
      dvCalculado = '0';
    } else if (resto === 10) {
      dvCalculado = 'K';
    } else {
      dvCalculado = resto.toString();
    }
    return dvCalculado === dv;
  }
}
