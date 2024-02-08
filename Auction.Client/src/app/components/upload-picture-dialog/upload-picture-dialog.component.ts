import { Component, ElementRef, Inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppState } from '../../store/app.state';
import { Store } from '@ngrx/store';
import { changeProfilePhoto } from '../../store/user/user.action';

@Component({
  selector: 'app-upload-picture-dialog',
  templateUrl: './upload-picture-dialog.component.html',
  styleUrl: './upload-picture-dialog.component.css'
})
export class UploadPictureDialogComponent {
  public uploadedPicture: File | null | undefined;
  public dragDropArea: Element | null;
  public serverCommunication: boolean;
  public showUploadButton: boolean;

  constructor(
    private elRef: ElementRef,
    public dialogRef: MatDialogRef<UploadPictureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: Store<AppState>
  ) {
    this.uploadedPicture = null;
    this.dragDropArea = null;
    this.serverCommunication = data.changePictureDialog;
    this.showUploadButton = false;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dragDropArea = (<HTMLElement>this.elRef.nativeElement).querySelector(".drag-drop");
    environment.dragAndDropSettings.eventList_preventDefaults.forEach((eventName) => {
      this.dragDropArea?.addEventListener(eventName, this.preventDefaults, false)
    });
    environment.dragAndDropSettings.eventList_highlight.forEach(eventName => {
      this.dragDropArea?.addEventListener(eventName, () => {
        this.highlight(event);
      }, false)
    });
    environment.dragAndDropSettings.eventList_unhighlight.forEach(eventName => {
      this.dragDropArea?.addEventListener(eventName, () => {
        this.unhighlight(event);
      }, false);
    });
    this.dragDropArea?.addEventListener("drop", () => {
      this.handleDrop(event as DragEvent, this.dialogRef, this.uploadedPicture, this.elRef);
    }, false);

  }

  preventDefaults(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  highlight(e: Event | undefined) {
    if(e){
      (<HTMLElement> e.target).classList.add(environment.dragAndDropSettings.onDropClassName);
    }
  }

  unhighlight(e: Event | undefined) {
    if(e){
      (<HTMLElement>e.target).classList.remove(environment.dragAndDropSettings.onDropClassName);
    }
  }

  handleDrop(e: DragEvent  | undefined, dialogRef: MatDialogRef<UploadPictureDialogComponent>, uploadedPicture: File | null | undefined, elRef: ElementRef) {
    let errorMessageElement: Element | null = (<HTMLElement>elRef.nativeElement).querySelector(".upload-error");
    if(e != undefined){
      if ((e.dataTransfer as DataTransfer).files) {
        let files = (e.dataTransfer as DataTransfer).files;
        if (files.length > 1) {
          if(errorMessageElement){
            errorMessageElement.innerHTML = environment.dialog_UploadPhoto_Settings.errorMessage_numberOfFiles;
          }
        } else {
          uploadedPicture = files.item(0);
          if(uploadedPicture?.type.startsWith("image")){
            //this.uploadedPicture=uploadedPicture;
            if(!this.serverCommunication){
              dialogRef.close(uploadedPicture);
            }else{
              this.showUploadButton = true;
            }
          }else{
            if(errorMessageElement){
              errorMessageElement.innerHTML = environment.dialog_UploadPhoto_Settings.errorMessage_fileType;
            }
          }
        }
      }
    }
  }

  newPicture(ev: Event | null) {
    if(ev){
      if((ev.target as HTMLInputElement)?.files?.length===1){
        this.uploadedPicture = (ev.target as HTMLInputElement)?.files?.item(0);
        if(!this.serverCommunication){
          this.dialogRef.close(this.uploadedPicture);
        }else{
          this.showUploadButton = true;
        }
      }
    }
  }

  uploadPhoto(){
    this.store.dispatch(changeProfilePhoto({photo: this.uploadedPicture!}));
    this.dialogRef.close();
  }

  browse(){
    (document.getElementById("input-field") as HTMLInputElement).click();
  }

}
