import { MenuItem } from '../models/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: '',
      separator: false,
      items: [
        {
          icon: 'assets/icons/dashboardico.svg',
          label: 'Dashboard',
          route: '/dashboard/dashboard',
          module: 'dashboard'
        },
        {
          icon: 'assets/icons/user-managementico.svg',
          label: 'User Management',
          route: '/dashboard/user-management',
          module: 'user_management'
        },
        {
          icon: 'assets/icons/rolemanagementico.svg',
          label: 'Role Management ',
          route: '/dashboard/role-management',
          module: 'role_management'
        },
        {
          icon: 'assets/icons/stakeholderico.svg',
          label: 'Stakeholder Management',
          route: '/dashboard/stakeholder-management',
          module: 'customer_management'  // or stakeholder_management if backend sends that
        },
        {
          icon: 'assets/icons/eventico.svg',
          label: 'Event Management',
          route: '/dashboard/event-management',
          module: 'event_management'
        },
        {
          icon: 'assets/icons/sportsinfra-icons.svg',
          label: 'Sports Infrastructure Management',
          route: '/dashboard/infrastructure-management',
          module: 'venue_management'
        },
        {
          icon: 'assets/icons/coachallocation-ico.svg',
          label: 'Coach Allocation',
          route: '/dashboard/coach-allocation',
          module: 'coach_allocation' // depends on backend naming
        }
      ],
    },
  ];
  
}
