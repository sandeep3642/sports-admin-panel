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
import { AddVenueComponent } from './components/add-venue/add-venue.component';
import { VenueDetailsComponent } from './components/infrastructure-management/venue-details/venue-details.component';

const routes: Routes = [
  { path: '', redirectTo: 'stakeholder-management', pathMatch: 'full' },
  { path: 'dashboard', component: DashbaordComponent },
  { path: 'stakeholder-management', component: StakeholderManagementComponent },
  { path: 'event-management', component: EventManagementComponent },
  { path: 'preview-template', component: PreviewTemplateComponent },
  {
    path: 'preview-template/:id',
    component: PreiewTemplateHostComponent,
  },
  {
    path: 'preview-template/:id/:identification',
    component: PreiewTemplateHostComponent,
  },
  { path: 'template-form/:id/:identification', component: TempalteFormComponent },
  { path: 'view-all-events', component: ViewallEventsComponent }, // <-- Add this line
  { path: 'infrastructure-management', component: InfrastructureManagementComponent },
  { path: 'add-new-venue', component: AddVenueComponent },
  { path: 'add-new-venue/:id', component: AddVenueComponent },
  { path: 'venue-details/:id', component: VenueDetailsComponent },
  { path: 'user-management', component: UserManagementComponent },
  { path: 'role-management', component: RoleManagementComponent },
  { path: 'coach-allocation', component: CoachAllocationComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: '**', redirectTo: 'errors/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
