import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";
import { Observable, catchError, of, switchMap } from "rxjs";
import { User } from "../models/user";
import { Article } from "../models/article";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AdminService {

    constructor(private http: HttpClient, private localStorage: LocalStorageService) { }

    loadTotalNumberOfUsers(): Observable<number | null>{
        let querry: String = `admin/get-total-number-of-users`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<number>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    getAllUsers(pageSize: number, pageIndex: number): Observable<User[] | null>{
        let querry: String = `admin/get-all-users?pageSize=${pageSize}&pageIndex=${pageIndex}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<User[]>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    loadTotalNumberOfArticles(): Observable<number | null>{
        let querry: String = `admin/get-total-number-of-articles`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<number>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    getAllArticles(pageSize: number, pageIndex: number): Observable<Article[] | null>{
        let querry: String = `admin/get-all-articles?pageSize=${pageSize}&pageIndex=${pageIndex}`;
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

    getArticlesByTitle(searchQuery: string): Observable<Article[] | null>{
        let querry: String = `admin/search-articles-by-title?searchQuery=${searchQuery}`;
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

    republishArticle(articleId: number): Observable<boolean>{
        let querry: String = `admin/republish-article?articleId=${articleId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.post<boolean>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(false);
            })
        );
    }

    removeArticle(articleId: number): Observable<boolean>{
        let querry: String = `admin/remove-article?articleId=${articleId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.delete<boolean>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(false);
            })
        );
    }


}