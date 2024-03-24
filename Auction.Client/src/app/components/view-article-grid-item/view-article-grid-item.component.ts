import { Component, Input } from '@angular/core';
import { Article, ArticleViewMethod } from '../../models/article';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-article-grid-item',
  templateUrl: './view-article-grid-item.component.html',
  styleUrl: './view-article-grid-item.component.css'
})
export class ViewArticleGridItemComponent {
  @Input() article: Article | null;
  @Input() articleViewMethod: ArticleViewMethod | null;

  constructor(private router: Router){
    this.article = null;
    this.articleViewMethod = null;
  }

  viewArticle(){
    this.router.navigate(["/article", this.article!.id]);
  }

}
