import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-row-form',
  templateUrl: './row-form.component.html',
  styleUrls: ['./row-form.component.css']
})
export class RowFormComponent implements OnInit, OnDestroy, AfterViewInit {

  // Modal of the view
  private modalElement!: Element;

  // Service to send data to a modal when clicking in a row. HEREDATED FROM PARENT
  @Input() openRowFormSubject!: Subject<any>;
  private openRowFormSubscription!: Subscription;

  ngOnInit(): void {
    this.openRowFormSubscription = this.openRowFormSubject.asObservable().subscribe(row => this.updateModal(row));
  }

  ngOnDestroy(): void {
    this.openRowFormSubscription.unsubscribe();
  }

  // Set modal element reference
  ngAfterViewInit(): void {
    this.modalElement = document.getElementById("rowModal") as Element;
  }

  // Show modal
  updateModal(row: any) {
    bootstrap.Modal.getOrCreateInstance(this.modalElement).show();
  }

}
