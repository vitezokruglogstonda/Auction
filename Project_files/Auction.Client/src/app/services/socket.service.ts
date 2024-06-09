import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpTransportType } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../environments/environment';
import { BidItemDto, BidCompletionDto } from '../models/bid';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private hubConnections: { [key: string]: signalR.HubConnection } = {};

    constructor(private localStorage: LocalStorageService) {}

    startConnection(hubName: string, hubUrl: string, groupName: string, groupId: number, eventHandlers: { [key: string]: Subject<any> }) {
        if (!!this.hubConnections[hubName]) {
            return;
        }

        let hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(environment.server_url + hubUrl, {
                accessTokenFactory: () => this.localStorage.getItem("jwt") as string,
            })
            .build();

        hubConnection
            .start()
            .then(() => {
                console.log(`Connection to ${hubName} started`);
                this.emit(hubName, groupName, groupId);
                for (const event in eventHandlers) {
                    hubConnection.on(event, (data: any) => {
                        if (data !== null)
                            eventHandlers[event].next(data);
                    });
                }
            })
            .catch(err => console.log(`Error while starting connection to ${hubName}: ${err}`));

        this.hubConnections[hubName] = hubConnection;
    }

    closeConnection(hubName: string, groupName: string, groupId: number){
        let hubConnection = this.hubConnections[hubName];
        if(!!hubConnection){
            this.emit(hubName, groupName, groupId);
            hubConnection.stop().then(() => {
                console.log(`Connection to ${hubName} stopped`);
                delete this.hubConnections[hubName];
            }).catch(err => console.log(`Error while stopping connection to ${hubName}: ${err}`));
        }
    }

    emit(hubName: string, endpoint: string, data: any): void {
        const hubConnection = this.hubConnections[hubName];
        if (hubConnection) {
            hubConnection.invoke(endpoint, data).catch(err => console.error(err));
        }
    }

    listen(hubName: string, endpoint: string): Observable<any> {
        return new Observable<any>((observer) => {
            const hubConnection = this.hubConnections[hubName];
            if (hubConnection) {
                hubConnection.on(endpoint, (data: any) => {
                    if (data !== null)
                        observer.next(data);
                });
            }
        });
    }
}