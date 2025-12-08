import { LucideIcon } from "lucide-react";

export enum AppTheme {
  LIGHT = 'light',
  DARK = 'dark',
  DRACULA = 'dracula'
}

export enum LayoutMode {
  SIDEBAR = 'sidebar',
  HEADER = 'header'
}

export enum SidebarStyle {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed' // Icon only
}

// New Enums for Advanced Config
export enum SidebarExpansionMode {
  ACCORDION = 'accordion', // Push content down
  FLYOUT = 'flyout',       // Float to right
  HYBRID = 'hybrid'        // L0 Accordion, L1+ Flyout (Configurable depth)
}

export enum OverflowMode {
  SCROLL = 'scroll', // Native scrollbar
  MORE = 'more'      // "More" button
}

export enum HeaderDropdownMode {
  CASCADING = 'cascading', // Standard nested dropdowns
  MEGA = 'mega'            // All children in one big box
}

export interface NavConfig {
  // Sidebar Configs
  sidebarExpansionMode: SidebarExpansionMode;
  sidebarFlyoutTriggerDepth: number; // 0=All Flyout, 1=L0 Accordion then Flyout, 99=All Accordion
  sidebarOverflowMode: OverflowMode;
  sidebarVisibleCount: number; // For 'more' mode

  // Header Configs
  headerDropdownMode: HeaderDropdownMode;
  headerOverflowMode: OverflowMode;
  headerVisibleCount: number; // For 'more' mode
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  children?: NavItem[];
}

export interface DeviceData {
  id: string;
  name: string;
  os: string;
  model: string;
  sn: string;
  agentVer: string;
  lastConnect: string;
  status: 'connected' | 'disconnected' | 'inactive';
}
