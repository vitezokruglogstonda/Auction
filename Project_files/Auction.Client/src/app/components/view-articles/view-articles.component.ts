import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Article, ArticleViewMethod } from '../../models/article';
import { environment } from '../../../environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { loadArticles, loadTotalNumberOfArticles, searchArticlesByTitle } from '../../store/article/article.action';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';

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
  public sortOption: string;
  public searchQuery: string;
  @Input() showSearch: boolean;
  @ViewChild('search') searchSection!: ElementRef;
  @ViewChild('headerMenu') headerMenu!: ElementRef;
  

  constructor(private store: Store<AppState>){
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
    this.sortOption = "Asc";
    this.searchQuery = "";
    this.showSearch = false;
  }

  ngOnInit(){ //ngAfterInit()
    //this.numberOfArticles = this.articles.length;
    //if(this.numberOfArticles > this.pageSizeOptions[0])
      this.showPaginator = true;

    this.pageParametersEvent.emit([this.pageSize, this.pageIndex]);
    this.sortOption = "Asc";
    this.sortValueEmmiter.emit("Asc");
  }

  ngAfterViewInit() {
    this.addEventListenersToSearchSection();
    if(this.showSearch){
      this.headerMenu.nativeElement.classList.add("expanded");
    }else{
      this.headerMenu.nativeElement.classList.remove("expanded");
    }
  }

  addEventListenersToSearchSection(){
    if(this.searchSection){
      this.searchSection.nativeElement.addEventListener('click', () => {
        this.searchSection.nativeElement.classList.add('expanded');
        this.searchSection.nativeElement.firstChild.children[1].focus();
      });
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside() {
    if(event && this.searchSection){
      if (!this.searchSection!.nativeElement.contains(event.target as Node | null)) {
        this.searchSection!.nativeElement.classList.remove('expanded');
      }
    }
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
    this.sortOption = option;
    this.sortValueEmmiter.emit(option);
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
    this.store.dispatch(loadArticles({pageSize: this.pageSize, pageIndex: this.pageIndex, sortOption: this.sortOption}));
  }

}
