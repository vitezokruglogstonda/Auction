import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.state';
import { NavigationEnd, Router } from '@angular/router';
import { selectLoginStatus } from './store/app/app.selector';
import { LoginStatus } from './models/app-info';
import { UserType } from "./models/user";
import { environment } from '../environments/environment';
import { SidenavListItem } from './models/sidenav-info';
import { EMPTY, Subject, switchMap } from 'rxjs';
import { selectUserId, selectUserType } from './store/user/user.selector';
import { FormControl } from '@angular/forms';
import { LocalStorageService } from './services/local-storage.service';
import { logInWithToken } from './store/user/user.action';
import { RouteService } from './services/route.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  public toolbarCenterText: String;
  public menuButtonTooltipText: String;
  public sidenavItems: SidenavListItem[] = [];
  public sidenavIcons: string[] = [];
  public accountIcon_Show: boolean;
  public showAccountInfoCard: boolean;
  public cardTriggeredEvent: Subject<number>;
  public userId: number | null;
  public userType: UserType;

  constructor(private store: Store<AppState>, private router: Router, private localStorage: LocalStorageService, private routeService: RouteService){
    this.toolbarCenterText = environment.app_title;
    this.menuButtonTooltipText = environment.toolbar_menu_button_tooltip_text;
    this.accountIcon_Show = false;
    this.showAccountInfoCard = false;
    this.cardTriggeredEvent = new Subject<number>();
    this.userId = null;
    this.userType = UserType.Guest;
    this.populateSidenavList(this.userType);
  }
  
  ngOnInit(): void {
    if(this.localStorage.getItem('jwt')){
      this.store.dispatch(logInWithToken());
    }

    this.store.select(selectLoginStatus).subscribe((state)=>{
      let route = "";
      if(this.routeService.getCurrentRoute())
        route = this.routeService.getCurrentRoute()!;
      if(state === LoginStatus.Offline){
        this.accountIcon_Show = false;
        this.userType = UserType.Guest;
        this.populateSidenavList(this.userType);
        route = "login";
      }else{ 
        this.accountIcon_Show = true;
        this.store.select(selectUserId).subscribe((state)=>{
          this.userId = state;
        })
        this.store.select(selectUserType).subscribe((state)=>{
          this.userType=state;
          this.populateSidenavList(this.userType);
        })
      }
      this.router.navigate([`${route}`]);
    });    
  }
  
  populateSidenavList(userType: UserType): void{
    this.sidenavItems.splice(0, this.sidenavItems.length);
    this.sidenavIcons.splice(0, this.sidenavIcons.length);
    this.sidenavItems = environment.sidenavItems.filter(item => [userType].some(role => item.permissions.includes(role)));
    if(userType != UserType.Guest){
      this.sidenavItems.find(item => item.title === "My Profile")!.route = `profile/${this.userId}`;
    }
    this.sidenavItems.map(chosenItem => 
      environment.sidenavItems.findIndex(item => item.title === chosenItem.title)
    ).map(index => 
      this.sidenavIcons.push(environment.sidenavIcons_Classes[index])
    );    
  }

  updateAccountInfoCardAppearance(ev: boolean) {
    this.showAccountInfoCard = ev;
  }

  cardTriggeredHide() {
    this.cardTriggeredEvent.next(1);
  }

}
