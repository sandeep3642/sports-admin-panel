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

const routes: Routes = [
  { path: '', redirectTo: 'stakeholder-management', pathMatch: 'full' },
  { path: 'dashboard', component: DashbaordComponent, data: { title: 'Dashboard' } },
  { path: 'settings', component: SettingsComponent, data: { title: 'Setting' } },
  { path: 'stakeholder-management', component: StakeholderManagementComponent, data: { title: 'Stakeholder Management' } },
  { path: 'event-management', component: EventManagementComponent, data: { title: 'Event Management' } },
  { path: 'preview-template', component: PreviewTemplateComponent, data: { title: 'Preview Template' } },
  {
    path: 'preview-template/:id',
    component: PreiewTemplateHostComponent,
    data: { title: 'Preview Template' },
  },
  {
    path: 'preview-template/:id/:identification',
    component: PreiewTemplateHostComponent,
    data: { title: 'Preview Template' },
  },
  { path: 'template-form/:id/:identification', component: TempalteFormComponent, data: { title: 'Template Form' } },
  { path: 'view-all-events', component: ViewallEventsComponent, data: { title: 'All Events' } },
  { path: 'infrastructure-management', component: InfrastructureManagementComponent, data: { title: 'Sports Infrastructure Management' } },
  { path: 'add-new-venue', component: AddVenueComponent, data: { title: 'Add New Venue' } },
  { path: 'add-new-venue/:id', component: AddVenueComponent, data: { title: 'Edit Venue', showBackInNavbar: true } },
  { path: 'venue-details/:id', component: VenueDetailsComponent, data: { title: 'Venue Details' } },
  { path: 'user-management', component: UserManagementComponent, data: { title: 'User Management' } },
  { path: 'role-management', component: RoleManagementComponent, data: { title: 'Role Management' } },
  { path: 'manage-permission/:id', component: ManageRoleComponent, data: { title: 'Manage Permission' } },
  { path: 'manage-permission/:id/:identification', component: ManageRoleComponent, data: { title: 'Manage Permission' } },
  { path: 'coach-allocation', component: CoachAllocationComponent, data: { title: 'Coach Allocation' } },
  { path: 'profile/:id', component: ProfileComponent, data: { title: 'Profile' } },
  { path: '**', redirectTo: 'errors/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
