import { FormControl } from "@angular/forms";
import { DataType } from "./cazzeon-form-builder/cazzeon-form-builder.service";

export abstract class CazzeonFormComponent {

    private _name: string;
    private _formName: string
    private _required: boolean
    private _dataType: DataType
    private _defaultValue?: string

    constructor(name: string, formName: string, required: boolean, dataType: DataType, defaultValue?: string) {
        this._name = name;
        this._formName = formName;
        this._required = required;
        this._dataType = dataType;
        this._defaultValue = defaultValue;
    }

    get name(): string {
        return this._name;
    }

    get formName(): string {
        return this._formName;
    }

    get required(): boolean {
        return this._required;
    }

    get dataType(): DataType {
        return this._dataType;
    }

    get defaultValue(): string | undefined {
        return this._defaultValue;
    }

    abstract buildFormControl: () => FormControl;

}
