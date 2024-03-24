import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ArticleViewMethod } from '../../models/article';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-article-picture-slider',
  templateUrl: './article-picture-slider.component.html',
  styleUrl: './article-picture-slider.component.css'
})
export class ArticlePictureSliderComponent {
  @Input() pictures: string[];
  @Input() viewMethod: ArticleViewMethod | null;
  public currentIndex: number;
  public currentPicture: string;
  @ViewChild('dots') dotsContainer!: ElementRef;

  constructor(private cd: ChangeDetectorRef) {
    this.pictures = [];
    this.currentIndex = 0;
    this.currentPicture = environment.defaultArticleImage;
    this.viewMethod = null;
  }
  
  ngAfterViewInit() {
    this.updateSlide();
    this.cd.detectChanges();
  }

  overlayEnabled(): boolean{
    return this.viewMethod !== ArticleViewMethod.Grid && this.pictures.length > 1;
  }

  nextSlide() {
    if (this.currentIndex < this.pictures.length - 1)
      this.currentIndex++;
    this.updateSlide();
  }

  previousSlide() {
    if (this.currentIndex > 0)
      this.currentIndex--;
    this.updateSlide();
  }

  updateSlide() {
    this.currentPicture = this.pictures[this.currentIndex];
    if(!this.dotsContainer)
      return;
    let allDots = this.dotsContainer.nativeElement.children;
    for(let i=0; i<allDots.length; i++){
      allDots[i].classList.remove("active-index");
    }
    allDots[this.currentIndex].classList.add("active-index");
  }

}
