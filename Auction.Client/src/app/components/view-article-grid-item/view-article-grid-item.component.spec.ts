import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewArticleGridItemComponent } from './view-article-grid-item.component';

describe('ViewArticleGridItemComponent', () => {
  let component: ViewArticleGridItemComponent;
  let fixture: ComponentFixture<ViewArticleGridItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewArticleGridItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewArticleGridItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
