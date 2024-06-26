import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { AuthGuard } from './guards/auth.guard';
import { UserType } from './models/user';
import { CreateArticlePageComponent } from './components/create-article-page/create-article-page.component';
import { RouteService } from './services/route.service';
import { ArticlePageComponent } from './components/article-page/article-page.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

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
  {
    path: "create-article",
    component: CreateArticlePageComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [UserType.Admin, UserType.RegisteredUser] 
    }
  },
  {
    path: "article/:articleId",
    component: ArticlePageComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [UserType.Admin, UserType.RegisteredUser] 
    }
  },
  {
    path: "admin-dashboard",
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [UserType.Admin] 
    }
  },
  { path: '**', redirectTo: "" } //404 strana
];

export const routingComponents = [LogInComponent, RegisterComponent, HomePageComponent, ProfilePageComponent, CreateArticlePageComponent, ArticlePageComponent, AdminDashboardComponent];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  constructor(private routeService: RouteService) {
    this.routeService.init(); 
  }
}
