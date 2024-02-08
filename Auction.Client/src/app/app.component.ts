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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  public toolbarCenterText: String;
  public menuButtonTooltipText: String;
  public sidenavItems: SidenavListItem[] = [];
  public accountIcon_Show: boolean;
  public showAccountInfoCard: boolean;
  public cardTriggeredEvent: Subject<number>;
  public userId: number | null;
  public userType: UserType;

  constructor(private store: Store<AppState>, private router: Router){
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
    this.store.select(selectLoginStatus).subscribe((state)=>{
      let route = "";
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
    this.sidenavItems = environment.sidenavItems.filter(item => [userType].some(role => item.permissions.includes(role)));
    if(userType != UserType.Guest){
      this.sidenavItems.find(item => item.title === "My Profile")!.route = `profile/${this.userId}`;
    }
  }

  updateAccountInfoCardAppearance(ev: boolean) {
    this.showAccountInfoCard = ev;
  }

  cardTriggeredHide() {
    this.cardTriggeredEvent.next(1);
  }

}
