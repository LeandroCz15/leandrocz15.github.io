import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { CazzeonFormComponent } from '../cazzeon-form-component/cazzeon-form-component';
import { DataType } from '../cazzeon-form-builder/cazzeon-form-builder.service';

class DateErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

const CURRENT_DATE = "CURRENT_DATE";

/**
 * Date format of the application. This object serves for displaying the date in the date pickers of angualar material
 */
export const CAZZEON_DATE_FORMAT = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CAZZEON_DATE_FORMAT }
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatInputModule,
  ]
})
export class DatePickerComponent {

  /********************** COMPONENT ATTRIBUTES **********************/
  public matcher: DateErrorMatcher = new DateErrorMatcher();

  /********************** INPUTS **********************/
  @Input() formGroup!: FormGroup;
  @Input() formControl!: FormControl;

}

export class DatePickerFormComponent extends CazzeonFormComponent {

  constructor(name: string, formName: string, required: boolean, defaultValue?: string) {
    super(name, formName, required, DataType.DATE, defaultValue);
  }

  override buildFormControl = () => {
    return new FormControl(this.defaultValue === CURRENT_DATE ? new Date() : undefined, this.required ? Validators.required : undefined);
  };

}
