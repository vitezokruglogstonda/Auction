import { Component } from '@angular/core';
import { Article } from '../../models/article';
import { User } from '../../models/user';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { loadAllArticles, loadAllUsers, loadTotalNumberOfArticles, loadTotalNumberOfUsers, searchArticlesByTitle } from '../../store/admin/admin.action';
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

  constructor(private store: Store<AppState>, private router: Router){
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

  ngOnInit(){
    this.store.dispatch(loadTotalNumberOfUsers());
    this.store.dispatch(loadTotalNumberOfArticles());
    this.store.dispatch(loadAllUsers({pageIndex: this.userPaginatorPageIndex, pageSize: this.userPaginatorPageSize}))
    this.store.dispatch(loadAllArticles({pageIndex: this.articlePaginatorPageIndex, pageSize: this.articlePaginatorPageSize}))
    
    this.store.select(selectTotalNumberOfUsers).subscribe(state => {
      if(state !== undefined)
        this.numberOfUsers = state;
    });
    this.store.select(selectTotalNumberOfArticles).subscribe(state => {
      if(state !== undefined)
        this.numberOfArticles = state;
    });

    this.store.select(selectAdminUserList).subscribe(state => {
      this.userList.splice(0, this.userList.length);
      if(state && state.length > 0){
        state.forEach(user => {
          this.userList.push(user as User);
        })
      }
    });
    this.store.select(selectAdminArticleList).subscribe(state => {
      this.articleList.splice(0, this.articleList.length);
      if(state && state.length > 0){
        state.forEach(article => {
          this.articleList.push(article as Article);
        })
      }
    });
  }

  handleUserPaginatorEvent(e: PageEvent) {
    this.userPaginatorPageSize = e.pageSize;
    this.userPaginatorPageIndex = e.pageIndex;
    this.store.dispatch(loadAllUsers({pageIndex: this.userPaginatorPageIndex, pageSize: this.userPaginatorPageSize}))
  }

  handleArticlePaginatorEvent(e: PageEvent) {
    this.articlePaginatorPageSize = e.pageSize;
    this.articlePaginatorPageIndex = e.pageIndex;
    this.store.dispatch(loadAllArticles({pageIndex: this.articlePaginatorPageIndex, pageSize: this.articlePaginatorPageSize}))
  }

  onSearchQueryChange(){
    if(this.searchQuery.length>0)
      this.store.dispatch(searchArticlesByTitle({searchQuery: this.searchQuery}));
    else 
      this.cancelSearch();
  }

  cancelSearch(){
    this.searchQuery="";
    this.store.dispatch(loadTotalNumberOfArticles());
    this.store.dispatch(loadAllArticles({pageIndex: this.articlePaginatorPageIndex, pageSize: this.articlePaginatorPageSize}))
  }

  viewUser(user: User){
    this.router.navigate(["/profile", user.id]);
  }

  // viewArticle(){
  //   this.router.navigate(["/article", this.article!.id]);
  // }

}
