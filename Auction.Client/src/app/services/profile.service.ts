import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, of, switchMap } from "rxjs";
import { UserProfile } from "../models/user";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    constructor(private http: HttpClient) { }

    getProfile(userId: number): Observable<UserProfile | null> {
        let querry: String = `user/get-profile?id=${userId}`;
        return this.http.get<UserProfile>(environment.server_url + querry).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }
}