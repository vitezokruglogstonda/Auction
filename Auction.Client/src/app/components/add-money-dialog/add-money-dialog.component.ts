import { Component, Renderer2 } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { environment } from '../../../environments/environment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { addMoneyToAccount } from '../../store/user/user.action';

@Component({
  selector: 'app-add-money-dialog',
  templateUrl: './add-money-dialog.component.html',
  styleUrl: './add-money-dialog.component.css',
  animations: [
    trigger('slideAnimation', [
      state('option', style({
        transform: 'translateX(0%)',
      })),
      state('manual', style({
        transform: 'translateX(-50%)',
      })),
      transition('option => manual', animate('0.3s ease-in-out')),
      transition('manual => option', animate('0.3s ease-in-out')),
    ]),
  ],
})
export class AddMoneyDialogComponent {
  public amountOptions: String[];
  public selectedOption: String | null;
  public manualEnteringEnabled: boolean;
  public animationState: 'option' | 'manual';
  public firstTimeAnimationTrigger: boolean;
  public moneyAmount: number;
  public moneyAmountWarning_Show: boolean;
  public moneyAmountWarning: string;
  public minMoneyAmountLimit: number;

  constructor(private dialogRef: MatDialogRef<AddMoneyDialogComponent>, public store: Store<AppState>, private renderer: Renderer2){
    this.amountOptions = [... environment.addMoneyOptions];
    this.selectedOption = null;
    this.manualEnteringEnabled = false;
    this.animationState = "option";
    this.moneyAmount = 0;
    this.firstTimeAnimationTrigger = true;
    this.moneyAmountWarning_Show = false;
    this.minMoneyAmountLimit = Number(this.amountOptions[0].slice(1));
    this.moneyAmountWarning = `The least amount you can enter is $${this.minMoneyAmountLimit}.`;
  }

  selectOption(option: String){
    if(option === "..."){
      this.triggerAnimation();
      return;
    }
    else if (this.selectedOption === option) {
      this.selectedOption = null;
      this.moneyAmount = 0;
    } else {
      this.selectedOption = option;
      this.moneyAmount = Number(this.selectedOption.slice(1));
    }
    this.changeSubmitButtonStyle();
  }

  triggerAnimation(){
    this.selectedOption = null;
    this.moneyAmount = 0;
    this.animationState = this.manualEnteringEnabled ? "option" : "manual";
    this.manualEnteringEnabled = !this.manualEnteringEnabled;
    if(this.firstTimeAnimationTrigger){
      document.getElementsByClassName("manual-container")[0].classList.remove("manual-container-none");
      this.firstTimeAnimationTrigger = !this.firstTimeAnimationTrigger;
    }
    this.changeSubmitButtonStyle();
  }

  manualValueChanged(value: number | null){
    this.moneyAmount = 0;
    this.moneyAmountWarning_Show = false;
    if(value != null){
      value >= this.minMoneyAmountLimit ? this.moneyAmount = value : this.moneyAmountWarning_Show = true;
    }        
    this.changeSubmitButtonStyle();
  }

  changeSubmitButtonStyle(){
    if(this.moneyAmount > 0){
      document.getElementsByClassName("submit-button")[0].classList.add("submit-button-active");
    }else{
      document.getElementsByClassName("submit-button")[0].classList.remove("submit-button-active");
    }
  }

  addMoney(){
    this.store.dispatch(addMoneyToAccount({amount: this.moneyAmount}));
    this.dialogRef.close();
  }

}
