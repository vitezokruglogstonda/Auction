import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { environment } from '../../../environments/environment';
import { selectEmailTaken, selectLoginErrorStatus } from '../../store/app/app.selector';
import { LoginDto } from '../../models/user';
import { checkEmail, logIn } from '../../store/user/user.action';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  public email: String;
  public emailExample: String;
  public emailFieldEmptyError: boolean;
  public emailErrorMessage_Invalid: String;
  public emailExistenceError: boolean;
  public emailExistenceError_Label: String;
  public emailPattern: String;
  public password: String;
  public passwordHide: boolean;
  public passwordFieldEmptyError: boolean;
  public fieldEmptyError_Label: String;
  public passwordWrongError: boolean;
  public passwordWrongError_Label: String;
  public loginError: boolean;

  constructor(private store: Store<AppState>, private snackbarService: SnackbarService) { 
    this.email = "";
    this.emailExample = environment.login_card_example_email;
    this.emailFieldEmptyError = false;
    this.emailErrorMessage_Invalid = environment.email_errorMessage_Invalid;
    this.emailExistenceError = false;
    this.emailExistenceError_Label = environment.email_errorMessage_Existence;
    this.emailPattern = environment.email_pattern;
    this.password = "";
    this.passwordHide = true;
    this.passwordFieldEmptyError = false;
    this.fieldEmptyError_Label = environment.login_card_fieldError;
    this.passwordWrongError = false;
    this.passwordWrongError_Label = environment.password_wrong_error;
    this.loginError = false;
  }

  ngOnInit(): void{
    this.store.select(selectLoginErrorStatus).subscribe((state)=>{
      this.passwordWrongError = state;
      if(!!state){
        this.snackbarService.spawnSnackbar("Invalid credentials. Try again.")
      }
    });
    this.store.select(selectEmailTaken).subscribe((state) => {
      this.emailExistenceError = !state;
    });
  }

  checkEmail() : boolean{
    if(this.email.length === 0){
      this.emailFieldEmptyError=true;
    }else{
      this.emailFieldEmptyError=false;
      this.store.dispatch(checkEmail({mail: this.email}));
    }
    return this.emailFieldEmptyError;
  }

  checkPassword() : boolean{
    if(this.password.length === 0){
      this.passwordFieldEmptyError=true;
    }else{
      this.passwordFieldEmptyError=false;
    }
    return this.passwordFieldEmptyError;
  }

  logIn(){
    if(!this.checkEmail() && !this.checkPassword() && !this.emailExistenceError){
      this.loginError = false;
      const dto: LoginDto = {
        email: this.email,
        password: this.password
      };      
      this.store.dispatch(logIn({loginDto: dto}));
    }else{
      this.loginError = true;
      this.snackbarService.spawnSnackbar("Invalid credentials. Try again.")
    }
  }


}
