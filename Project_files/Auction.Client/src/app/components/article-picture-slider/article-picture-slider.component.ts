import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ArticleViewMethod } from '../../models/article';
import { environment } from '../../../environments/environment';
import { NgStyle } from '@angular/common';

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
  public currentPictureStyle;
  @ViewChild('dots') dotsContainer!: ElementRef;
  @ViewChild('sliderElement') sliderElement!: ElementRef;

  constructor(private cd: ChangeDetectorRef) {
    this.pictures = [];
    this.currentIndex = 0;
    this.currentPicture = environment.defaultArticleImage;
    this.currentPictureStyle = 'backgroundImage: url("'+ this.currentPicture +'")';
    this.viewMethod = null;
  }
  
  ngAfterViewInit() {
    if(this.viewMethod == ArticleViewMethod.List){
      this.sliderElement.nativeElement.classList.add('slider-container-list');
      this.sliderElement.nativeElement.children[0].classList.add('picture-list');
    }
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
    this.currentPictureStyle = '{background: url("'+ this.currentPicture +'") no-repeat center center}';
    if(!this.dotsContainer)
      return;
    let allDots = this.dotsContainer.nativeElement.children;
    for(let i=0; i<allDots.length; i++){
      allDots[i].classList.remove("active-index");
    }
    allDots[this.currentIndex].classList.add("active-index");
  }

}
