import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { CazzeonFormComponent } from '../cazzeon-form-component';
import { DataType } from '../cazzeon-form-builder/cazzeon-form-builder.service';

const DECIMAL_NUMBER_PATTERN = /^[1-9]\d*(\.\d{1,2})?$/;

@Component({
  selector: 'app-decimal',
  templateUrl: './decimal.component.html',
  styleUrls: ['./decimal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DecimalComponent),
      multi: true
    }
  ]
})
export class DecimalComponent implements ControlValueAccessor {

  /********************** INPUTS **********************/
  @Input() formGroup!: FormGroup;
  @Input() formControl!: FormControl;

  writeValue(obj: any): void { }

  registerOnChange(fn: any): void { }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void { }

}

export class DecimalFormComponent extends CazzeonFormComponent {

  constructor(name: string, formName: string, required: boolean) {
    super(name, formName, required, DataType.DECIMAL);
  }

  override buildFormControl = () => {
    return this.required
    ? new FormControl(this.defaultValue ? +this.defaultValue : undefined, [Validators.required, Validators.pattern(DECIMAL_NUMBER_PATTERN)])
    : new FormControl(this.defaultValue ? +this.defaultValue : undefined, Validators.pattern(DECIMAL_NUMBER_PATTERN));
  };
  
}
