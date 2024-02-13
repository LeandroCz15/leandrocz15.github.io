import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent {
  constructor(
    private dialogRef: MatDialogRef<TabComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log("ASD");
  }
}