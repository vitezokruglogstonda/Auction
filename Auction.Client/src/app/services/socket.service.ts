import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpTransportType } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../environments/environment';
import { BidCompletionDto, BidItemDto } from '../models/article';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private hubConnection: signalR.HubConnection | null;

    constructor(private localStorage: LocalStorageService) {
        this.hubConnection = null;
    }

    startConnection(articleId: number, newBidItemSubject: Subject<BidItemDto>, biddingClosedSubject: Subject<BidCompletionDto>) {
        if(this.hubConnection !== null)
            return;
        this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(environment.server_url + 'bid-hub', {
            accessTokenFactory: () => this.localStorage.getItem("jwt") as string,
        })
        .build();
        this.hubConnection
            .start()
            .then(() => {
                console.log('Connection started');
                this.emit('JoinGroup', articleId);
                this.hubConnection!.on("NewBidItem", (data: BidItemDto) => {
                    if (data !== null)
                        newBidItemSubject.next(data);
                });
                this.hubConnection!.on("ArticleSold", (data: BidCompletionDto) => {
                    if (data !== null)
                        biddingClosedSubject.next(data);
                });
            })
            .catch(err => console.log('Error while starting connection: ' + err));
    }

    closeConnection(articleId: number){
        if(!!this.hubConnection){
            this.emit('LeaveGroup', articleId);
            this.hubConnection.stop();
            this.hubConnection = null;
        }
    }

    listen(endpoint: string): Observable<any> {
        return new Observable<any>((observer) => {
            this.hubConnection!.on(endpoint, (data: any) => {
                if (data !== null)
                    observer.next(data);
            });
        });
    }

    emit(endpoint: string, data: any): void {
        this.hubConnection!.invoke(endpoint, data);
    }

}