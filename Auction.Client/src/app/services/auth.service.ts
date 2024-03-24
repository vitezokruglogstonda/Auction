import { HttpBackend, HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, of, switchMap } from "rxjs";
import { UserType } from "../models/user";
import { environment } from "../../environments/environment";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient, private localStorage: LocalStorageService/*, private handler: HttpBackend*/) { }

    isAuthenticated(): Observable<UserType | null> {

        let accessToken: string | null = this.localStorage.getItem("jwt");
        if (accessToken === null)
            return of(null);

        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${accessToken}`
            })
        };

        let querry: String = `account/check-if-authorized`;
        return this.http.get<UserType | null>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            })
        );
    }

    refreshToken(): Observable<string | null> {
        let refreshToken: string | null = this.localStorage.getItem("refreshToken");
        if (refreshToken === null)
            return of(null);

        let headers = new HttpHeaders({
            'RefreshToken': `${refreshToken}`
        })

        //let client = new HttpClient(this.handler);

        let querry: String = `account/refresh-token`;
        return this.http.post<string | null>(environment.server_url + querry, null, { headers, observe: 'response' }).pipe(
            switchMap(response => {
                return of(response.headers.get('jwt')!)
            })
        );

    }

}