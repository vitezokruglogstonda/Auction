import { createAction, props } from "@ngrx/store";
import { User } from "../../models/user";
import { Article, ArticleStatus } from "../../models/article";

export const adminLoadTotalNumberOfUsers = createAction("Admin - Load Total Number Of Users");
export const adminLoadTotalNumberOfUsersSuccess = createAction("Admin - Load Total Number Of Users - Success", props<{numberOfUsers: number}>());
export const loadAllUsers = createAction("Load All Users", props<{pageSize : number, pageIndex: number}>());
export const loadAllUsersSuccess = createAction("Load All Users Success", props<{users : User[]}>());

export const adminLoadTotalNumberOfArticles = createAction("Admin - Load Total Number Of Articles");
export const adminLoadTotalNumberOfArticlesSuccess = createAction("Admin - Load Total Number Of Articles - Success", props<{numberOfArticles: number}>());
export const loadAllArticles = createAction("Load All Articles", props<{pageSize : number, pageIndex: number}>());
export const loadAllArticlesSuccess = createAction("Load All Articles Success", props<{articles : Article[]}>());
export const adminSearchArticlesByTitle = createAction("Admin - Search Articles By Title", props<{searchQuery: string}>());
export const adminSearchArticlesByTitleSuccess = createAction("Admin - Search Articles By Title - Success", props<{articles : Article[]}>());

export const republishArticle = createAction("Republish Article", props<{articleId : number}>());
export const republishArticleSuccess = createAction("Republish Article - Success", props<{articleId : number, status: ArticleStatus}>());
export const removeArticle = createAction("Remove Article", props<{articleId : number}>());
export const removeArticleSuccess = createAction("Remove Article - Success", props<{articleId : number}>());

export const resetToInitialAdminInfoState = createAction("Admin - Reset To Initial Admin Info State");
export const resetToInitialUserListReducer = createAction("Admin - Reset To Initial User List Reducer");
export const resetToInitialArticleListReducer = createAction("Admin - Reset To Initial Article List Reducer");