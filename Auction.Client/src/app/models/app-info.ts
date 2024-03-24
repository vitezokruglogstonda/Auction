export interface AppInfo{
    loginStatus: LoginStatus;
    loginError: boolean;
    accountImagePath: String;
    registerError: boolean;
    emailTaken: boolean;
    publishArticleError: boolean,
    totalNumberOfArticles: number;
    loadArticlesListError: boolean;
}

export enum LoginStatus {
    Offline,
    Online
}