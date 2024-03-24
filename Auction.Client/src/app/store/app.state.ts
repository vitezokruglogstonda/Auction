import { AppInfo } from "../models/app-info";
import { ArticleInfo, ArticleListState, BidListState } from "../models/article";
import { User, UserProfile } from "../models/user";

export interface AppState{
    appInfo: AppInfo;
    userInfo: User;
    profileInfo: UserProfile;
    profileArticlesList: ArticleListState;
    articleInfo: ArticleInfo;
    articlesList: ArticleListState;
    bidList: BidListState;
}