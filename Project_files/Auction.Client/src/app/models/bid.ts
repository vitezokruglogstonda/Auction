import { EntityState } from "@ngrx/entity";
import { ArticleInfoDto } from "./article";
import { UserProfile } from "./user";

export interface BidItem{
    id: string;
    userProfile: UserProfile,
    amount: number,
}

export interface BidItemDto{
    userProfile: UserProfile,
    amount: number,
    articleId: number
}

export interface BidListState extends EntityState<BidItem>{

}

export interface BidDto{
    userId: number,
    articleId: number,
    amount: number
}

export interface BidCompletionDto{
    articleInfo: ArticleInfoDto,
    customerProfile: UserProfile
}