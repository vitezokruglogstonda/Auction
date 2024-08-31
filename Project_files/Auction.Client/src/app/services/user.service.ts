import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { LoginDto, RegisterDto, User } from "../models/user";
import { Observable, catchError, of, switchMap, tap } from "rxjs";
import { response } from "express";
import { error } from "console";
import { LocalStorageService } from "./local-storage.service";
import { Article, ArticleDto } from "../models/article";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient, private localStorage: LocalStorageService) { }

    logIn(loginDto: LoginDto): Observable<User | null> {
        let querry: String = "account/log-in";
        return this.http.put<User>(environment.server_url + querry, loginDto, { observe: 'response' }).pipe(
            switchMap(response => {
                let user = response.body as User;
                this.localStorage.clear(); //brise stare (mozda nema potrebe)
                this.localStorage.setItem('jwt', response.headers.get('jwt')!);
                this.localStorage.setItem('refreshToken', response.headers.get('RefreshToken')!);
                return of(user)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    logInWithToken(): Observable<User> {
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        let querry: String = "account/log-in-with-token";
        return this.http.put<User>(environment.server_url + querry, null, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            })
        );
    }

    register(registerDto: RegisterDto): Observable<User | null> {

        let querry: String = `account/register`;

        const { profilePicture, ...uploadObject } = registerDto;

        const formData = new FormData();

        formData.append("jsonDto", JSON.stringify(uploadObject));
        if(profilePicture != null)
            formData.append("picture", profilePicture!, profilePicture?.name);

        
        return this.http.post<User>(environment.server_url + querry, formData, { observe: 'response' }).pipe(
            switchMap(response => {
                let user = response.body as User;
                this.localStorage.clear(); //brise stare (mozda nema potrebe)
                this.localStorage.setItem('jwt', response.headers.get('jwt')!);
                this.localStorage.setItem('refreshToken', response.headers.get('RefreshToken')!);
                return of(user)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    findUserByMail(email: String): Observable<boolean> {
        if(email === "")
            return of(false);
        let querry: String = `account/check-email?email=${email}`;
        return this.http.get<boolean>(environment.server_url + querry).pipe(
            switchMap(response=>{
                return of(response);
            }),
            catchError(()=>{
                return of(false);
            })
        );
    }

    signOut(): Observable<boolean> {

        let querry: String = "account/log-out";
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        this.localStorage.clear();
        return this.http.get<boolean>(environment.server_url + querry, httpOptions).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError((error) => {
                if (error.status === 401) {
                  return of(false);
                } else {
                  throw error; 
                }
              })
        );
    }

    changeProfilePhoto(photo: File): Observable<String | null> {
        let querry: String = "account/change-profile-photo";
        const httpOptions = {
            headers: new HttpHeaders({
                // 'Content-Type': 'application/json',
                'JWT': `${this.localStorage.getItem('jwt')}`
            })
        };

        const formData = new FormData();
        formData.append("picture", photo, photo.name);

        return this.http.put<{path: string}>(environment.server_url + querry, formData, httpOptions).pipe(
            switchMap((response: {path: string}) => {
                return of(response.path);
            })
        );
    }

    addMoneyToAccount(amount: number | null): Observable<number | null> {
        let querry: String = "account/add-money-to-balance";
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'JWT': `${this.localStorage.getItem('jwt')}`
            })
        };

        return this.http.put<number>(environment.server_url + querry, amount, httpOptions).pipe(
            switchMap((response: number | null) => {
                return of(response);
            })
        );
    }

    publishArticle(article: ArticleDto): Observable<Article | null> {
        let querry: String = "user/publish-article";
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            })
        };

        const formData = new FormData();

        const { pictures, ...uploadObject } = article;
        formData.append("jsonDto", JSON.stringify(uploadObject));
        // formData.append("title", article.title);
        // formData.append("description", article.description);
        // formData.append("startingPrice", article.startingPrice.toString());
        article.pictures.forEach((file) => {           
            formData.append(`pictures`, file, file.name);
        });

        return this.http.post<Article | null>(environment.server_url + querry, formData, httpOptions).pipe(
            switchMap((response: Article | null) => {
                return of(response);
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

}