import { createAction, props } from "@ngrx/store";
import { User } from "../../models/user";
import { Article } from "../../models/article";

export const loadTotalNumberOfUsers = createAction("Load Total Number Of Users");
export const loadTotalNumberOfUsersSuccess = createAction("Load Total Number Of Users - Success", props<{numberOfUsers: number}>());
export const loadAllUsers = createAction("Load All Users", props<{pageSize : number, pageIndex: number}>());
export const loadAllUsersSuccess = createAction("Load All Users Success", props<{users : User[]}>());

export const loadTotalNumberOfArticles = createAction("Load Total Number Of Articles");
export const loadTotalNumberOfArticlesSuccess = createAction("Load Total Number Of Articles - Success", props<{numberOfArticles: number}>());
export const loadAllArticles = createAction("Load All Articles", props<{pageSize : number, pageIndex: number}>());
export const loadAllArticlesSuccess = createAction("Load All Articles Success", props<{articles : Article[]}>());
export const searchArticlesByTitle = createAction("Search Articles By Title", props<{searchQuery: string}>());
export const searchArticlesByTitleSuccess = createAction("Search Articles By Title - Success", props<{articles : Article[]}>());