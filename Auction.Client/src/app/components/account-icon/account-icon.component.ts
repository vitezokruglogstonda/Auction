import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { environment } from '../../../environments/environment';
import { selectAccountImagePath } from '../../store/app/app.selector';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-account-icon',
  templateUrl: './account-icon.component.html',
  styleUrl: './account-icon.component.css'
})
export class AccountIconComponent {

  public iconPath : String;  
  public tooltipText: String;
  private showCard: boolean;  
  @Output() emitter: EventEmitter<boolean>;
  @Input() foreignEvent: Subject<number> | null;

  constructor(private store: Store<AppState>) {
    this.iconPath = environment.account_icon_basic_URL;
    this.tooltipText = environment.account_icon_tooltip_text;
    this.showCard = false;
    this.emitter = new EventEmitter<boolean>();
    this.foreignEvent = null;
  }

  ngOnInit(): void {
    this.store.select(selectAccountImagePath).subscribe((state) => {
      this.iconPath = state;
    });

    this.foreignEvent?.subscribe(()=>{
      this.toggleCard();
    })
  }

  toggleCard(){
    this.showCard = !this.showCard;
    this.emitter.emit(this.showCard);
  }

}
