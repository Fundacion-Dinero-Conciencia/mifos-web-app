import { Injectable } from '@angular/core';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouteLoaderService {
  // true = mostrando loader, false = oculto
  private _loading$ = new BehaviorSubject<boolean>(false);
  loading$ = this._loading$.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.hide();
      }
    });
  }

  show() {
    setTimeout(() => {
      const globalLoadingBar = document.getElementById('global-loader');
      if (globalLoadingBar) {
        globalLoadingBar.style.visibility = 'visible';
      }
    }, 10);
  }

  hide() {
    setTimeout(() => {
      const globalLoadingBar = document.getElementById('global-loader');
      if (globalLoadingBar) {
        globalLoadingBar.style.visibility = 'hidden';
      }
    }, 10);
  }
}
