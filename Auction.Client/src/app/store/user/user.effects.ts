import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { switchMap, withLatestFrom } from "rxjs";
import * as UserActions from "./user.action";
import * as AppActions from "../app/app.action";
import * as ProfileActions from "../profile/profile.action";
import { User } from "../../models/user";
import { LoginStatus } from "../../models/app-info";
import { UserService } from "../../services/user.service";
import { Store } from "@ngrx/store";
import { AppState } from "../app.state";

@Injectable()
export class UserEffects {
    constructor(private actions$: Actions, private userService: UserService, private store: Store<AppState>) { }

    logIn = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.logIn),
            switchMap((action) =>
                this.userService.logIn(action.loginDto).pipe(
                    switchMap((user: User|null) => {
                        if (user) {
                            return [
                                UserActions.logInSuccess({ user: user }),
                                AppActions.changeStatus({ loginStatus: LoginStatus.Online, imagePath: user.profilePicturePath })
                            ];
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
        withLatestFrom(this.store),
        switchMap(([action, store]) =>
            this.userService.signOut(store.userInfo.JWT).pipe(
                switchMap((result: boolean) => {
                    return [
                        UserActions.signOutSuccess(),
                        AppActions.logout()
                    ];
                    // if(result){
                    //     return [
                    //         UserActions.signOutSuccess(),
                    //         AppActions.logout()
                    //     ];
                    // }
                    // return [];
                })
            )
        )
    ));

    changeProfilePhoto = createEffect(() =>
    this.actions$.pipe(
        ofType(UserActions.changeProfilePhoto),
        withLatestFrom(this.store),
        switchMap(([action, store]) =>
            this.userService.changeProfilePhoto(action.photo, store.userInfo.JWT).pipe(
                switchMap((picturePath: String | null) => {
                    let result : String | null;
                    if(picturePath != null){
                        result = picturePath;
                    }else{
                        result = store.userInfo.profilePicturePath;
                    }
                    return [
                        UserActions.changeProfilePhotoSuccess({picturePath: result as String}),
                        ProfileActions.profilePictureChanged({picturePath: result as String}), //ovaj uopste realno i nema potrebe
                        AppActions.changeProfilePicture({picturePath: result as String})
                    ];
                })
            )
        )
    ));

    addMoneyToAccount = createEffect(() =>
    this.actions$.pipe(
        ofType(UserActions.addMoneyToAccount),
        withLatestFrom(this.store),
        switchMap(([action, store]) =>
            this.userService.addMoneyToAccount(action.amount, store.userInfo.JWT).pipe(
                switchMap((balance: number | null) => {
                    let result : number | null;
                    if(balance != null){
                        result = balance;
                    }else{
                        result = store.userInfo.balance;
                    }
                    return [
                        UserActions.addMoneyToAccountSuccess({balance: result})
                    ];
                })
            )
        )
    ));

}