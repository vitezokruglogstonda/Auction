import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";

export const selectArticles = createSelector(
    (state: AppState) => state.articlesList,
    (articlesList) => articlesList.ids.map(id => articlesList.entities[id])
);

export const selectSingleArticle  = (articleId: number) => createSelector(
    selectArticles,
    (articlesList) => articlesList.find((article) => {
        if(article && article.id && article.id === articleId)
            return article
        return null;
    })
);

export const selectArticleInfo = createSelector(
    (state: AppState) => state.articleInfo,
    (articleInfo) => articleInfo
);

export const selectProfilesForArticle = createSelector(
    selectArticleInfo,
    (articleInfo) => articleInfo.articleOwners
);

export const selectCurrentlyBiddingArticle = createSelector(
    selectArticleInfo,
    (articleInfo) => articleInfo.currentlyBiddingArticle
);

export const selectBidItems = createSelector(
    (state: AppState) => state.bidList,
    (bidList) => bidList.ids.map(id => bidList.entities[id])
);