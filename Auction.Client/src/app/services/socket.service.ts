import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpTransportType } from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private hubConnection: signalR.HubConnection | null;

    constructor(private localStorage: LocalStorageService) {
        // this.hubConnection = new signalR.HubConnectionBuilder()
        //     .withUrl(environment.server_url + 'bid-hub', {
        //         accessTokenFactory: () => this.localStorage.getItem("jwt") as string,
        //     })
        //     .build();
        this.hubConnection = null;
    }

    // startConnection(): Observable<void> {
    //     return new Observable<void>((observer) => {
    //         this.hubConnection
    //             .start()
    //             .then(() => {
    //                 console.log('Connection established with SignalR hub');
    //                 observer.next();
    //                 observer.complete();
    //             })
    //             .catch((error) => {
    //                 console.error('Error connecting to SignalR hub:', error);
    //                 observer.error(error);
    //             });
    //     });
    // }

    startConnection(articleId: number) {
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
                this.joinGroup(articleId);
            })
            .catch(err => console.log('Error while starting connection: ' + err));
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

    joinGroup(articleId: number){
        this.hubConnection!.invoke('JoinGroup', articleId);
    }

}