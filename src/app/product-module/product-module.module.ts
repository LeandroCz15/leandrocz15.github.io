import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from './product-card/product-card.component';
import { ProductViewComponent } from './product-view/product-view.component';
import { ProductModalComponent } from './product-modal/product-modal.component';
import { Credentials } from '../login-module/credentials';

@NgModule({
  declarations: [
    ProductCardComponent,
    ProductViewComponent,
    ProductModalComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ProductCardComponent,
    ProductViewComponent,
    ProductModalComponent,
  ],
  providers: [
    Credentials,
  ]
})
export class ProductModule { }
