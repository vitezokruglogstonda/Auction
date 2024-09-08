import { Component, ElementRef} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { environment } from '../../../environments/environment';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ArticleDto, CustomDateTime, CustomTime } from '../../models/article';
import { publishArticle } from '../../store/user/user.action';
import { selectPublishArticleError } from '../../store/app/app.selector';
import { Router } from '@angular/router';
import { selectUserId } from '../../store/user/user.selector';
import { resetPublishArticleError } from '../../store/app/app.action';
import { SnackbarService } from '../../services/snackbar.service';
import { SnackbarType } from '../../models/app-info';
import { CustomDate } from '../../models/user';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-create-article-page',
  templateUrl: './create-article-page.component.html',
  styleUrl: './create-article-page.component.css',
  animations: [
    trigger('textareaAnimation', [
      state('enlarged', style({ height: '20em' })),
      state('shrink', style({ height: '1.5em' })),
      transition('enlarged <=> shrink', animate('0.3s ease')),
    ]),
  ],
})
export class CreateArticlePageComponent {

  public userId: number;
  public dragDropArea: Element | null;
  public uploadedPictures: (File | null)[] = [];
  public articleTitle: string;
  public errorMessage_InputField: string;
  public articleDescription: string;  
  public startingPrice: number;
  public expiryTime: CustomTime | null;
  public expiryDate: CustomDate | null;
  public expiryDateTime: CustomDateTime | null;
  public moneyAmountWarning_Show: boolean;
  public moneyAmountWarning: string;
  public minMoneyAmountLimit: number;
  public descriptionField_Enlarged: boolean;

  constructor(private store: Store<AppState>, private elRef: ElementRef, private snackbarService: SnackbarService, private router: Router){
    this.userId = 0;
    this.dragDropArea = null;
    for(let i=0; i<environment.article_picture_upload.numberOfFiles; i++)
      this.uploadedPictures.push(null);
    this.articleTitle = "";
    this.articleDescription = "";
    this.startingPrice = 0;
    this.expiryTime = null;
    this.expiryDate = null;
    this.expiryDateTime = null;
    this.errorMessage_InputField = environment.article_data_upload.errorMessage_inputField;
    this.moneyAmountWarning_Show = false;
    this.minMoneyAmountLimit = 100;
    this.moneyAmountWarning = `The least amount you can enter is $${this.minMoneyAmountLimit}.`;
    this.descriptionField_Enlarged = false;
  }

  ngOnInit(){
    this.store.select(selectUserId).subscribe((state) => {
      this.userId = state as number;
    });
    this.store.dispatch(resetPublishArticleError());
  }

  enlargeTextarea() {
    this.descriptionField_Enlarged = true;
    this.changeSubmitButtonStyle();
  }

