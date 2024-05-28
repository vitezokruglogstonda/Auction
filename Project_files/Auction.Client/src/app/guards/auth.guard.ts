import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { User, UserType } from "../models/user";
import { AppState } from "../store/app.state";
import { Store } from "@ngrx/store";
import { Observable, catchError, map, of, switchMap, throwError } from "rxjs";
import { LocalStorageService } from "../services/local-storage.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router, private localStorage: LocalStorageService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

        let jwt: string | null = this.localStorage.getItem("jwt");
        if (route.data['roles'].includes(UserType.Guest)) {
            if (jwt === null)
                return of(true);
            this.router.navigate(['']);
            return of(false);            
        }
        if (jwt === null){
            this.router.navigate(['/login']);
            return of(false);
        }
        return this.authService.isAuthenticated().pipe(
            map((result: UserType | null) => {
                if (result === null || !route.data['roles'].includes(result)) {
                    this.router.navigate(['/login']);
                    return false;
                }
                return true;
            }),
            // catchError((error) => {
            //     this.router.navigate(['/login']); //ovo mnogo ne valja (pogledaj notes)
            //     return throwError(error);
            // })
        );
    }
}


