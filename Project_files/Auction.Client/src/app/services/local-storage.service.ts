import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  public setItem(key: string, value: string) {
    if (isPlatformBrowser(this.platformId))
      localStorage.setItem(key, value);
    return null;
  }

  public getItem(key: string) {
    if (isPlatformBrowser(this.platformId))
      return localStorage.getItem(key);
    return null;
  }
  public removeItem(key: string) {
    if (isPlatformBrowser(this.platformId))
      localStorage.removeItem(key);
    return null;
  }

  public clear() {
    if (isPlatformBrowser(this.platformId))
      localStorage.clear();
    return null;
  }
}