import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { NavbarElementComponent } from './navbarelement/navbarelement.component'
import { SidebarComponent } from './sidebar/sidebar.component'
import { TaskbarComponent } from './taskbar/taskbar.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IssueModalComponent } from './issue-modal/issue-modal.component';
import { DropdownButtonComponent } from './dropdown-button/dropdown-button.component';
import { SearchUserModalComponent } from './search-user-modal/search-user-modal.component';
import { LoginModalComponent } from './login-modal/login-modal.component';


@NgModule({
  declarations: [
    NavbarComponent, 
    NavbarElementComponent, 
    SidebarComponent,
    TaskbarComponent,
    IssueModalComponent,
    DropdownButtonComponent,
    SearchUserModalComponent,
    LoginModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    NavbarComponent,
    NavbarElementComponent,
    SidebarComponent,
    TaskbarComponent,
    IssueModalComponent,
    DropdownButtonComponent,
    SearchUserModalComponent,
    LoginModalComponent,
  ]
})
export class ComponentsModule { 
  
}
