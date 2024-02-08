import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { User, UserType } from "../models/user";
import { AppState } from "../store/app.state";
import { Store } from "@ngrx/store";
import { selectJwt } from "../store/user/user.selector";
import { Observable, map, of, switchMap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    private jwt: String = "";

    constructor(private authService: AuthService, private router: Router, private store: Store<AppState>) {
        this.store.select(selectJwt).subscribe((state) => {
            this.jwt = state;
        });
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        if (route.data['roles'].includes(UserType.Guest)) {
            if (this.jwt === "")
                return of(true);
            this.router.navigate(['']);
            return of(false);            
        }
        if (this.jwt === ""){
            this.router.navigate(['/login']);
            return of(false);
        }
        return this.authService.isAuthenticated(this.jwt).pipe(
            map((result: UserType | null) => {
                if (result === null || !route.data['roles'].includes(result)) {
                    this.router.navigate(['/login']);
                    return false;
                }
                return true;
            })
        );
    }
}


