import { createAction, props } from "@ngrx/store";
import { Article, ArticleInfoDto, ArticleOwners, ArticleStatus, BidItem } from "../../models/article";

export const loadTotalNumberOfArticles = createAction("Load Total Number Of Articles");
export const loadTotalNumberOfArticlesSuccess = createAction("Load Total Number Of Articles - Success", props<{numberOfArticles: number}>());
export const searchArticlesByTitle = createAction("Search Articles By Title", props<{searchQuery: string}>());

export const loadArticles = createAction("Load Articles", props<{pageSize : number, pageIndex: number}>());
export const loadArticlesSuccess = createAction("Load Articles - Success", props<{items : Article[]}>());
export const loadArticlesFailed = createAction("Load Articles - Failed");

export const loadSingleArticle = createAction("Load Single Article", props<{articleId: number}>());
export const loadSingleArticleSuccess = createAction("Load Single Article - Success", props<{item: Article}>());
export const loadSingleArticleFailed = createAction("Load Single Article - Failed");
export const changeArticleStatus = createAction("Change Article Status", props<{id: number, articleInfoDto: ArticleInfoDto}>());
export const changeArticleLastPrice = createAction("Change Article Last Price", props<{id: number, lastPrice: number}>());

export const loadArticlesOwners = createAction("Load Articles Owners", props<{creatorId: number, customerId: number | null}>());
export const loadArticlesOwnersSuccess = createAction("Load Articles Owners - Success", props<{owners: ArticleOwners}>());

export const checkIfCurrentlyBidding = createAction("Check If Currently Bidding", props<{articleId: number}>());
export const checkIfCurrentlyBiddingSuccess = createAction("Check If Currently Bidding - Success", props<{status: boolean}>());

export const clearBidList = createAction("Clear Bid List");
export const getBidList = createAction("Get Bid List", props<{articleId: number}>());
export const getBidListSuccess = createAction("Get Bid List - Success", props<{items: BidItem[]}>());
export const startBidding = createAction("Start Bidding", props<{articleId: number}>());
export const newBid = createAction("Bid", props<{userId: number, articleId: number, amount: number}>());
export const newBidItem = createAction("New Bid Item", props<{item: BidItem}>());