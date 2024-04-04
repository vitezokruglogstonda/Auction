import { Injectable } from "@angular/core";
import { Observable, catchError, of, switchMap } from "rxjs";
import { BidDto, BidItemDto } from "../models/article";
import { SocketService } from "./socket.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class BidService {

    //public bidList: Observable<BidItemDto[]>;
    public newBidItem: Observable<BidItemDto>;

    constructor(private socket: SocketService, private http: HttpClient, private localStorage: LocalStorageService) {
        //this.bidList = this.socket.listen("getBidList"); 
        this.newBidItem = new Observable<BidItemDto>; 
    }

    getBidList(articleId: number): Observable<BidItemDto[] | null> {
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

        result.subscribe(res =>{
            if(res !== null){
                this.socket.startConnection(articleId);
                //this.socket.emit('JoinGroup', articleId);
                this.newBidItem = this.socket.listen("newBidItem");
            }
        })

        return result;
    }

    newBid(userId: number, articleId: number, amount: number){
        let bidDto: BidDto = {
            userId: userId,
            articleId: articleId,
            amount: amount
        }
        this.socket.emit('Bid', bidDto);
    }

}