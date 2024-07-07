import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
    constructor(private router: Router, private localStorage: LocalStorageService) {}

    init() {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.saveCurrentRoute();
        }
      });
    }
  
    private saveCurrentRoute() {
      const currentRoute = this.router.url;
      this.localStorage.setItem('currentPage', currentRoute);
    }
  
    getCurrentRoute(): string | null {
      return this.localStorage.getItem('currentPage');
    }

    getCurrentRouteFromUrl(): string | null {
      return (window as any).location.href.split('#')[1];
    }
}