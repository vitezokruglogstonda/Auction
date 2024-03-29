import { EntityState } from "@ngrx/entity";
import { UserProfile } from "./user";

export interface Article {
    id: number | null;
    title: string;
    description: string;
    startingPrice: number;
    soldPrice: number;
    status: ArticleStatus;
    expiryDate: CustomDateTime;
    pictures: string[];
    creatorId: number;
    customerId: number | null;
}

export enum ArticleStatus{
    Pending,
    Biding,
    Sold,
    Expired
}

export enum ArticleViewMethod{
    List,
    Grid,
    Page
}

export interface ArticleDto{
    title: string;
    description: string;
    startingPrice: number;
    pictures: File[];
}

export interface CustomDateTime{
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number
}

export interface ArticleListState extends EntityState<Article>{

}

export interface ArticleInfo{
    articleOwners: ArticleOwners,
    currentlyBiddingArticle: boolean
}

export interface ArticleOwners{
    creator: UserProfile | null,
    customer: UserProfile | null
}

export interface BidItem{
    id: string;
    userProfile: UserProfile,
    amount: number
}

export interface BidItemDto{
    userProfile: UserProfile,
    amount: number
}

export interface BidListState extends EntityState<BidItem>{

}

export interface BidDto{
    articleId: number,
    amount: number
}

export interface ArticleInfoDto{
    status: ArticleStatus,
    lastPrice: number
}