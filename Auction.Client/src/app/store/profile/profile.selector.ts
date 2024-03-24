import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { ArticleStatus } from "../../models/article";

export const selectProfileInfo = createSelector(
    (state: AppState) => state.profileInfo,
    (profileInfo) => profileInfo
);

export const selectProfileArticles = createSelector(
    (state: AppState) => state.profileArticlesList,
    (profileArticlesList) => profileArticlesList.ids.map(id => profileArticlesList.entities[id])
);

export const selectSoldArticles = (userId: number) => createSelector(
    selectProfileArticles,
    (profileArticlesList) => profileArticlesList.filter(article => article?.status === ArticleStatus.Sold && article.creatorId === userId)
);

export const selectSellingArticles = createSelector(
    selectProfileArticles,
    (profileArticlesList) => profileArticlesList.filter(article => article?.status === ArticleStatus.Biding || article?.status === ArticleStatus.Pending)
);

export const selectBoughtArticles = (userId: number) => createSelector(
    selectProfileArticles,
    (profileArticlesList) => profileArticlesList.filter(article => article?.status === ArticleStatus.Sold && article.customerId === userId)
);