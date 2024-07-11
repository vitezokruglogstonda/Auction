import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Article, ArticleViewMethod } from '../../models/article';
import { environment } from '../../../environments/environment';
import { PageEvent } from '@angular/material/paginator';

export enum ViewSetting{
  List,
  Grid
}

@Component({
  selector: 'app-view-articles',
  templateUrl: './view-articles.component.html',
  styleUrl: './view-articles.component.css'
})
export class ViewArticlesComponent {

  @Input() articles: Article[];
  public viewSetting: ViewSetting;
  public showPaginator: boolean;
  @Input() numberOfArticles: number;
  public pageSizeOptions: number[];
  public pageSize: number;
  public pageIndex: number;
  public articleViewMethod: ArticleViewMethod;
  @Output() pageParametersEvent: EventEmitter<[number,number]>;
  @Input() showSortOption: boolean;
  public sortOptions: string[];
  public sortValue: string;
  @Output() sortValueEmmiter: EventEmitter<string>;

  constructor(){
    this.articles = [];
    this.viewSetting = ViewSetting.Grid;
    this.showPaginator = false;
    this.numberOfArticles = 0;
    this.pageSizeOptions = environment.view_articles_pageSizeOptions;
    this.pageSize = this.pageSizeOptions[0];
    this.pageIndex = 0;
    this.articleViewMethod = ArticleViewMethod.Grid
    this.pageParametersEvent = new EventEmitter<[number,number]>();
    this.showSortOption = false;
    this.sortOptions = environment.sort_options;
    this.sortValue = environment.sort_options[0];
    this.sortValueEmmiter = new EventEmitter<string>();
  }

  ngOnInit(){ //ngAfterInit()
    //this.numberOfArticles = this.articles.length;
    //if(this.numberOfArticles > this.pageSizeOptions[0])
      this.showPaginator = true;

    this.pageParametersEvent.emit([this.pageSize, this.pageIndex]);
    this.sortValueEmmiter.emit("Asc");
  }

  viewSetToGrid():boolean{
    return this.viewSetting === ViewSetting.Grid;
  }

  viewSetToList():boolean{
    return this.viewSetting === ViewSetting.List;
  }

  listView(){
    if(this.viewSetting !== ViewSetting.List)
    {
      this.viewSetting = ViewSetting.List;
      this.articleViewMethod = ArticleViewMethod.List;
    }
  }

  gridView(){
    if(this.viewSetting !== ViewSetting.Grid)
    {
      this.viewSetting = ViewSetting.Grid;
      this.articleViewMethod = ArticleViewMethod.Grid;
    }
  }

  handlePaginatorEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.pageParametersEvent.emit([this.pageSize, this.pageIndex]);
  }

  sortOptionChanged(option: string){
    this.sortValue = option;
    this.pageIndex = 0;
    this.sortValueEmmiter.emit(option);
  }

}
