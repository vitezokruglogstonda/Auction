import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateArticlePageComponent } from './create-article-page.component';

describe('CreateArticlePageComponent', () => {
  let component: CreateArticlePageComponent;
  let fixture: ComponentFixture<CreateArticlePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateArticlePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateArticlePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
