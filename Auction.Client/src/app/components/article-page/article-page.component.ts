import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription, first, interval, switchMap, take, takeUntil, takeWhile } from 'rxjs';
import { AppState } from '../../store/app.state';
import { Article, ArticleStatus, ArticleViewMethod, BidItem, CustomDateTime } from '../../models/article';
import { selectBidItems, selectCurrentlyBiddingArticle, selectProfilesForArticle, selectSingleArticle } from '../../store/article/article.selector';
import { changeArticleStatus, checkIfCurrentlyBidding, clearBidList, getBidList, loadArticlesOwners, loadSingleArticle, newBid, startBidding } from '../../store/article/article.action';
import { UserProfile } from '../../models/user';
import { getProfile } from '../../store/profile/profile.action';
import { selectProfileInfo } from '../../store/profile/profile.selector';
import { selectUserId, selectUserInfo } from '../../store/user/user.selector';
import { environment } from '../../../environments/environment';
import { SnackbarService } from '../../services/snackbar.service';
import { BidService } from '../../services/bid.service';

@Component({
  selector: 'app-article-page',
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.css'
})
export class ArticlePageComponent {

  public userId: number;
  public userBalance: number;
  private destroy$ = new Subject<void>();
  public articleId: number;
  public article: Article | null;
  public articleViewMethod: ArticleViewMethod;
  public articleCreator: UserProfile | null;
  public articleCustomer: UserProfile | null;
  public articleStatusLabel: string;
  public expiryDateLabel: string;
  public expiryTimeLeft: string;
  public showExpiryDate: boolean;
  public showExpiryTimeLeft: boolean;
  public expiryTimeLeftSubscription: Subscription | null;
  public showCurrentPrice: boolean;
  public currentlyBidding: boolean;
  public showEnrollButton: boolean;
  public showBidSection: boolean;
  public showBidList: boolean;
  public bidList: BidItem[];
  public firstTime: boolean;
  public fee: number;
  public newBid: number;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private router: Router, private snackbarService: SnackbarService, private bidService: BidService) {
    this.userId = 0;
    this.userBalance = 0;
    this.articleId = 0;
    this.article = null;
    this.articleViewMethod = ArticleViewMethod.Page
    this.articleCreator = null;
    this.articleCustomer = null;
    this.articleStatusLabel = "";
    this.expiryDateLabel = "";
    this.expiryTimeLeft = "";
    this.showExpiryDate = false;
    this.showExpiryTimeLeft = false;
    this.expiryTimeLeftSubscription = null;
    this.showCurrentPrice = false;
    this.currentlyBidding = false;
    this.showEnrollButton = false;
    this.showBidSection = false;
    this.showBidList = false;
    this.bidList = [];
    this.firstTime = true;
    this.fee = environment.defaultFee;
    this.newBid = 0;
  }

  ngOnInit() {    
    this.store.dispatch(clearBidList());
    this.store.select(selectBidItems).subscribe(state => {
      this.bidList.splice(0, this.bidList.length);
      state.forEach(bidItem => {
        if(bidItem !== undefined)
          this.bidList.push(bidItem);
      })
      this.bidList.sort((a, b) => {
        if (a.amount > b.amount) {
            return -1;
        }
        if (a.amount < b.amount) {
            return 1;
        }
        return 0;
      });
      this.showBidList = this.bidList.length === 0 ? false : true;
    })
    // this.store.select(selectUserId).subscribe(state => {
    //   if (state)
    //     this.userId = state;
    // });
    this.store.select(selectUserInfo).subscribe(state => {
      if (state)
        this.userId = state.id as number;
        this.userBalance = state.balance;
    });    
    this.route.params.pipe(
      switchMap((params) => {
        this.articleId = Number(params['articleId']);
        return this.store.select(selectSingleArticle(this.articleId));
      }),
      takeUntil(this.destroy$)
    ).subscribe((state) => {
      if (state !== undefined) {
        this.article = state;
        this.articleProcessing();
      } else {
        this.store.dispatch(loadSingleArticle({ articleId: this.articleId }));
      }
    })
    this.expiryTimeLeftSubscription = interval(1000).pipe(
      takeWhile(() =>
        this.expiryTimeLeft !== "Expired"
      )
    ).subscribe(() => {
      this.expiryTimeLeft = this.getTimeLeft(this.article?.expiryDate!);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.bidService.closeConnection();
  }

  articleProcessing() {
    if(this.firstTime){
      this.store.dispatch(loadArticlesOwners({ creatorId: this.article?.creatorId as number, customerId: this.article?.customerId as number | null }));
      this.store.select(selectProfilesForArticle).pipe(takeUntil(this.destroy$)).subscribe((profiles) => {
        if (profiles.creator !== null)
          this.articleCreator = { ...profiles.creator };
        if (profiles.customer !== null)
          this.articleCustomer = { ...profiles.customer };
      });
    }    
    this.articleStatusLabel = this.getStatusLabel();
    this.showBidSection = this.article?.status === ArticleStatus.Biding ? true : false;
    if (this.article?.status == ArticleStatus.Sold) {
      this.showExpiryDate = false;
    } else {
      this.showExpiryDate = true;
      if (this.article?.status == ArticleStatus.Biding || this.article?.status == ArticleStatus.Pending) {
        this.showExpiryTimeLeft = true;
      } else {
        this.showExpiryTimeLeft = false;
      }
      this.expiryDateLabel = this.getExpiryDateLabel();
    }
    this.showCurrentPrice = this.article?.status === ArticleStatus.Biding || this.article?.status === ArticleStatus.Sold ? true : false;
    if (this.article?.status === ArticleStatus.Biding || this.article?.status === ArticleStatus.Pending) {
      if (this.article?.creatorId !== this.userId) {
        if(this.firstTime){
          this.store.dispatch(checkIfCurrentlyBidding({ articleId: this.article?.id as number }));
        }
        this.firstTime = false;
        this.store.select(selectCurrentlyBiddingArticle).subscribe(state => {
          if (state !== undefined) {
            if(state){
              this.showEnrollButton = false;
              if(!this.currentlyBidding)
                this.store.dispatch(getBidList({articleId: this.article?.id as number}));

            }else{
              this.showEnrollButton = true;
            }
            this.currentlyBidding = state;
          }
        });
      } else if(this.article?.status === ArticleStatus.Biding){
        this.store.dispatch(getBidList({articleId: this.article?.id as number}));
      }
    }
  }

  goToProfile(userId: number | undefined | null) {
    if (!!userId)
      this.router.navigate(["/profile", userId]);
  }

  getStatusLabel(): string {
    let label;
    switch (this.article?.status) {
      case ArticleStatus.Biding:
        label = "Biding";
        break;
      case ArticleStatus.Pending:
        label = "Pending";
        break;
      case ArticleStatus.Expired:
        label = "Expired";
        break;
      default:
        label = "";
        break;
    }
    return label;
  }

  getTimeLeft(expiryTime: CustomDateTime): string {
    let currentDate: Date = new Date();
    let expiryDate: Date = new Date(
      expiryTime.year,
      expiryTime.month - 1,
      expiryTime.day,
      expiryTime.hour,
      expiryTime.minute,
      expiryTime.second,
    )

    if (expiryDate <= currentDate) {
      this.expiryTimeLeftSubscription!.unsubscribe();

      this.article!.status = ArticleStatus.Expired;
      this.showExpiryTimeLeft = false;
      //ovo mora da se azurira negde

      return "Expired";
    }

    let timeDifference: number = expiryDate.getTime() - currentDate.getTime();

    const daysDifference: number = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
    const remainingTime: number = timeDifference % (24 * 60 * 60 * 1000);
    const hoursDifference: number = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutesDifference: number = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    const secondsDifference: number = Math.floor((remainingTime % (60 * 1000)) / 1000);

    let timeLeftLabel: string = "";

    if (daysDifference > 0) {
      timeLeftLabel += `${daysDifference}`;
      timeLeftLabel += daysDifference === 1 ? "day " : "days ";
    }
    if (hoursDifference > 0) {
      timeLeftLabel += `${hoursDifference}h `;
    }
    if (minutesDifference > 0) {
      timeLeftLabel += `${minutesDifference}min `;
    }
    timeLeftLabel += `${secondsDifference}s `;

    return timeLeftLabel;
  }

  getExpiryDateLabel(): string {
    return `${this.article?.expiryDate.day}.${this.article?.expiryDate.month}.${this.article?.expiryDate.year}. | ${this.article?.expiryDate.hour}:${this.article?.expiryDate.minute}`;
  }

  enroll() {
    this.store.dispatch(startBidding({articleId: this.article?.id as number}));
  }

  bidValueEntered(value: number | null){
    this.newBid = 0;
    let test: boolean = true;
    if(value != null){
      value >= this.article?.soldPrice! + 100 ? this.newBid = value : test = false;
    }        
    this.changeSubmitButtonStyle(test);
  }

  changeSubmitButtonStyle(action: boolean){
    if(action){
      document.getElementsByClassName("bid-button")[0].classList.add("bid-button-active");
    }else{
      document.getElementsByClassName("bid-button")[0].classList.remove("bid-button-active");      
    }
  }

  placeBid(){
    if(this.newBid < this.article?.soldPrice! + 100){
      this.snackbarService.spawnSnackbar("The bid amount must be at least $100 grater than last the bid.");
      return;
    }
    if(this.newBid > this.userBalance){
      this.snackbarService.spawnSnackbar("You don't have enough money on your balance.");
      return;
    }
    this.store.dispatch(newBid({userId: this.userId, articleId : this.article?.id!, amount: this.newBid}));
  }

}
