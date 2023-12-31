import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from 'src/app/login-module/auth-service';
import { RowFormComponent } from '../row-form/row-form.component';
import { HttpMethod } from 'src/application-constants';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent implements OnInit, OnDestroy {

  @Input() formInput!: FormGroup<{}>;

  @Input() filter!: any;

  @Input() formName!: string;

  @Input() rowForm!: RowFormComponent;

  @Input() programmaticUpdate!: Subject<boolean>;

  private programmaticUpdateSubscription!: Subscription;

  private valueChangeObservable!: Observable<any>;

  private valueChangeSubscription!: Subscription;

  public resultSet: any[] = [];

  private lastOptionClicked: string = "";

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.valueChangeObservable = this.formInput.get(this.formName)!.valueChanges.pipe(debounceTime(1500), distinctUntilChanged());
    this.programmaticUpdateSubscription = this.programmaticUpdate.asObservable().subscribe(value => {
      if (!value) {
        // ENABLE
        this.valueChangeSubscription = this.valueChangeObservable.subscribe(value => {
          // Workaround to avoid fetch when clicking in a value 
          if (value?.name === this.lastOptionClicked) {
            return;
          }
          const url = `api/data/selector?entityFrom=${this.rowForm.viewComponent.mainTabEntityName}&hqlSelectorEntity=${this.filter.hqlProperty}&value=${value}`
          this.authService.fetchInformation(url, HttpMethod.GET, async (response: Response) => {
            this.resultSet = await response.json();
          }, async (response: Response) => {
            console.error(`Error while fetching data for the selector: ${this.rowForm.viewComponent.mainTabEntityName}. Error: ${await response.text()}`);
          }, (error: any) => {
            console.error(`Error while fetching data for the selector: ${this.rowForm.viewComponent.mainTabEntityName}. Timeout`);
          });
        });
      } else {
        // DISABLE
        this.valueChangeSubscription?.unsubscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.programmaticUpdateSubscription.unsubscribe();
    this.valueChangeSubscription?.unsubscribe();
  }

  showProperty(value: any) {
    return value?.name || "";
  }

  clickInOption(value: string): void {
    this.lastOptionClicked = value;
  }

}
