import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppState } from '../../store/app.state';
import { Store } from '@ngrx/store';
import { selectUserId, selectUserInfo, selectUserProfilePicturePath } from '../../store/user/user.selector';
import { UserProfile } from '../../models/user';
import { getProfile } from '../../store/profile/profile.action';
import { selectProfileInfo } from '../../store/profile/profile.selector';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UploadPictureDialogComponent } from '../upload-picture-dialog/upload-picture-dialog.component';
import { environment } from '../../../environments/environment';
import { AddMoneyDialogComponent } from '../add-money-dialog/add-money-dialog.component';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {

  public userId: number;
  public profile: UserProfile | null;
  public myProfile: boolean;
  public numberOfItemsSold: number;
  public balance: number;
  //public soldItemsList: List<Article>;
  private destroy$ = new Subject<void>();

  constructor(private store: Store<AppState>, private route: ActivatedRoute, public photoDialog: MatDialog) {
    this.userId = 0;
    this.profile = null;
    this.myProfile = false;
    this.numberOfItemsSold = 0;
    this.balance = 0;
  }

  ngOnInit() {
    this.route.params.pipe(
      switchMap((params) => {
        this.userId = Number(params['userId']);
        return this.store.select(selectUserId);
      }),
      takeUntil(this.destroy$)
    ).subscribe((state) => {
      if (state === this.userId) {
        this.myProfile = true;
        this.store.select(selectUserInfo).pipe(takeUntil(this.destroy$)).subscribe((profile) => {
          this.profile = { ...profile };
          this.balance = profile.balance;
        });
      } else {
        this.myProfile = false;
        this.store.dispatch(getProfile({ userId: this.userId }));
        this.store.select(selectProfileInfo).pipe(takeUntil(this.destroy$)).subscribe((profile) => {
          this.profile = { ...profile }; 
        });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  combineUserName() : string{
    return `${this.profile?.firstName} ${this.profile?.lastName}`
  }

  customDateToString() : string{
    return `${this.profile?.birthDate?.day}/${this.profile?.birthDate?.month}/${this.profile?.birthDate?.year}.`
  }

  openChangeProfilePhotoDialog(){
    this.photoDialog.open(UploadPictureDialogComponent, {
      width: environment.dialog_UploadPhoto_Settings.width,
      height: environment.dialog_UploadPhoto_Settings.height,
      enterAnimationDuration: environment.dialog_UploadPhoto_Settings.openAnimationDuration,
      data: {changePictureDialog: true}
    })
    // .afterClosed().subscribe(()=>{
    //   this.store.select(selectUserProfilePicturePath).subscribe((state)=>{
    //     this.profile!.profilePicturePath = state;
    //   })
    // })
  }

  openAddMoneyDialog(){
    this.photoDialog.open(AddMoneyDialogComponent, {
      width: environment.dialog_AddMoney_Settings.width,
      height: environment.dialog_AddMoney_Settings.height,
      enterAnimationDuration: environment.dialog_AddMoney_Settings.openAnimationDuration,
    })
  }

}
