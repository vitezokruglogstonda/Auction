import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-snackbar',
  templateUrl: './custom-snackbar.component.html',
  styleUrl: './custom-snackbar.component.css'
})
export class CustomSnackbarComponent {

  public message: string;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
    this.message = this.data.message;
  }

  dismiss(){
    this.data.snackBarRef.dismiss();
  }

}
