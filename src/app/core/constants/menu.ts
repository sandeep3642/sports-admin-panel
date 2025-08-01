import { MenuItem } from '../models/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/dashboardico.svg',
          label: 'Dashboard',
          route: '/dashboard/dashboard',
        },
        {
          icon: 'assets/icons/user-managementico.svg',
          label: 'User Management',
          route: '/dashboard/user-management',
        
        },
        {
          icon: 'assets/icons/rolemanagementico.svg',
          label: 'Role Management ',
          route: '/dashboard/role-management',
        },
        {
          icon: 'assets/icons/stakeholderico.svg',
          label: 'Stakeholder Management',
          route: '/dashboard/stakeholder-management',
        },

        {
          icon: 'assets/icons/eventico.svg',
          label: 'Event Management',
          route: '/dashboard/event-management',
        },

        {
          icon: 'assets/icons/sportsinfra-icons.svg',
          label: 'Sports Infrastructure Management',
          route: '/dashboard/infrastructure-management',
        },
        {
          icon: 'assets/icons/coachallocation-ico.svg',
          label: 'Coach Allocation',
          route: '/dashboard/coach-allocation',
        },
       

      ],
    },
  ];
}
