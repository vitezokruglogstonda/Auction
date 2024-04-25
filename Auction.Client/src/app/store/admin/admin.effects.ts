import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { switchMap } from "rxjs";
import { User } from "../../models/user";
import * as AdminActions from "./admin.action";
import { AdminService } from "../../services/admin.service";
import { Article } from "../../models/article";

@Injectable()
export class AdminEffects {
    constructor(private actions$: Actions, private adminService: AdminService) { }

    getTotalNumberOfUsers = createEffect(() =>
    this.actions$.pipe(
        ofType(AdminActions.loadTotalNumberOfUsers),
        switchMap((action) =>
            this.adminService.loadTotalNumberOfUsers().pipe(
                switchMap((result: number | null) => {
                    if (!!result) {
                        return [
                            AdminActions.loadTotalNumberOfUsersSuccess({ numberOfUsers: result }),
                        ];
                    } 
                    return [];
                })
            )
        )
    ));

    getAllUsers = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.loadAllUsers),
            switchMap((action) =>
                this.adminService.getAllUsers(action.pageSize, action.pageIndex).pipe(
                    switchMap((result: User[] | null) => {
                        if (!!result && result!.length > 0) {
                            return [
                                AdminActions.loadAllUsersSuccess({ users: result }),
                            ];
                        } 
                        return [];
                    })
                )
            )
        )
    );

    getTotalNumberOfArticles = createEffect(() =>
    this.actions$.pipe(
        ofType(AdminActions.loadTotalNumberOfArticles),
        switchMap((action) =>
            this.adminService.loadTotalNumberOfArticles().pipe(
                switchMap((result: number | null) => {
                    if (!!result) {
                        return [
                            AdminActions.loadTotalNumberOfArticlesSuccess({ numberOfArticles: result }),
                        ];
                    } 
                    return [];
                })
            )
        )
    ));

    getAllArticles = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.loadAllArticles),
            switchMap((action) =>
                this.adminService.getAllArticles(action.pageSize, action.pageIndex).pipe(
                    switchMap((result: Article[] | null) => {
                        if (!!result && result!.length > 0) {
                            return [
                                AdminActions.loadAllArticlesSuccess({ articles: result }),
                            ];
                        } 
                        return [];
                    })
                )
            )
        )
    );

    getArticlesByTitle = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.searchArticlesByTitle),
            switchMap((action) =>
                this.adminService.getArticlesByTitle(action.searchQuery).pipe(
                    switchMap((result: Article[] | null) => {
                        if (!!result && result!.length > 0) {
                            return [
                                AdminActions.searchArticlesByTitleSuccess({ articles: result }),
                            ];
                        } 
                        return [];
                    })
                )
            )
        )
    );

}