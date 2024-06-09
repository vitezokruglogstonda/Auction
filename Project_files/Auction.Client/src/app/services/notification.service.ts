import { Injectable } from "@angular/core";
import { SocketService } from "./socket.service";
import { environment } from "../../environments/environment";
import { Observable, Subject, catchError, of, switchMap } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";
import { Notification, NotificationDto } from "../models/user";
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationSubject: Subject<NotificationDto>;
    public notification$: Observable<NotificationDto>;
    public userId: number;

    constructor(private socket: SocketService, private http: HttpClient, private localStorage: LocalStorageService){
        this.notificationSubject = new Subject<NotificationDto>();
        this.notification$ = this.notificationSubject.asObservable(); 
        this.userId = 0;
    }

    startConnection(userId: number): Observable<Notification[] | null>{
        this.userId = userId;
        this.socket.startConnection(
            environment.socketSettings.notificationSocketSettings.hubName,
            environment.socketSettings.notificationSocketSettings.hubUrl,
            environment.socketSettings.notificationSocketSettings.groupEndpoints.join,
            userId,
            {
                "NewNotification": this.notificationSubject
            }
        );

        let querry: String = `account/get-notifications?userId=${this.userId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<NotificationDto[]>(environment.server_url + querry, httpOptions).pipe(
            switchMap((result: NotificationDto[]) => {
                let notificationList: Notification[] = [];
                if(result.length > 0){
                    result.forEach((dto) => {
                        let notification: Notification = {
                            id: uuidv4(),
                            ...dto
                        }
                        notificationList.push(notification);
                    })
                }
                return of(notificationList)
            }),
            catchError(() => {
                return of(null);
            })
        );

    }

    closeConnection(){
        this.socket.closeConnection(
            environment.socketSettings.notificationSocketSettings.hubName,
            environment.socketSettings.notificationSocketSettings.groupEndpoints.leave,
            this.userId as number
        );
    }

    markAllNotificationsRead(): Observable<boolean>{
        let querry: String = `account/mark-all-notifications-read?userId=${this.userId}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'JWT': `${this.localStorage.getItem('jwt')}`
            }),
        };
        return this.http.get<boolean>(environment.server_url + querry, httpOptions).pipe(
            switchMap(() => {
                return of(true)
            }),
            catchError(() => {
                return of(false);
            })
        );
    }

}