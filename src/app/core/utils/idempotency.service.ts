import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IdempotencyService {
  private key: string | undefined | null;

  create() {
    this.key = crypto.randomUUID();
    return this.key;
  }

  get() {
    return this.key;
  }

  clear() {
    this.key = null;
  }
}
