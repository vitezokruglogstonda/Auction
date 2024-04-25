import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";

export const selectAdminUserList = createSelector(
    (state: AppState) => state.adminUserList,
    (adminUserList) => adminUserList.ids.map(id => adminUserList.entities[id])
);

export const selectAdminArticleList = createSelector(
    (state: AppState) => state.adminArticleList,
    (adminArticleList) => adminArticleList.ids.map(id => adminArticleList.entities[id])
);

export const selectTotalNumberOfUsers = createSelector(
    (state: AppState) => state.adminInfo,
    (adminInfo) => adminInfo.totalNumberOfUsers
);

export const selectTotalNumberOfArticles = createSelector(
    (state: AppState) => state.adminInfo,
    (adminInfo) => adminInfo.totalNumberOfArticles
);