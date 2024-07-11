import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { switchMap } from "rxjs";
import * as UserActions from "./user.action";
import * as AppActions from "../app/app.action";
import * as ProfileActions from "../profile/profile.action";
import * as AdminActions from "../admin/admin.action";
import * as ArticleActions from "../article/article.action";
import { NotificationDto, User, Notification, NotificationStatus } from "../../models/user";
import { LoginStatus } from "../../models/app-info";
import { UserService } from "../../services/user.service";
import { Store } from "@ngrx/store";
import { AppState } from "../app.state";
import { LocalStorageService } from "../../services/local-storage.service";
import { Article } from "../../models/article";
import { NotificationService } from "../../services/notification.service";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserEffects {
    constructor(private actions$: Actions, private userService: UserService, private store: Store<AppState>, private localStorage: LocalStorageService, private notificationService: NotificationService) { }

    logIn = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.logIn),
            switchMap((action) =>
                this.userService.logIn(action.loginDto).pipe(
                    switchMap((user: User|null) => {
                        if (user) {
                            return this.notificationService.startConnection(user?.id as number).pipe(
                                switchMap((notificationList: Notification[] | null)=>{
                                    if(!!notificationList){
                                        let numberOfNewNotifications: number = notificationList.filter(notification => notification.status === NotificationStatus.NotRead).length;
                                        return [
                                            UserActions.logInSuccess({ user: user }),
                                            AppActions.changeStatus({ loginStatus: LoginStatus.Online, imagePath: user.profilePicturePath }),
                                            UserActions.addNotifications({notifications: notificationList}),
                                            AppActions.addNumberOfNotifications({number: numberOfNewNotifications})
                                        ];
                                    }
                                    return [
                                        UserActions.logInSuccess({ user: user }),
                                        AppActions.changeStatus({ loginStatus: LoginStatus.Online, imagePath: user.profilePicturePath })
                                    ];
                                })
                            )
                        } else {
                            return [AppActions.loginFail()];
                        }
                    })
                )
            )
        )
    );

    logInWithToken = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.logInWithToken),
            switchMap((action) =>
                this.userService.logInWithToken().pipe(
                    switchMap((user: User|null) => {
                        if (user) {
                            return this.notificationService.startConnection(user?.id as number).pipe(
                                switchMap((notificationList: Notification[] | null)=>{
                                    if(!!notificationList){
                                        let numberOfNewNotifications: number = notificationList.filter(notification => notification.status === NotificationStatus.NotRead).length;
                                        return [
                                            UserActions.logInSuccess({ user: user }),
                                            AppActions.changeStatus({ loginStatus: LoginStatus.Online, imagePath: user.profilePicturePath }),
                                            UserActions.addNotifications({notifications: notificationList}),
                                            AppActions.addNumberOfNotifications({number: numberOfNewNotifications})
                                        ];
                                    }
                                    return [
                                        UserActions.logInSuccess({ user: user }),
                                        AppActions.changeStatus({ loginStatus: LoginStatus.Online, imagePath: user.profilePicturePath })
                                    ];
                                })
                            )
                        } else {
                            return [AppActions.loginFail()];
                        }
                    })
                )
            )
        )
    );

    register = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.register),
            switchMap((action) =>
                this.userService.register(action.registerDto).pipe(
                    switchMap((user: User|null) => {
                        if (user) {
                            return [
                                UserActions.logInSuccess({ user: user }),
                                AppActions.changeStatus({ loginStatus: LoginStatus.Online, imagePath: user.profilePicturePath })
                            ];
                        } else {
                            return [AppActions.registerFail()];
                        }
                    })
                )
            )
        )
    );

    mailCheck = createEffect(() =>
    this.actions$.pipe(
        ofType(UserActions.checkEmail),
        switchMap((action) =>
            this.userService.findUserByMail(action.mail).pipe(
                switchMap((result: boolean) => {
                    if (result) {
                        return [AppActions.updateEmailError({ status: true })];
                    } else {
                        return [AppActions.updateEmailError({ status: false })];
                    }
                })
            )
        )
    ));

    signOut = createEffect(() =>
    this.actions$.pipe(
        ofType(UserActions.signOut),
        switchMap((action) =>
            this.userService.signOut().pipe(
                switchMap((result: boolean) => {
                    this.localStorage.clear();
                    return [
                        AdminActions.resetToInitialAdminInfoState(),
                        AdminActions.resetToInitialUserListReducer(),
                        AdminActions.resetToInitialArticleListReducer(),

                        ArticleActions.resetToArticleInfoInitialState(),
                        ArticleActions.resetToArticlesListInitialState(),
                        ArticleActions.resetToBidListInitialState(),

                        ProfileActions.resetToProfileInitialState(),
                        ProfileActions.resetToProfileArticlesListInitialState(),

                        UserActions.signOutSuccess(),
                        UserActions.resetToNotificationListInitialState(),
                        AppActions.logout(),
                        // UserActions.clearNotificationList(),
                        // AppActions.resetNumberOfNotifications(),
                    ];
                })
            )
        )
    ));

    changeProfilePhoto = createEffect(() =>
    this.actions$.pipe(
        ofType(UserActions.changeProfilePhoto),
        switchMap((action) =>
            this.userService.changeProfilePhoto(action.photo).pipe(
                switchMap((picturePath: String | null) => {
                    if(picturePath !== null)
                        return [
                            UserActions.changeProfilePhotoSuccess({picturePath: picturePath!}),
                            ProfileActions.profilePictureChanged({picturePath: picturePath!}), //ovaj uopste realno i nema potrebe
                            AppActions.changeProfilePicture({picturePath: picturePath!})
                        ];
                    return [
                        UserActions.changeProfilePhotoFailed(),
                    ];
                })
            )
        )
    ));

    addMoneyToAccount = createEffect(() =>
    this.actions$.pipe(
        ofType(UserActions.addMoneyToAccount),
        // withLatestFrom(this.store),
        // switchMap(([action, store]) =>
        switchMap((action) =>
            this.userService.addMoneyToAccount(action.amount).pipe(
                switchMap((balance: number | null) => {
                    if(balance !== null)
                        return [
                            UserActions.addMoneyToAccountSuccess({balance: balance!})
                        ];
                    return [
                        UserActions.addMoneyToAccountFailed()
                    ];
                })
            )
        )
    ));

    publishArticle = createEffect(() =>
    this.actions$.pipe(
        ofType(UserActions.publishArticle),
        switchMap((action) =>
            this.userService.publishArticle(action.articleDto).pipe(
                switchMap((result: Article | null) => {
                    if(result)
                        return [
                            AppActions.publishArticleSuccess(),
                            ProfileActions.addArticle({item: result})
                            //i profile akcija koja dodaje novi artikal u entity (listu) artikala (prifile.action.ts)
                        ];
                    return [
                        AppActions.publishArticleFailed()
                    ];
                })
            )
        )
    ));

    markAllNotificationsRead = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.markAllNotificationsRead),
            switchMap((action) =>
                this.notificationService.markAllNotificationsRead().pipe(
                    switchMap((result: boolean) => {
                        if(result)
                            return [
                                UserActions.markAllNotificationsReadSuccess(),
                                AppActions.resetNumberOfNotifications()
                            ];
                        return [];
                    })
                )
            )
        ));

    newNotification = createEffect(() => 
        this.notificationService.notification$.pipe(
            switchMap((result: NotificationDto) => {
                let notification: Notification = {
                    id: uuidv4(),
                    ...result
                };
                return [
                    UserActions.addNewNotification({notification: notification}),
                    AppActions.addNumberOfNotifications({number: 1})
                ];
            })
    ))

}