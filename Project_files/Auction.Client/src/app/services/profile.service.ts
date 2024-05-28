import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, of, switchMap } from "rxjs";
import { ProfileResult, UserProfile } from "../models/user";
import { environment } from "../../environments/environment";
import { Article } from "../models/article";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    constructor(private http: HttpClient, private localStorage: LocalStorageService) { }

    getProfile(userId: number): Observable<ProfileResult | null> {
        let querry: String = `user/get-profile?id=${userId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<ProfileResult>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    getProfileArticles(userId: number): Observable<Article[] | null> {
        let querry: String = `user/get-profile-articles?id=${userId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<Article[]>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }
}