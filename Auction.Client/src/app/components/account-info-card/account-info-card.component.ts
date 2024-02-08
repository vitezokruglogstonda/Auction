import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { take } from 'rxjs';
import { selectUserId, selectUserInfo } from '../../store/user/user.selector';
import { signOut } from '../../store/user/user.action';
import { selectLoginStatus } from '../../store/app/app.selector';
import { LoginStatus } from '../../models/app-info';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-info-card',
  templateUrl: './account-info-card.component.html',
  styleUrl: './account-info-card.component.css'
})
export class AccountInfoCardComponent {
  
  public accountImagePath: String;
  public userName: String;
  public moneyBalance: String;
  @Output() accountInfoCardEmitter: EventEmitter<boolean>;

  constructor(private store: Store<AppState>, private elRef: ElementRef, private router: Router) {
    this.accountImagePath = "";
    this.userName = "";
    this.moneyBalance = "";
    this.accountInfoCardEmitter = new EventEmitter<boolean>();
  }

  ngOnInit(): void {
    this.store.select(selectUserInfo).subscribe((state) => {
      this.accountImagePath = state.profilePicturePath;
      this.userName = `${state.firstName} ${state.lastName}`;
      this.moneyBalance = `$${state.balance}`;
    });
  }

  signOut(){
    this.store.dispatch(signOut());  
    this.accountInfoCardEmitter.emit(true);
  }

  myProfileRedirect(){
    this.store.select(selectUserId).subscribe((state) => {
      this.router.navigate(["/profile", state]);
    }).unsubscribe();
    this.accountInfoCardEmitter.emit(true);
  }

  @HostListener('document:click', ['$event'])
  hideCard(){
    let card: HTMLElement | null = (<HTMLElement>this.elRef.nativeElement).querySelector(".card-container");
    let icon: HTMLElement | null = (document).querySelector(".icon-container");
    if(event && card && icon){
      if(!card.contains(event.target as Node | null) && !icon.contains(event.target as Node | null)){
        this.accountInfoCardEmitter.emit(true);
      }
    }
  }
}
