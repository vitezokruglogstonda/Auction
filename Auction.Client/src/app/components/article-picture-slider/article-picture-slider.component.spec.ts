import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlePictureSliderComponent } from './article-picture-slider.component';

describe('ArticlePictureSliderComponent', () => {
  let component: ArticlePictureSliderComponent;
  let fixture: ComponentFixture<ArticlePictureSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArticlePictureSliderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArticlePictureSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
