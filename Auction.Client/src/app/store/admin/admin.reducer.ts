import { EntityAdapter, createEntityAdapter } from "@ngrx/entity";
import { createReducer, on } from "@ngrx/store";
import { User, UserListState } from "../../models/user";
import * as Actions from "./admin.action";
import { Article, ArticleListState } from "../../models/article";
import { AdminInfo } from "../../models/admin-info";

export const initialAdminInfoState: AdminInfo = {
    totalNumberOfUsers: 0,
    totalNumberOfArticles: 0
};

export const adminInfoReducer = createReducer(
    initialAdminInfoState,
    on(Actions.adminLoadTotalNumberOfUsers, (state) => ({
        ...state
    })),
    on(Actions.adminLoadTotalNumberOfUsersSuccess, (state, {numberOfUsers}) => ({
        ...state,
        totalNumberOfUsers: numberOfUsers
    })),
    on(Actions.adminLoadTotalNumberOfArticles, (state) => ({
        ...state
    })),
    on(Actions.adminLoadTotalNumberOfArticlesSuccess, (state, {numberOfArticles}) => ({
        ...state,
        totalNumberOfArticles: numberOfArticles
    })),
);

export const userListAdapter: EntityAdapter<User> = createEntityAdapter<User>();

export const initialUserListState: UserListState = userListAdapter.getInitialState({
});

export const userListReducer = createReducer(
    initialUserListState,
    on(Actions.loadAllUsers, (state, {pageSize, pageIndex}) => {
        return userListAdapter.removeAll({ ...state, selectedUserId: null });
    }),
    on(Actions.loadAllUsersSuccess, (state, {users}) => {
        return userListAdapter.addMany(users, userListAdapter.removeAll({ ...state }));
    }),
);

export const articleListAdapter: EntityAdapter<Article> = createEntityAdapter<Article>();

export const initialArticleListState: ArticleListState = articleListAdapter.getInitialState({
});

export const articleListReducer = createReducer(
    initialArticleListState,
    on(Actions.loadAllArticles, (state, {pageSize, pageIndex}) => {
        return articleListAdapter.removeAll({ ...state, selectedArticleId: null });
    }),
    on(Actions.loadAllArticlesSuccess, (state, {articles}) => {
        return articleListAdapter.addMany(articles, articleListAdapter.removeAll({ ...state }));
    }),
    on(Actions.searchArticlesByTitle, (state, {searchQuery}) => ({
        ...state
    })),
    on(Actions.searchArticlesByTitleSuccess, (state, {articles}) => {
        return articleListAdapter.addMany(articles, articleListAdapter.removeAll({ ...state }));
    }),
    on(Actions.republishArticle, (state, {articleId}) => ({
        ...state
    })),
    on(Actions.republishArticleSuccess, (state, {articleId, status}) => {
        return articleListAdapter.updateOne(
            { id: articleId, changes: { status: status } },
            state
          );
    }),
    on(Actions.removeArticle, (state, {articleId}) => ({
        ...state
    })),
    on(Actions.removeArticleSuccess, (state, {articleId}) => {
        return articleListAdapter.removeOne( 
            articleId,
            state
          );
    }),
);