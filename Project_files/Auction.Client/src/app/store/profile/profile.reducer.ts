import { createReducer, on } from "@ngrx/store";
import { UserProfile } from "../../models/user";
import * as Actions from "./profile.action";
import { EntityAdapter, createEntityAdapter } from "@ngrx/entity";
import { Article, ArticleListState } from "../../models/article";

export const initialState: UserProfile = {
    id: 0,
    email: "",
    firstName: "",
    lastName: "",
    birthDate: null,
    gender: "",
    profilePicturePath: ""
};

export const profileReducer = createReducer(
    initialState,
    on(Actions.getProfile, (state, {userId}) => ({...state})),
    on(Actions.getProfileSuccess, (state, {profile}) => ({
        ...profile
    })),
    on(Actions.profilePictureChanged, (state, {picturePath}) => ({
        ...state,
        profilePicturePath: picturePath
    })),
    on(Actions.loadProfileArticles, (state, {userId}) => ({
        ...state,
    })),
    on(Actions.resetToProfileInitialState, (state) => ({
        ...initialState
    })),
);

export const profileArticlesListAdapter: EntityAdapter<Article> = createEntityAdapter<Article>();

export const initialProfileArticlesListState: ArticleListState = profileArticlesListAdapter.getInitialState({
});

export const profileArticlesListReducer = createReducer(
    initialProfileArticlesListState,
    on(Actions.loadProfileArticlesSuccess, (state, {items}) => {
        return profileArticlesListAdapter.addMany(items, state);
    }),
    on(Actions.addArticle, (state, {item}) => {
        return profileArticlesListAdapter.addOne(item, state);
    }),
    //update 1 zbog promene statusa artikla
    on(Actions.resetToProfileArticlesListInitialState, (state) => ({
        ...initialProfileArticlesListState
    })),
);