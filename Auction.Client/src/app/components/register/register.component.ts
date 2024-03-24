import { Component, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { CustomDate, RegisterDto } from '../../models/user';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { UploadPictureDialogComponent } from '../upload-picture-dialog/upload-picture-dialog.component';
import { checkEmail, register } from '../../store/user/user.action';
import { selectEmailTaken } from '../../store/app/app.selector';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  public email: String;
  public emailError: boolean;
  public emailExample: String;
  public emailPattern: String;
  public emailErrorMessage_Invalid: String;
  public emailErrorMessage_Taken: String;
  public password: String;
  public passwordErrorMessage: String;
  public passwordHint: String;
  public passwordHide: boolean;
  public passwordRep: String;
  public passwordRepError: boolean;
  public passwordRepErrorMessage: String;
  public firstName: String;
  public lastName: String;
  public birthDate: CustomDate | null;
  public userGender: String;
  public gendersList: String[];
  public defaultPicturePath: String;
  public uploadedPicture: File | null;
  public userPictureExists: boolean;
  public showBadge: boolean;

  constructor(public dialog: MatDialog, private elRef: ElementRef, private store: Store<AppState>, private router: Router, private snackbarService: SnackbarService) {
    this.email = "";
    this.emailError = false;
    this.emailExample = environment.login_card_example_email;
    this.emailPattern = environment.email_pattern;
    this.emailErrorMessage_Invalid = environment.email_errorMessage_Invalid;
    this.emailErrorMessage_Taken = environment.email_errorMessage_Taken;
    this.password = "";
    this.passwordErrorMessage = environment.password_errorMessage;
    this.passwordHint = environment.password_hint;
    this.passwordHide = true;
    this.passwordRep = "";
    this.passwordRepError = false;
    this.passwordRepErrorMessage = environment.password_rep_errorMessage;
    this.firstName = "";
    this.lastName = "";
    this.birthDate = null;
    this.userGender = "";
    this.gendersList = environment.gender_list;
    this.defaultPicturePath = environment.account_icon_basic_URL;
    this.uploadedPicture = null;
    this.userPictureExists = false;
    this.showBadge = false;
  }

  ngOnInit(): void {
    this.store.select(selectEmailTaken).subscribe((state) => {
      this.emailError = state;
    });
  }

  checkEmail(e: Event) {
    this.store.dispatch(checkEmail({ mail: (<HTMLInputElement>e.target).value }));
  }

  newDate(ev: MatDatepickerInputEvent<Date>) {
    let rawStringDate: string | undefined = ev.value?.toString();
    let rawStringDate_decomposed = rawStringDate?.split(" ", 4);
    if (rawStringDate_decomposed) {
      let _month: number;
      switch (rawStringDate_decomposed[1]) {
        case "Jan": {
          _month = 1;
          break;
        }
        case "Feb": {
          _month = 2;
          break;
        }
        case "Mar": {
          _month = 3;
          break;
        }
        case "Apr": {
          _month = 4;
          break;
        }
        case "May": {
          _month = 5;
          break;
        }
        case "Jun": {
          _month = 6;
          break;
        }
        case "Jul": {
          _month = 7;
          break;
        }
        case "Aug": {
          _month = 8;
          break;
        }
        case "Sep": {
          _month = 9;
          break;
        }
        case "Oct": {
          _month = 10;
          break;
        }
        case "Nov": {
          _month = 11;
          break;
        }
        case "Dec": {
          _month = 12;
          break;
        }
        default: {
          _month = 0;
          break;
        }
      }
      this.birthDate = {
        year: Number(rawStringDate_decomposed[3]),
        month: _month,
        day: Number(rawStringDate_decomposed[2])
      }
    }
  }

  deletePhoto() {
    if (this.uploadedPicture !== null) {
      this.uploadedPicture = null;
      let imageTag: HTMLImageElement | null = (<HTMLElement>this.elRef.nativeElement).querySelector(".profile-picture");
      if (imageTag) {
        imageTag.src = this.defaultPicturePath as string;
        this.userPictureExists = false;
      }
    }
  }

  openUploadDialog() {
    this.dialog.open(UploadPictureDialogComponent, {
      width: environment.dialog_UploadPhoto_Settings.width,
      height: environment.dialog_UploadPhoto_Settings.height,
      enterAnimationDuration: environment.dialog_UploadPhoto_Settings.openAnimationDuration,
      data: { changePictureDialog: false }
    }).afterClosed().subscribe((result: File) => {
      if (result) {
        this.uploadedPicture = result;
        let imageTag: HTMLImageElement | null = (<HTMLElement>this.elRef.nativeElement).querySelector(".profile-picture");
        if (imageTag) {
          imageTag.src = URL.createObjectURL(result);
          this.userPictureExists = true;
        }
      }
    });
  }

  checkData(): boolean {
    if (this.email === "" || this.password === "" || this.passwordRep === "" || this.password !== this.passwordRep || this.firstName === "" || this.lastName === "" || this.userGender === "" || this.birthDate === null || this.emailError) {
      return false;
    } else {
      return true;
    }
  }

  registerNow() {
    if (this.checkData()) {
      this.snackbarService.dismiss();      
      let userData: RegisterDto = {
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        birthDate: this.birthDate,
        gender: this.userGender,
        profilePicture: this.uploadedPicture,
      };
      this.store.dispatch(register({ registerDto: userData }));
    } else {
      this.snackbarService.spawnSnackbar(environment.registrationError_snackBar.text);     
    }
  }

}
