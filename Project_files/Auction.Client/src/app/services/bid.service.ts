import { Injectable } from "@angular/core";
import { Observable, Subject, catchError, of, switchMap } from "rxjs";
import { SocketService } from "./socket.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";
import { environment } from "../../environments/environment";
import { BidItemDto, BidCompletionDto, BidDto } from "../models/bid";
import { ArticleStatus } from "../models/article";

@Injectable({
    providedIn: 'root'
})
export class BidService {

    private newBidItemSubject: Subject<BidItemDto>;
    public newBidItem: Observable<BidItemDto>;
    private articleStatusChangedSubject: Subject<BidCompletionDto>;
    public articleStatusChanged: Observable<BidCompletionDto>;    
    public currentArticleId: number | null;

    constructor(private socket: SocketService, private http: HttpClient, private localStorage: LocalStorageService) {
        this.newBidItemSubject = new Subject<BidItemDto>();
        this.newBidItem = this.newBidItemSubject.asObservable(); 
        this.articleStatusChangedSubject = new Subject<BidCompletionDto>();
        this.articleStatusChanged = this.articleStatusChangedSubject.asObservable(); 
        this.currentArticleId = null;
    }

    startConnection(articleId: number){
        this.currentArticleId = articleId;

        this.socket.startConnection(
            environment.socketSettings.bidSocketSettings.hubName,
            environment.socketSettings.bidSocketSettings.hubUrl,
            environment.socketSettings.bidSocketSettings.groupEndpoints.join,
            articleId,
            {
                "NewBidItem": this.newBidItemSubject,
                "ArticleStatusChanged": this.articleStatusChangedSubject,
            }
        );
    }

    getBidList(articleId: number): Observable<BidItemDto[] | null> {
        // this.currentArticleId = articleId;

        let querry: String = `bid/get-bid-list?articleId=${articleId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        let result: Observable<BidItemDto[] | null> = this.http.get<BidItemDto[]>(environment.server_url + querry, httpOptions).pipe(
            switchMap((response: BidItemDto[]) => {
                return of(response)
            }),
            catchError(() => {
                return of(null);
            })
        );

        // result.subscribe(res =>{
        //     if(res !== null){
        //         this.socket.startConnection(
        //             environment.socketSettings.bidSocketSettings.hubName,
        //             environment.socketSettings.bidSocketSettings.hubUrl,
        //             environment.socketSettings.bidSocketSettings.groupEndpoints.join,
        //             articleId,
        //             {
        //                 "NewBidItem": this.newBidItemSubject,
        //                 "ArticleSold": this.biddingClosedSubject,
        //                 "ArticleExpired": this.articleExpiredSubject,
        //             }
        //         );
        //     }
        // })

        return result;
    }

    newBid(userId: number, articleId: number, amount: number){
        let bidDto: BidDto = {
            userId: userId,
            articleId: articleId,
            amount: amount
        }
        this.socket.emit(
            environment.socketSettings.bidSocketSettings.hubName,
            'Bid', 
            bidDto
        );
    }

    closeConnection(){
        this.socket.closeConnection(
            environment.socketSettings.bidSocketSettings.hubName,
            environment.socketSettings.bidSocketSettings.groupEndpoints.leave,
            this.currentArticleId as number
        );
    }

}