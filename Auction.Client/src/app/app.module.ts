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
import { profileReducer } from './store/profile/profile.reducer';
import { ProfileEffects } from './store/profile/profile.effects';
import { AddMoneyDialogComponent } from './components/add-money-dialog/add-money-dialog.component';
import { CustomSnackbarComponent } from './components/custom-snackbar/custom-snackbar.component';
import { AuthGuard } from './guards/auth.guard';



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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot<AppState>({
      appInfo: appReducer,
      userInfo: userReducer,
      profileInfo: profileReducer,
    }),
    EffectsModule.forRoot([UserEffects, ProfileEffects]),
    BrowserAnimationsModule,
    FormsModule,
    materialComponents,
    StoreDevtoolsModule.instrument({
      maxAge: 7, 
      autoPause: true
    })
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    MatDatepickerModule,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
