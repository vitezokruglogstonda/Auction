import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewArticleListItemComponent } from './view-article-list-item.component';

describe('ViewArticleListItemComponent', () => {
  let component: ViewArticleListItemComponent;
  let fixture: ComponentFixture<ViewArticleListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewArticleListItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewArticleListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
