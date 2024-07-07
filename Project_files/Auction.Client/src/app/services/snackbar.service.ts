import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarRef, MatSnackBarVerticalPosition } from "@angular/material/snack-bar";
import { environment } from "../../environments/environment";
import { CustomSnackbarComponent } from "../components/custom-snackbar/custom-snackbar.component";
import { SnackbarType } from "../models/app-info";

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {

    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent> | null;

    constructor(private snackBar: MatSnackBar) {
        this.snackBarRef = null;
    }

    public spawnSnackbar(message: string, infoType: SnackbarType) {
        let snackbarClass: string = "";
        switch (infoType) {
            case SnackbarType.Info:
                snackbarClass = 'info_snackbar';
                break;
            case SnackbarType.Error:
                snackbarClass = 'error_snackbar';
                break;
            default:
                break;
        }

        let snackBarRef = this.snackBar.openFromComponent(CustomSnackbarComponent, {
            data: { message: message, snackBarRef: null },
            horizontalPosition: environment.registrationError_snackBar.horisontal_position as MatSnackBarHorizontalPosition,
            verticalPosition: environment.registrationError_snackBar.vertical_position as MatSnackBarVerticalPosition,
            // panelClass: ['info_snackbar'],
            panelClass: [snackbarClass],
            duration: environment.registrationError_snackBar.duration,
        });
        snackBarRef.instance.data.snackBarRef = snackBarRef;
    }

    public dismiss() {
        this.snackBarRef != null && this.snackBarRef.containerInstance._animationState === 'visible' ? this.snackBarRef.dismiss() : "";
    }

}