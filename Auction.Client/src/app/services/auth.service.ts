import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, of, switchMap } from "rxjs";
import { UserType } from "../models/user";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) { }

    isAuthenticated(jwt: String): Observable<UserType | null> {
        let querry: String = `account/check-if-authorized`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${jwt}`
            })
        };
        return this.http.get<UserType | null>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            })
        );
    }
}