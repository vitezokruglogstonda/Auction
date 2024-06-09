import { EntityState } from "@ngrx/entity";
import { Article, CustomDateTime } from "./article";

export interface User {
    id: number | null;
    email: String;
    firstName: String;
    lastName: String;
    birthDate: CustomDate;
    gender: String;
    userType: UserType;
    profilePicturePath: String;
    balance: number;
}

export enum UserType {
    Admin,
    RegisteredUser,
    Guest
}

export interface CustomDate{
    year: number,
    month: number,
    day: number
}

export interface RegisterDto {
    email: String;
    password: String;
    firstName: String;
    lastName: String;
    birthDate: CustomDate | null;
    gender: String;
    profilePicture: File | null;
}

export interface LoginDto {
    email: String;
    password: String;
}

export interface UserProfile {
    id: number | null;
    email: String;
    firstName: String;
    lastName: String;
    birthDate: CustomDate | null;
    gender: String;
    profilePicturePath: String;
}

export interface ProfileResult{
    profile: UserProfile,
    articles: Article[] | null,
}

export interface UserListState extends EntityState<User>{

}

export interface NotificationDto{
    text: string;
    timestamp: CustomDateTime;
    type: NotificationType;
    status: NotificationStatus;
    endDate: CustomDateTime;
    articleInfo: NotificationArticleInfo;
    next: string | null;
}


export interface Notification{
    id: string;
    text: string;
    timestamp: CustomDateTime;
    type: NotificationType;
    status: NotificationStatus;
    endDate: CustomDateTime;
    articleInfo: NotificationArticleInfo;
}

export enum NotificationType{
    ArticleExpired,
    BidEnd,
    TransactionComplete,
    InvalidTransaction
}

export enum NotificationStatus
{
    NotRead,
    Read
}

export interface NotificationArticleInfo{
    articleId: number;
    title: string;
    lastPrice: number;
}

export interface NotificationListState extends EntityState<Notification>{

}