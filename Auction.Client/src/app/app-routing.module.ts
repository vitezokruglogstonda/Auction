import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { AuthGuard } from './guards/auth.guard';
import { UserType } from './models/user';

const routes: Routes = [
  {
    path: "login",
    component: LogInComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [UserType.Guest] 
    }
  },
  {
    path: "register",
    component: RegisterComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [UserType.Guest] 
    }
  },
  {
    path: "",
    component: HomePageComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [UserType.Admin, UserType.RegisteredUser] 
    }
  },
  {
    path: "profile/:userId",
    component: ProfilePageComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [UserType.Admin, UserType.RegisteredUser] 
    }
  },
  { path: '**', redirectTo: "" } //404 strana
];

export const routingComponents = [LogInComponent, RegisterComponent, HomePageComponent, ProfilePageComponent];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
