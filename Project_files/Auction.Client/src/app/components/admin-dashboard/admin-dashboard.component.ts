import { Component } from '@angular/core';
import { Article, ArticleStatus } from '../../models/article';
import { User } from '../../models/user';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { loadAllArticles, loadAllUsers, adminLoadTotalNumberOfArticles, adminLoadTotalNumberOfUsers, removeArticle, republishArticle, adminSearchArticlesByTitle } from '../../store/admin/admin.action';
import { environment } from '../../../environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { selectAdminArticleList, selectAdminUserList, selectTotalNumberOfArticles, selectTotalNumberOfUsers } from '../../store/admin/admin.selector';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  public userList: User[];
  public articleList: Article[];
  public pageSizeOptions: number[];
  public numberOfUsers: number;
  public userPaginatorPageSize: number;
  public userPaginatorPageIndex: number;
  public numberOfArticles: number;
  public articlePaginatorPageSize: number;
  public articlePaginatorPageIndex: number;
  public searchQuery: string;

  constructor(private store: Store<AppState>, private router: Router) {
    this.userList = [];
    this.articleList = [];
    this.pageSizeOptions = environment.view_articles_pageSizeOptions;
    this.numberOfUsers = 0;
    this.userPaginatorPageSize = this.pageSizeOptions[0];
    this.userPaginatorPageIndex = 0;
    this.numberOfArticles = 0;
    this.articlePaginatorPageSize = this.pageSizeOptions[0];
    this.articlePaginatorPageIndex = 0;
    this.searchQuery = "";
  }

  ngOnInit() {
    this.store.dispatch(adminLoadTotalNumberOfUsers());
    this.store.dispatch(adminLoadTotalNumberOfArticles());
    this.store.dispatch(loadAllUsers({ pageIndex: this.userPaginatorPageIndex, pageSize: this.userPaginatorPageSize }))
    this.store.dispatch(loadAllArticles({ pageIndex: this.articlePaginatorPageIndex, pageSize: this.articlePaginatorPageSize }))

    this.store.select(selectTotalNumberOfUsers).subscribe(state => {
      if (state !== undefined)
        this.numberOfUsers = state;
    });
    this.store.select(selectTotalNumberOfArticles).subscribe(state => {
      if (state !== undefined)
        this.numberOfArticles = state;
    });

    this.store.select(selectAdminUserList).subscribe(state => {
      this.userList.splice(0, this.userList.length);
      if (state && state.length > 0) {
        state.forEach(user => {
          this.userList.push(user as User);
        })
      }
    });
    this.store.select(selectAdminArticleList).subscribe(state => {
      this.articleList.splice(0, this.articleList.length);
      if (state && state.length > 0) {
        state.forEach(article => {
          this.articleList.push(article as Article);
        })
      }
    });
  }

  handleUserPaginatorEvent(e: PageEvent) {
    this.userPaginatorPageSize = e.pageSize;
    this.userPaginatorPageIndex = e.pageIndex;
    this.store.dispatch(loadAllUsers({ pageIndex: this.userPaginatorPageIndex, pageSize: this.userPaginatorPageSize }))
  }

  handleArticlePaginatorEvent(e: PageEvent) {
    this.articlePaginatorPageSize = e.pageSize;
    this.articlePaginatorPageIndex = e.pageIndex;
    this.store.dispatch(loadAllArticles({ pageIndex: this.articlePaginatorPageIndex, pageSize: this.articlePaginatorPageSize }))
  }

  onSearchQueryChange() {
    if (this.searchQuery.length > 0)
      this.store.dispatch(adminSearchArticlesByTitle({ searchQuery: this.searchQuery }));
    else
      this.cancelSearch();
  }

  cancelSearch() {
    this.searchQuery = "";
    this.store.dispatch(adminLoadTotalNumberOfArticles());
    this.store.dispatch(loadAllArticles({ pageIndex: this.articlePaginatorPageIndex, pageSize: this.articlePaginatorPageSize }))
  }

  viewUser(user: User) {
    this.router.navigate(["/profile", user.id]);
  }

  viewArticle(articleId: number | null){
    this.router.navigate(["/article", articleId]);
  }

  getArticleStatusLabel(articleId: number | null): string {
    let statusValue: ArticleStatus = this.articleList.find(article => article.id === articleId)?.status!;
    let returnString: string;
    switch (statusValue) {
      case 0:
        returnString = "Pending";
        break;
      case 1:
        returnString = "Biding";
        break;
      case 2:
        returnString = "Sold";
        break;
      case 3:
        returnString = "Expired";
        break;
      default:
        returnString = "";
        break;
    }
    return returnString;
  }

  articlePendingOrExpired(articleId: number | null): boolean{
    let statusValue: ArticleStatus = this.articleList.find(article => article.id === articleId)?.status!;
    return statusValue === ArticleStatus.Pending || statusValue === ArticleStatus.Expired ? true : false;
  }

  articleExpired(articleId: number | null): boolean{
    let statusValue: ArticleStatus = this.articleList.find(article => article.id === articleId)?.status!;
    return statusValue === ArticleStatus.Expired ? true : false;
  }

  removeArticle(articleId: number | null, event: Event){
    event.stopPropagation();
    this.store.dispatch(removeArticle({articleId: articleId as number}));
  }

  republishArticle(articleId: number | null, event: Event){
    event.stopPropagation();
    this.store.dispatch(republishArticle({articleId: articleId as number}));
  }

}
