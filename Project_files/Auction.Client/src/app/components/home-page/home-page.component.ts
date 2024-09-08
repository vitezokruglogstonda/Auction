import { Component, HostListener } from '@angular/core';
import { Article } from '../../models/article';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { loadArticles, loadTotalNumberOfArticles, searchArticlesByTitle } from '../../store/article/article.action';
import { selectArticles } from '../../store/article/article.selector';
import { selectLoadArticlesListError, selectTotalNumberOfArticles } from '../../store/app/app.selector';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  public articles: Article[];
  public pageSize: number;
  public pageIndex: number;
  public sortOption: string;
  public totalNumberOfArticles: number;
  public searchQuery: string;
  public loadArticlesListError: boolean;

  constructor(private store: Store<AppState>){
    this.articles = [];
    this.pageSize = 0;
    this.pageIndex = 0;
    this.sortOption = "Asc";
    this.totalNumberOfArticles = 0;
    this.searchQuery = "";
    this.loadArticlesListError = false;
  }

  ngOnInit(){
    this.store.select(selectLoadArticlesListError).subscribe(state => {
      this.loadArticlesListError = state;
    })
    this.store.select(selectArticles).subscribe(state => {
      this.articles.splice(0, this.articles.length);
      if(state && state.length > 0){
        state.forEach(item => {
          this.articles.push(item as Article);
        })
      }
    });
    this.store.select(selectTotalNumberOfArticles).subscribe(state => {
      if(state)
        this.totalNumberOfArticles = state;      
    });
    this.store.dispatch(loadTotalNumberOfArticles());
    this.store.dispatch(loadArticles({pageSize: this.pageSize, pageIndex: this.pageIndex, sortOption: this.sortOption}));
  }

  handlePageParametersChange(newPageParameters: [number, number]){
    this.pageSize = newPageParameters[0];
    this.pageIndex = newPageParameters[1];
    this.store.dispatch(loadArticles({pageSize: this.pageSize, pageIndex: this.pageIndex, sortOption: this.sortOption}));
  }

  handleSortOptionChanged(sort: string){
    this.pageIndex = 0;
    this.sortOption = sort;
    this.store.dispatch(loadArticles({pageSize: this.pageSize, pageIndex: this.pageIndex, sortOption: this.sortOption}));
  }

}
