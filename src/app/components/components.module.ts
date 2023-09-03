import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarElementComponent } from './navbarelement/navbarelement.component'
import { SidebarComponent } from './sidebar/sidebar.component'
import { TaskbarComponent } from './taskbar/taskbar.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IssueModalComponent } from './issue-modal/issue-modal.component';
import { DropdownButtonComponent } from './dropdown-button/dropdown-button.component';
import { SearchUserModalComponent } from './search-user-modal/search-user-modal.component';
import { JiraLoginModalComponent } from './jira-login-modal/jira-login-modal.component';
import { MainPageIndexComponent } from './main-page-index/main-page-index.component';
import { MageComponent } from './mage/mage.component';

@NgModule({
  declarations: [
    NavbarElementComponent,
    SidebarComponent,
    TaskbarComponent,
    IssueModalComponent,
    DropdownButtonComponent,
    SearchUserModalComponent,
    JiraLoginModalComponent,
    MainPageIndexComponent,
    MageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    NavbarElementComponent,
    SidebarComponent,
    TaskbarComponent,
    IssueModalComponent,
    DropdownButtonComponent,
    SearchUserModalComponent,
    JiraLoginModalComponent,
    MainPageIndexComponent,
    MageComponent,
  ]
})
export class ComponentsModule {

}
