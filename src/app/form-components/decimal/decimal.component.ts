import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { CazzeonFormComponent } from '../cazzeon-form-component';
import { DataType } from '../cazzeon-form-builder/cazzeon-form-builder.service';

const DECIMAL_NUMBER_PATTERN = /^-?\d+(\.\d{1,2})?$/;

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

  private _minimum: number | undefined;
  private _maximum: number | undefined;

  constructor(name: string, formName: string, required: boolean, defaultValue?: string, minimum?: number, maximum?: number) {
    super(name, formName, required, DataType.DECIMAL, defaultValue);
    this._minimum = minimum;
    this._maximum = maximum;
  }

  get minimum(): number | undefined {
    return this._minimum;
  }

  get maximum(): number | undefined {
    return this._maximum;
  }

  override buildFormControl = () => {
    const validators = [Validators.pattern(DECIMAL_NUMBER_PATTERN)];
    if (this.minimum) {
      validators.push(Validators.min(this.minimum));
    }
    if (this.maximum) {
      validators.push(Validators.max(this.maximum));
    }
    if (this.required) {
      validators.push(Validators.required);
    }
    return new FormControl(this.defaultValue ? +this.defaultValue : undefined, validators);
  };

}
