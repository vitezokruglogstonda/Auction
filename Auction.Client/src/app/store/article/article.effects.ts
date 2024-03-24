import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ArticleService } from "../../services/article.service";
import { switchMap } from "rxjs";
import * as ArticleActions from "./article.action";
import { Article, ArticleOwners, ArticleStatus, BidItem } from "../../models/article";

@Injectable()
export class ArticleEffects {
    constructor(private actions$: Actions, private articleService: ArticleService) { }

    getProfileArticles = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.loadArticles),
            switchMap((action) =>
                this.articleService.getArticles(action.pageSize, action.pageIndex).pipe(
                    switchMap((result: Article[] | null) => {
                        if (result) {
                            return [
                                ArticleActions.loadArticlesSuccess({ items: result }),
                            ];
                        } else {
                            return [
                                ArticleActions.loadArticlesFailed()
                            ];
                        }
                    })
                )
            )
        )
    );

    getTotalNumberOfArticles = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.loadTotalNumberOfArticles),
            switchMap((action) =>
                this.articleService.getTotalNumberOfArticles().pipe(
                    switchMap((result: number | null) => {
                        if (result) {
                            return [
                                ArticleActions.loadTotalNumberOfArticlesSuccess({ numberOfArticles: result }),
                            ];
                        } else {
                            return [];
                        }
                    })
                )
            )
        )
    );

    getArticlesByTitle = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.searchArticlesByTitle),
            switchMap((action) =>
                this.articleService.getArticlesByTitle(action.searchQuery).pipe(
                    switchMap((result: Article[] | null) => {
                        if (result) {
                            return [
                                ArticleActions.loadArticlesSuccess({ items: result }),
                            ];
                        } else {
                            return [
                                ArticleActions.loadArticlesFailed()
                            ];
                        }
                    })
                )
            )
        )
    );

    getSingleArticle = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.loadSingleArticle),
            switchMap((action) =>
                this.articleService.getSingleArticle(action.articleId).pipe(
                    switchMap((result: Article | null) => {
                        if (result) {
                            return [
                                ArticleActions.loadSingleArticleSuccess({ item: result }),
                            ];
                        } else {
                            return [
                                ArticleActions.loadSingleArticleFailed(),
                            ];
                        }
                    })
                )
            )
        )
    );

    getArticleOwners = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.loadArticlesOwners),
            switchMap((action) =>
                this.articleService.getArticleOwners(action.creatorId, action.customerId).pipe(
                    switchMap((result: ArticleOwners | null) => {
                        if (result) {
                            return [
                                ArticleActions.loadArticlesOwnersSuccess({ owners: result }),
                            ];
                        } else {
                            return [];
                        }
                    })
                )
            )
        )
    );

    checkIfCurrentlyBidding = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.checkIfCurrentlyBidding),
            switchMap((action) =>
                this.articleService.checkIfCurrentlyBidding(action.articleId).pipe(
                    switchMap((result: boolean | null) => {
                        if (result !== null) {
                            return [
                                ArticleActions.checkIfCurrentlyBiddingSuccess({ status: result }),
                            ];
                        } else {
                            return [];
                        }
                    })
                )
            )
        )
    );

    getBidList = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.getBidList),
            switchMap((action) =>
                this.articleService.getBidList(action.articleId).pipe(
                    switchMap((items: BidItem[] | null) => {
                        if (items !== null && items.length > 0) {
                            return [
                                ArticleActions.getBidListSuccess({ items: items }),
                            ];
                        } else {
                            return [];
                        }
                    })
                )
            )
        )
    );

    startBidding = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.startBidding),
            switchMap((action) =>
                this.articleService.startBidding(action.articleId).pipe(
                    switchMap((result: boolean | null) => {
                        if (result !== null) {
                            return [
                                ArticleActions.checkIfCurrentlyBiddingSuccess({ status: result }),
                            ];
                        } else {
                            return [];
                        }
                    })
                )
            )
        )
    );

    newBid = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.newBid),
            switchMap((action) =>
                this.articleService.newBid(action.articleId, action.amount).pipe(
                    switchMap((item: BidItem | null) => {
                        if (item !== null) {
                            return [
                                ArticleActions.newBidItem({ item: item }),
                            ];
                        } else {
                            return [];
                        }
                    })
                )
            )
        )
    );

}