  shrinkTextarea() {
    this.descriptionField_Enlarged = false;
    this.changeSubmitButtonStyle();
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
      this.handleDrop(event as DragEvent, this.elRef);
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

  handleDrop(e: DragEvent  | undefined, elRef: ElementRef) {
    let errorMessageElement: Element | null = (<HTMLElement>elRef.nativeElement).querySelector(".upload-error");
    if(e != undefined){
      if ((e.dataTransfer as DataTransfer).files) {
        let files = (e.dataTransfer as DataTransfer).files;
        if(files)
          this.handleFiles(files);
      }
    }
  }

  browse(){
    (document.getElementById("input-field") as HTMLInputElement).click();
  }

  newPicture(ev: Event | null) {
    if(ev){
      let files = (ev.target as HTMLInputElement)?.files;
      if(files && files.length > 0)
        this.handleFiles(files);
    }
  }

  handleFiles(files: FileList | null){
    if(files?.length! > 5 || (this.getFileListLength() + files?.length! > 5)){
      this.snackbarService.spawnSnackbar(environment.article_picture_upload.errorMessage_numberOfFiles, SnackbarType.Error);
      return;
    }
    for (let i = 0; i < files?.length!; i++)
    {
      if(!files?.item(i)!.type.startsWith("image")){
        this.snackbarService.spawnSnackbar(environment.article_picture_upload.errorMessage_fileType, SnackbarType.Error);
        continue;
      }
      if(this.getFileSize(files?.item(i)!) > environment.article_picture_upload.fileSize){
        this.snackbarService.spawnSnackbar(environment.article_picture_upload.errorMessage_fileSize, SnackbarType.Error);
        continue;
      }
      this.addFileToList(files?.item(i)!);
    }
  }

  getFileSize(file: File): number{
    const fileSizeInMB = file.size / (1024 * 1024);
    return Math.round(fileSizeInMB * 100) / 100;
  }

  getFileListLength(): number{
    return this.uploadedPictures.filter(el => el !== null).length;
  }

  async addFileToList(file: File){
    let index = this.uploadedPictures.indexOf(null);
    this.uploadedPictures[index] = file;

    function delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    await delay(10);

    let imgElement: HTMLImageElement | null = <HTMLImageElement>document.getElementsByClassName("image-icon")[index].childNodes.item(0);
    if (imgElement){
      imgElement.src = URL.createObjectURL(file);
    }
    this.changeSubmitButtonStyle();
  }

  createUrl(file: File): string{
    return URL.createObjectURL(file);
  }

  removeFileFromList(file: File){
    let index = this.uploadedPictures.indexOf(file);
    this.uploadedPictures.splice(index, 1);
    this.uploadedPictures.push(null);
    this.changeSubmitButtonStyle();
  }

  manualValueChanged(value: number | null){
    this.startingPrice = 0;
    this.moneyAmountWarning_Show = false;
    if(value != null){
      value >= this.minMoneyAmountLimit ? this.startingPrice = value : this.moneyAmountWarning_Show = true;
    }        
    this.changeSubmitButtonStyle();
  }

  checkData(): boolean{
    if(this.articleTitle === "" || this.articleDescription === "" || this.startingPrice === 0 || !this.uploadedPictures.some((el) => el !== null) || !this.checkExpiryDate())
      return false;
    return true;
  }

  checkExpiryDate(): boolean{
    if(this.expiryDate == null || this.expiryTime == null) return false;
    this.expiryDateTime = {
      year: this.expiryDate?.year as number,
      month: this.expiryDate?.month as number,
      day: this.expiryDate?.day as number,
      hour: this.expiryTime?.hour as number,
      minute: this.expiryTime?.minute as number,
      second: this.expiryTime?.second as number,
    }
    const futureDate = new Date(this.expiryDateTime.year, this.expiryDateTime.month, this.expiryDateTime.day, this.expiryDateTime.hour, this.expiryDateTime.minute, this.expiryDateTime.second);
    const now = new Date();
    if(futureDate <= now) return false;
    return true;
  }

  changeSubmitButtonStyle(){
    if(this.checkData()){
      document.getElementsByClassName("submit-button")[0].classList.add("submit-button-active");
    }else{
      document.getElementsByClassName("submit-button")[0].classList.remove("submit-button-active");
    }
  }

  newExpiryDate(ev: MatDatepickerInputEvent<Date>){
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
      this.expiryDate = {
        year: Number(rawStringDate_decomposed[3]),
        month: _month,
        day: Number(rawStringDate_decomposed[2])
      }
    }
  }

  newExpiryTime(time: string){
    if(time == undefined || time == null) return;
    let hours : number, minutes : number;
    let time_decomposed = time.split(" ");
    let time_values = time_decomposed[0].split(":");
    hours = Number(time_values[0]);
    minutes = Number(time_values[1]);
    if(time_decomposed[1] == "PM" && hours != 12)
        hours += 12;
    else if(time_decomposed[1] == "AM" && hours == 12)
      hours = 0; 
    this.expiryTime = {
      hour: hours,
      minute: minutes,
      second: 0
    }
  }

  publishArticle(){
    if(!this.checkData()){
      this.snackbarService.spawnSnackbar(environment.article_data_upload.errorMessage_incompleteData, SnackbarType.Error)
      return;
    }
    let articleDto: ArticleDto = {
      title: this.articleTitle,
      description: this.articleDescription,
      startingPrice: this.startingPrice,
      expiryDate: this.expiryDateTime as CustomDateTime,
      pictures: []
    }
    articleDto.pictures = this.uploadedPictures.filter((el) => el !== null) as File[];
    this.store.dispatch(publishArticle({articleDto: articleDto}));
    this.store.select(selectPublishArticleError).subscribe((state) => {
      if(state){
        this.snackbarService.spawnSnackbar(environment.article_data_upload.errorMessage_publishArticleFailed, SnackbarType.Error);
      }else{
        this.snackbarService.spawnSnackbar(environment.article_data_upload.errorMessage_publishArticleSuccess, SnackbarType.Info);
        this.router.navigate(["/profile", this.userId]);
      }
    })
  }  

}
