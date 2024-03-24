import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LocalStorageService } from '../services/local-storage.service';
import { Store } from '@ngrx/store';
import { signOutSuccess } from '../store/user/user.action';
import { logout } from '../store/app/app.action';
import { Router } from '@angular/router';
import { SnackbarService } from '../services/snackbar.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private refreshing: boolean = false;

  constructor(private authService: AuthService, private store: Store, private localStorage: LocalStorageService, private router: Router, private snackbarService: SnackbarService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // if(this.localStorage.getItem('jwt'))
    //   request = this.addTokenToRequest(request, this.localStorage.getItem('jwt')!);

    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401 && !this.refreshing/* && error.error.message === 'Token expired'*/) { //ovo
          this.refreshing = true;
          // Token expired, attempt to refresh it
          return this.handleTokenExpiration(request, next);
        }
        else 
        {
          return throwError(error);
        }
      })
    );
  }

  private handleTokenExpiration(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap((newToken) => {
        // If refresh token is successful, retry the original request
        this.refreshing = false;
        this.localStorage.setItem('jwt', newToken!);
        let newRequest = this.addTokenToRequest(request, newToken!);
        return next.handle(newRequest);        
      }),
      catchError((error) => {
        // If refresh token fails, handle the error (e.g., logout user)
        //console.error('Error handling token expiration:', error);
        this.snackbarService.spawnSnackbar(environment.interceptor_sessionExpiredMessage);        
        this.refreshing = false;
        this.localStorage.clear();
        this.store.dispatch(signOutSuccess());
        this.store.dispatch(logout());
        this.router.navigate(['/login']);
        return throwError(error);
      })
    );
  }

  private addTokenToRequest(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    // Clone the request and add the new token to the Authorization header    
    return request.clone({
      setHeaders: { 'JWT': `${token}`, }
    });
  }  

}