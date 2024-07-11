import { createAction, props } from "@ngrx/store";
import { UserProfile } from "../../models/user";
import { Article } from "../../models/article";

export const getProfile = createAction("Ger User Profile", props<{userId : number}>());
export const getProfileSuccess = createAction("Ger User Profile - Success", props<{profile : UserProfile}>());
export const profilePictureChanged = createAction("Profile picture changed", props<{picturePath: String}>());

export const loadProfileArticles = createAction("Ger Users Articles", props<{userId : number}>());
export const loadProfileArticlesSuccess = createAction("Ger Users Articles - Success", props<{items: Article[]}>());
export const addArticle = createAction("Add Article", props<{item: Article}>());

export const resetToProfileInitialState = createAction("Profile - Reset To Profile Initial State");
export const resetToProfileArticlesListInitialState = createAction("Profile - Reset To Profile Articles List Initial State");