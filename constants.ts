import {
  LayoutDashboard,
  Users,
  List,
  UserPlus,
  Settings,
  User,
  Lock,
  ShieldCheck,
  KeyRound,
  BarChart3,
  DollarSign,
  Activity,
  Cpu,
  RefreshCw,
  Zap,
  ShoppingBag,
  FlaskConical,
  Rocket,
  HardDrive,
  MoreHorizontal,
  Server,
  Database,
  Network,
  CloudDownload,
  Monitor,
  Smartphone,
  Terminal,
  Wrench,
  Package
} from 'lucide-react';
import { NavItem } from './types';

// Mock icons for deep nesting to avoid import errors if not strictly checked
const CheckCircle = ShieldCheck;
const Edit = User;

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    path: '/overview',
  },
  {
    id: 'update-service',
    label: 'Update Service',
    icon: CloudDownload,
    path: '/update-service',
    children: [
      {
        id: 'release-mgmt',
        label: 'Update Service Management',
        icon: Package,
        path: '/update-service/release'
      },
      {
        id: 'update-tools',
        label: 'App Client Management',
        icon: Wrench,
        path: '/update-service/tools'
      }
    ]
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/users',
    children: [
      { id: 'user-list', label: 'User List', icon: List, path: '/users/list' },
      { id: 'user-create', label: 'Create User', icon: UserPlus, path: '/users/create' },
      { 
        id: 'user-roles', 
        label: 'Role Management', 
        icon: ShieldCheck, 
        path: '/users/roles',
        children: [
             { id: 'role-admin', label: 'Administrators', icon: User, path: '/users/roles/admin' },
             { 
                 id: 'role-custom', 
                 label: 'Custom Roles', 
                 icon: Settings, 
                 path: '/users/roles/custom',
                 children: [
                     { id: 'role-c-1', label: 'Finance Viewer', icon: DollarSign, path: '/roles/c1' },
                     { 
                         id: 'role-c-2', 
                         label: 'Tech Lead', 
                         icon: Cpu, 
                         path: '/roles/c2',
                         children: [
                             { id: 'rl-deep-1', label: 'L5: Approval', icon: CheckCircle, path: '/deep/1' },
                             { id: 'rl-deep-2', label: 'L5: Edit', icon: Edit, path: '/deep/2' },
                         ]
                     },
                 ]
             }
        ]
      }
    ]
  },
  {
    id: 'settings',
    label: 'Admin Settings',
    icon: Settings,
    path: '/settings',
    children: [
      { id: 'profile', label: 'Profile', icon: User, path: '/settings/profile' },
      { 
        id: 'security', 
        label: 'Security', 
        icon: Lock, 
        path: '/settings/security',
        children: [
            { id: 'mfa', label: 'MFA Settings', icon: ShieldCheck, path: '/settings/profile/mfa' },
            { id: 'audit', label: 'Audit Logs', icon: List, path: '/settings/audit' },
        ]
      },
      {
          id: 'infra',
          label: 'Infrastructure',
          icon: Server,
          path: '/settings/infra',
          children: [
              { id: 'db-config', label: 'Database Config', icon: Database, path: '/settings/infra/db' },
              { id: 'net-config', label: 'Network Config', icon: Network, path: '/settings/infra/net' }
          ]
      }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    path: '/reports',
    children: [
      { id: 'sales', label: 'Sales Report', icon: DollarSign, path: '/reports/sales' },
      { id: 'activity', label: 'Activity Report', icon: Activity, path: '/reports/activity' },
    ]
  },
  {
    id: 'peripheral',
    label: 'Peripheral Mgmt',
    icon: Cpu,
    path: '/peripheral'
  },
  {
    id: 'spotlight',
    label: 'Spotlight',
    icon: Zap,
    path: '/spotlight'
  },
  {
    id: 'sales-mgmt',
    label: 'Sales Mgmt',
    icon: ShoppingBag,
    path: '/sales-mgmt'
  },
  {
    id: 'rd',
    label: 'R&D Dept',
    icon: FlaskConical,
    path: '/rd'
  },
  {
    id: 'deployment',
    label: 'Deployment',
    icon: Rocket,
    path: '/deployment'
  },
  {
    id: 'content',
    label: 'Content CMS',
    icon: HardDrive,
    path: '/content'
  },
];