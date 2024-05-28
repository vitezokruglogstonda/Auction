import { AdminInfo } from "../models/admin-info";
import { AppInfo } from "../models/app-info";
import { ArticleInfo, ArticleListState } from "../models/article";
import { BidListState } from "../models/bid";
import { User, UserListState, UserProfile } from "../models/user";

export interface AppState{
    appInfo: AppInfo;
    userInfo: User;
    profileInfo: UserProfile;
    profileArticlesList: ArticleListState;
    articleInfo: ArticleInfo;
    articlesList: ArticleListState;
    bidList: BidListState;
    adminInfo: AdminInfo;
    adminUserList: UserListState;
    adminArticleList: ArticleListState;
}