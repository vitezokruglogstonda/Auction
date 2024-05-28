import { createReducer, on } from "@ngrx/store";
import { AppInfo, LoginStatus } from "../../models/app-info";
import * as AppActions from "./app.action";
import * as ArticleActions from "../article/article.action";
import { environment } from "../../../environments/environment";

export const initialState: AppInfo = {
    loginStatus: LoginStatus.Offline,
    loginError: false,
    registerError: false,
    emailTaken: false,
    accountImagePath: environment.account_icon_basic_URL,
    publishArticleError: false,
    totalNumberOfArticles: 0,
    loadArticlesListError: false,
};

export const appReducer = createReducer(
    initialState,
    on(AppActions.changeStatus, (state, {loginStatus, imagePath}) => ({
        ...state,
        loginStatus: loginStatus,
        accountImagePath: imagePath,
        loginError: false,
        registerError: false,
    })),
    on(AppActions.loginFail, (state) => ({
        ...state,
        loginError: true
    })),
    on(AppActions.registerFail, (state)=>({
        ...state,
        registerError: true
    })),
    on(AppActions.updateEmailError, (state, {status})=>({
        ...state,
        emailTaken: status
    })),
    on(AppActions.logout, (state)=>({
        ...initialState
    })),
    on(AppActions.changeProfilePicture, (state, {picturePath})=>({
        ...state,
        accountImagePath: picturePath
    })),    
    on(AppActions.publishArticleSuccess, (state)=>({
        ...state,
        publishArticleError: false
    })),
    on(AppActions.publishArticleFailed, (state)=>({
        ...state,
        publishArticleError: true
    })),   
    on(AppActions.resetPublishArticleError, (state)=>({
        ...state,
        publishArticleError: false
    })),   
    on(ArticleActions.loadTotalNumberOfArticles, (state)=>({
        ...state,
    })),   
    on(ArticleActions.loadTotalNumberOfArticlesSuccess, (state, {numberOfArticles})=>({
        ...state,
        totalNumberOfArticles: numberOfArticles
    })),
    on(ArticleActions.searchArticlesByTitle, (state, {searchQuery})=>({
        ...state,
    })),   
    on(ArticleActions.loadArticlesSuccess, (state, {items}) => ({
        ...state,
        loadArticlesListError: false
    })),   
    on(ArticleActions.loadArticlesFailed, (state)=>({
        ...state,
        loadArticlesListError: true
    })),   
      
);