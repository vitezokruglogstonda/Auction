import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';

import { StoreModule } from '@ngrx/store';
import { AppState } from './store/app.state';
import { appReducer } from './store/app/app.reducer';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UploadPictureDialogComponent } from './components/upload-picture-dialog/upload-picture-dialog.component';

import {materialComponents} from './app.material';
import {MatDatepickerModule} from '@angular/material/datepicker';

import { RegisterComponent } from './components/register/register.component';
import { userReducer } from './store/user/user.reducer';
import { EffectsModule } from '@ngrx/effects';
import { UserEffects } from './store/user/user.effects';
import { HomePageComponent } from './components/home-page/home-page.component';
import { AccountIconComponent } from './components/account-icon/account-icon.component';
import { AccountInfoCardComponent } from './components/account-info-card/account-info-card.component';
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { profileArticlesListReducer, profileReducer } from './store/profile/profile.reducer';
import { ProfileEffects } from './store/profile/profile.effects';
import { AddMoneyDialogComponent } from './components/add-money-dialog/add-money-dialog.component';
import { CustomSnackbarComponent } from './components/custom-snackbar/custom-snackbar.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CreateArticlePageComponent } from './components/create-article-page/create-article-page.component';
import { RouteService } from './services/route.service';
import { ViewArticlesComponent } from './components/view-articles/view-articles.component';
import { ArticlePictureSliderComponent } from './components/article-picture-slider/article-picture-slider.component';
import { ViewArticleListItemComponent } from './components/view-article-list-item/view-article-list-item.component';
import { ViewArticleGridItemComponent } from './components/view-article-grid-item/view-article-grid-item.component';
import { articleReducer, articlesListReducer, bidListReducer } from './store/article/article.reducer';
import { ArticleEffects } from './store/article/article.effects';
import { ArticlePageComponent } from './components/article-page/article-page.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { adminInfoReducer, articleListReducer, userListReducer } from './store/admin/admin.reducer';
import { AdminEffects } from './store/admin/admin.effects';



@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    RegisterComponent,
    UploadPictureDialogComponent,
    HomePageComponent,
    AccountIconComponent,
    AccountInfoCardComponent,
    ProfilePageComponent,
    AddMoneyDialogComponent,
    CustomSnackbarComponent,
    CreateArticlePageComponent,
    ViewArticlesComponent,
    ArticlePictureSliderComponent,
    ViewArticleListItemComponent,
    ViewArticleGridItemComponent,
    ArticlePageComponent,
    AdminDashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot<AppState>({
      appInfo: appReducer,
      userInfo: userReducer,
      profileInfo: profileReducer,
      profileArticlesList: profileArticlesListReducer,
      articlesList: articlesListReducer,
      articleInfo: articleReducer,
      bidList: bidListReducer,
      adminInfo: adminInfoReducer,
      adminUserList: userListReducer,
      adminArticleList: articleListReducer,
    }),
    EffectsModule.forRoot([UserEffects, ProfileEffects, ArticleEffects, AdminEffects]),
    BrowserAnimationsModule,
    FormsModule,
    materialComponents,
    StoreDevtoolsModule.instrument({
      //maxAge: 7, 
      maxAge: 100, 
      autoPause: true
    }),
    HttpClientModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    MatDatepickerModule,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    RouteService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
