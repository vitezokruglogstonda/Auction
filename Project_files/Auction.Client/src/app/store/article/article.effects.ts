import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ArticleService } from "../../services/article.service";
import { switchMap } from "rxjs";
import * as ArticleActions from "./article.action";
import * as UserActions from "../user/user.action";
import { Article, ArticleInfoDto, ArticleOwners, ArticleStatus } from "../../models/article";
import { environment } from "../../../environments/environment";
import { v4 as uuidv4 } from 'uuid';
import { BidService } from "../../services/bid.service";
import { BidItemDto, BidItem, BidCompletionDto } from "../../models/bid";
import { TypedAction } from "@ngrx/store/src/models";

@Injectable()
export class ArticleEffects {
    constructor(private actions$: Actions, private articleService: ArticleService, private bidService: BidService) { }

    getProfileArticles = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.loadArticles),
            switchMap((action) =>
                this.articleService.getArticles(action.pageSize, action.pageIndex, action.sortOption).pipe(
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

    startBidding = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.startBidding),
            switchMap((action) =>
                this.articleService.startBidding(action.articleId).pipe(
                    switchMap((result: ArticleInfoDto | null) => {
                        if (result !== null) {
                            return [
                                ArticleActions.checkIfCurrentlyBiddingSuccess({ status: true }),
                                ArticleActions.changeArticleStatus({ id: action.articleId, status: result.status }),
                                ArticleActions.changeArticleLastPrice({ id: action.articleId, lastPrice: result.lastPrice }),
                                UserActions.substractMoneyFromAccount({ amount: environment.defaultFee })
                            ];
                        } else {
                            return [
                                ArticleActions.checkIfCurrentlyBiddingSuccess({ status: false })
                            ];
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
                this.bidService.getBidList(action.articleId).pipe(
                    switchMap((result: BidItemDto[] | null) => {
                        if (result !== null && result.length > 0) {
                            let items: BidItem[] = [];
                            result.forEach(el => {
                                items.push({
                                    id: uuidv4(),
                                    userProfile: el.userProfile,
                                    amount: el.amount
                                })
                            })
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

    newBid = createEffect(() =>
        this.actions$.pipe(
            ofType(ArticleActions.newBid),
            switchMap(async (action) =>
                this.bidService.newBid(action.userId, action.articleId, action.amount)
            )
        )
        , { dispatch: false });

    newBidSuccess = createEffect(() => 
        this.bidService.newBidItem.pipe(
            switchMap((result: BidItemDto) => {
                let item: BidItem = {
                    id: uuidv4(),
                    userProfile: result.userProfile,
                    amount: result.amount
                };
                return [
                    ArticleActions.newBidItem({ item: item }),
                    ArticleActions.changeArticleLastPrice({ id: result.articleId, lastPrice: result.amount })
                ];
            })
    ))

    articleStatusChanged = createEffect(() => 
        this.bidService.articleStatusChanged.pipe(
            switchMap((result: BidCompletionDto) => {
                let returnActions = [];
                returnActions.push(ArticleActions.changeArticleStatus({id: this.bidService.currentArticleId as number, status: result.articleInfo.status}))
                if(result.articleInfo.lastPrice !== 0)
                    returnActions.push(ArticleActions.changeArticleLastPrice({id: this.bidService.currentArticleId as number, lastPrice: result.articleInfo.lastPrice}))
                if(!!result.customerProfile)
                    returnActions.push(ArticleActions.addArticleCustomer({customer: result.customerProfile!}))

                if(result.articleInfo.status !== ArticleStatus.Biding){
                    this.bidService.closeConnection();
                    returnActions.push(ArticleActions.clearBidList())                
                }

                return returnActions;

                // return [
                //     ArticleActions.articleExpired({id: this.bidService.currentArticleId as number, status: ArticleStatus.Expired}),
                //     ArticleActions.clearBidList()
                // ];
            })
        )
    )

}