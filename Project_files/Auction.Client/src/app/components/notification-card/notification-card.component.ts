import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { selectNotifications } from '../../store/user/user.selector';
import { Notification, NotificationStatus, NotificationType } from '../../models/user';
import { Router } from '@angular/router';
import { CustomDateTime } from '../../models/article';

@Component({
  selector: 'app-notification-card',
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.css'
})
export class NotificationCardComponent {

  public notificationList: Notification[];
  @Output() notificationCardEmitter: EventEmitter<boolean>;

  constructor(private store: Store<AppState>, private elRef: ElementRef, private router: Router) {
    this.notificationList = [];
    this.notificationCardEmitter = new EventEmitter<boolean>();
  }

  ngOnInit() {
    this.store.select(selectNotifications).subscribe((state) => {
      this.notificationList.splice(0, this.notificationList.length);
      state.forEach(notification => {
        this.notificationList.push(notification as Notification);
      })
      this.orderNotificationsByDate();
    })
  }

  clickNotification() {
    //rutiranje na artikal
    this.notificationCardEmitter.emit(true);
  }

  @HostListener('document:click', ['$event'])
  hideCard() {
    let card: HTMLElement | null = (<HTMLElement>this.elRef.nativeElement).querySelector(".card-container");
    let icon: HTMLElement | null = (document).querySelector(".notification-icon-container");
    if (event && card && icon) {
      if (!card.contains(event.target as Node | null) && !icon.contains(event.target as Node | null)) {
        this.notificationCardEmitter.emit(true);
      }
    }
  }

  printArticleInfoText(notification: Notification): string {
    let print: string = notification.articleInfo.title;

    if (notification.type == NotificationType.TransactionComplete)
      print += ` ($${notification.articleInfo.lastPrice})`
    if (notification.type == NotificationType.InvalidTransaction)
      print += ` | Add $${notification.articleInfo.lastPrice}) until ${notification.endDate.hour}h : ${notification.endDate.minute}, ${notification.endDate.day}.${notification.endDate.month}.${notification.endDate.year}`
    return print;
  }

  isNewNotification(notification: Notification): boolean {
    return notification.status === NotificationStatus.NotRead;
  }

  checkNotificationType(notificationType: NotificationType, checkType: number): boolean {
    return notificationType == checkType;
  }

  orderNotificationsByDate() {
    this.notificationList.sort((a, b) => this.compareCustomDateTime(a.timestamp, b.timestamp));
  }

  compareCustomDateTime(a: CustomDateTime, b: CustomDateTime): number {
    if (a.year !== b.year) return b.year - a.year;
    if (a.month !== b.month) return b.month - a.month;
    if (a.day !== b.day) return b.day - a.day;
    if (a.hour !== b.hour) return b.hour - a.hour;
    if (a.minute !== b.minute) return b.minute - a.minute;
    return b.second - a.second;
  }

  getTimeDifferenceString(timestamp: CustomDateTime): string {
    const now = new Date();
    const notificationDate = new Date(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.minute, timestamp.second);
    const differenceInMilliseconds = now.getTime() - notificationDate.getTime();
    const differenceInMinutes = Math.floor(differenceInMilliseconds / 60000);
    const differenceInHours = Math.floor(differenceInMilliseconds / 3600000);
    const differenceInDays = Math.floor(differenceInMilliseconds / 86400000);

    if (differenceInMinutes < 1) {
      return "Just now";
    } else if (differenceInMinutes < 60) {
      return `${differenceInMinutes} minute${differenceInMinutes !== 1 ? 's' : ''} ago`;
    } else if (differenceInHours < 24) {
      return `${differenceInHours} hour${differenceInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${differenceInDays} day${differenceInDays !== 1 ? 's' : ''} ago`;
    }
  }

  viewArticle(notification: Notification){
    this.notificationCardEmitter.emit(true);
    this.router.navigate(["/article", notification.articleInfo.articleId]);
  }

}
