import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoachAllocationComponent } from './components/coach-allocation/coach-allocation.component';
import { DashbaordComponent } from './components/dashbaord/dashbaord.component';
import { EventManagementComponent } from './components/event-management/event-management.component';
import { InfrastructureManagementComponent } from './components/infrastructure-management/infrastructure-management.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { StakeholderManagementComponent } from './pages/stakeholder-management/stakeholder-management.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ViewallEventsComponent } from './components/event-management/viewall-events/viewall-events.component';
import { TempalteFormComponent } from './components/event-management/tempalte-form/tempalte-form.component';
import { PreviewTemplateComponent } from './components/event-management/template/preview-template1/preview-template.component';
import { PreiewTemplateHostComponent } from './components/event-management/template/preiew-template-host/preiew-template-host.component';
import { ManageRoleComponent } from './components/role-management/manage-role/manage-role.component';
import { AddVenueComponent } from './components/add-venue/add-venue.component';
import { VenueDetailsComponent } from './components/infrastructure-management/venue-details/venue-details.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { FinancialComponent } from './components/financial/financial.component';
import { ViewFinanceComponent } from './components/financial/view-finance/view-finance.component';
import { StakeholderTableComponent } from './components/stakeholder-management/stakeholder-table/stakeholder-table.component';
import { CoachProfileComponent } from './components/coach-allocation/coach-profile/coach-profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashbaordComponent, canActivate: [AuthGuard], data: { title: 'Dashboard',module:'dashboard' } },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { title: 'Setting' } },
  { path: 'stakeholder-management', component: StakeholderManagementComponent, canActivate: [AuthGuard], data: { title: 'Stakeholder Management' } },
  { path: 'stakeholder-management-details', component: StakeholderTableComponent, canActivate: [AuthGuard], data: { title: 'Stakeholder Management' } },
  { path: 'event-management', component: EventManagementComponent,canActivate: [AuthGuard], data: { title: 'Event Management' ,module: 'event_management'} },
  { path: 'preview-template', component: PreviewTemplateComponent,canActivate: [AuthGuard], data: { title: 'Preview Template' } },
  {
    path: 'preview-template/:id',
    component: PreiewTemplateHostComponent,
    canActivate: [AuthGuard],
    data: { title: 'Preview Template' },
  },
  {
    path: 'preview-template/:id/:identification',
    component: PreiewTemplateHostComponent,
    canActivate: [AuthGuard],
    data: { title: 'Preview Template' },
  },
  { path: 'template-form/:id/:identification', component: TempalteFormComponent,canActivate: [AuthGuard], data: { title: 'Template Form' } },
  { path: 'view-all-events', component: ViewallEventsComponent, canActivate: [AuthGuard],data: { title: 'All Events' } },
  { path: 'infrastructure-management', component: InfrastructureManagementComponent,canActivate: [AuthGuard], data: { title: 'Sports Infrastructure Management' } },
  { path: 'add-new-venue', component: AddVenueComponent,canActivate: [AuthGuard], data: { title: 'Add New Venue' } },
  { path: 'add-new-venue/:id', component: AddVenueComponent,canActivate: [AuthGuard], data: { title: 'Edit Venue' } },
  { path: 'venue-details/:id', component: VenueDetailsComponent,canActivate: [AuthGuard], data: { title: 'Venue Details' } },
  { path: 'user-management', component: UserManagementComponent,canActivate: [AuthGuard], data: { title: 'User Management', module: 'user_management'} },
  { path: 'role-management', component: RoleManagementComponent,canActivate: [AuthGuard], data: { title: 'Role Management' ,module: 'role_management'} },
  { path: 'manage-permission/:id', component: ManageRoleComponent,canActivate: [AuthGuard], data: { title: 'Manage Permission' } },
  { path: 'manage-permission/:id/:identification', component: ManageRoleComponent,canActivate: [AuthGuard], data: { title: 'Manage Permission' } },
  { path: 'coach-allocation', component: CoachAllocationComponent,canActivate: [AuthGuard], data: { title: 'Coach Allocation' } },
  { path: 'coach-profile/:id', component: CoachProfileComponent,canActivate: [AuthGuard], data: { title: 'Coach Allocation' } },
  { path: 'financial-assistance', component: FinancialComponent,canActivate: [AuthGuard], data: { title: 'Financial  Assistance' } },
  { path: 'financial-assistance-view/:id', component: ViewFinanceComponent, canActivate: [AuthGuard],data: { title: 'Financial Assistance' } },
  { path: 'stakeholder-profile/:id', component: ProfileComponent, canActivate: [AuthGuard],data: { title: 'Stakeholder Profile' } },
  { path: '**', redirectTo: 'errors/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
