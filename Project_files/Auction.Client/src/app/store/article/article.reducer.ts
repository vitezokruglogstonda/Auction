import { EntityAdapter, createEntityAdapter } from "@ngrx/entity";
import { Article, ArticleInfo, ArticleListState, ArticleOwners } from "../../models/article";
import { createReducer, on } from "@ngrx/store";
import * as Actions from "./article.action";
import { BidItem, BidListState } from "../../models/bid";

export const initialState: ArticleInfo = {
    articleOwners: {
        creator: null, 
        customer: null
    },
    currentlyBiddingArticle: false,
};

export const articleReducer = createReducer(
    initialState,
    on(Actions.loadArticlesOwners, (state, {creatorId, customerId}) => ({
        ...state,
        articleOwners: initialState.articleOwners
    })),
    on(Actions.loadArticlesOwnersSuccess, (state, {owners}) => ({
        ...state,
        articleOwners: {...owners}
    })),
    on(Actions.checkIfCurrentlyBidding, (state, {articleId}) => ({
        ...state,
        currentlyBiddingArticle: false
    })),
    on(Actions.checkIfCurrentlyBiddingSuccess, (state, {status}) => ({
        ...state,
        currentlyBiddingArticle: status
    })),    
    on(Actions.addArticleCustomer, (state, {customer}) => ({
        ...state,
        articleOwners: {
            ...state.articleOwners,
            customer: customer
        }
    })),
    on(Actions.resetToArticleInfoInitialState, (state) => ({
        ...initialState
    })),
);

export const articlesListAdapter: EntityAdapter<Article> = createEntityAdapter<Article>();

export const initialArticlesListState: ArticleListState = articlesListAdapter.getInitialState({
});

export const articlesListReducer = createReducer(
    initialArticlesListState,
    on(Actions.loadArticles, (state, {pageSize, pageIndex, sortOption}) => {
        return articlesListAdapter.removeAll({ ...state, selectedUserId: null });
    }),
    on(Actions.loadArticlesSuccess, (state, {items}) => {
        return articlesListAdapter.addMany(items, articlesListAdapter.removeAll({ ...state }));
    }),
    on(Actions.loadArticlesFailed, (state) => {
        return articlesListAdapter.removeAll({ ...state });
    }),
    on(Actions.loadSingleArticle, (state, {articleId}) => {
        return articlesListAdapter.removeAll({ ...state })
    }),
    on(Actions.loadSingleArticleSuccess, (state, {item}) => {
        return articlesListAdapter.addOne(item, articlesListAdapter.removeAll({ ...state }));
    }),
    on(Actions.loadSingleArticleFailed, (state) => {
        return articlesListAdapter.removeAll({ ...state });
    }),
    on(Actions.changeArticleStatus, (state, {id, status}) => {
        return articlesListAdapter.updateOne(
            { id: id, changes: { status: status } },
            state
          );
    }),
    on(Actions.changeArticleLastPrice, (state, {id, lastPrice}) => {
        return articlesListAdapter.updateOne(
            { id: id, changes: { soldPrice: lastPrice } },
            state
          );
    }),
    on(Actions.resetToArticlesListInitialState, (state) => ({
        ...initialArticlesListState
    })),
);

export const bidListAdapter: EntityAdapter<BidItem> = createEntityAdapter<BidItem>();

export const initialBidListState: BidListState = bidListAdapter.getInitialState({
});

export const bidListReducer = createReducer(
    initialBidListState,
    on(Actions.clearBidList, (state) => {
        return bidListAdapter.removeAll({ ...state });
    }),
    on(Actions.getBidList, (state, {articleId}) => {
        return bidListAdapter.removeAll({ ...state });
    }),
    on(Actions.getBidListSuccess, (state, {items}) => {
        return bidListAdapter.addMany(items, bidListAdapter.removeAll({ ...state }));
    }),
    on(Actions.startBidding, (state, {articleId}) => {
        return bidListAdapter.removeAll({ ...state });
    }),
    on(Actions.newBid, (state, {userId, articleId, amount}) => ({
        ...state
    })),
    on(Actions.newBidItem, (state, {item}) => {
        return bidListAdapter.addOne(item, state);
        // const newItem = { ...item, id: require('uuid').v4() };
        // return bidListAdapter.addOne(newItem, state);
    }),
    on(Actions.resetToBidListInitialState, (state) => ({
        ...initialBidListState
    })),
);