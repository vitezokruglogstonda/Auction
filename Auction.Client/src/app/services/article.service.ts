import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, of, switchMap } from "rxjs";
import { Article, ArticleInfoDto, ArticleOwners, BidDto, BidItem, BidItemDto } from "../models/article";
import { LocalStorageService } from "./local-storage.service";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ArticleService {

    constructor(private http: HttpClient, private localStorage: LocalStorageService) { }

    getArticles(pageSize: number, pageIndex: number): Observable<Article[] | null>{
        let querry: String = `article/get-articles?pageSize=${pageSize}&pageIndex=${pageIndex}`;
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

    getTotalNumberOfArticles(): Observable<number | null>{
        let querry: String = `article/get-number-of-articles`;
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

    getArticlesByTitle(searchQuery: string): Observable<Article[] | null>{
        let querry: String = `article/search-articles-by-title?searchQuery=${searchQuery}`;
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

    getSingleArticle(articleId: number): Observable<Article | null>{
        let querry: String = `article/get-article?articleId=${articleId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<Article>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    getArticleOwners(creatorId: number, customerId: number | null): Observable<ArticleOwners | null>{
        if(customerId===null)
            customerId=-1;
        let querry: String = `article/get-article-owners?creatorId=${creatorId}&customerId=${customerId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<ArticleOwners>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    checkIfCurrentlyBidding(articleId: number): Observable<boolean | null>
    {
        let querry: String = `article/check-if-bidding?articleId=${articleId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<boolean>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    //BID SERVICE

    getBidList(articleId: number): Observable<BidItemDto[] | null>
    {
        let querry: String = `bid/get-bid-list?articleId=${articleId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<BidItemDto[]>(environment.server_url + querry, httpOptions).pipe(
            switchMap((response:BidItemDto[]) => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    startBidding(articleId: number): Observable<ArticleInfoDto | null>
    {
        let querry: String = `bid/start-bidding?articleId=${articleId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<ArticleInfoDto>(environment.server_url + querry, httpOptions).pipe(
            switchMap(response => {
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

    newBid(articleId: number, amount: number): Observable<BidItemDto | null>
    {
        let bidDto: BidDto = {
            articleId: articleId,
            amount: amount
        }
        let querry: String = `bid/new-bid`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.post<BidItemDto>(environment.server_url + querry, bidDto, httpOptions).pipe(
            switchMap((response:BidItemDto) => {                
                return of(response)
            }),
            catchError( () => {
                return of(null);
            })
        );
    }

}