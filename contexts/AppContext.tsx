import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AppTheme, 
  LayoutMode, 
  SidebarStyle, 
  NavConfig, 
  SidebarExpansionMode, 
  OverflowMode, 
  HeaderDropdownMode 
} from '../types';

interface AppContextProps {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  sidebarStyle: SidebarStyle;
  setSidebarStyle: (style: SidebarStyle) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  navConfig: NavConfig;
  setNavConfig: (config: NavConfig | ((prev: NavConfig) => NavConfig)) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(AppTheme.DARK);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(LayoutMode.SIDEBAR);
  const [sidebarStyle, setSidebarStyle] = useState<SidebarStyle>(SidebarStyle.EXPANDED);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Default Advanced Configuration
  const [navConfig, setNavConfig] = useState<NavConfig>({
    // Sidebar Defaults
    sidebarExpansionMode: SidebarExpansionMode.HYBRID,
    sidebarFlyoutTriggerDepth: 1, // Level 0 expands down, Level 1+ flies right
    sidebarOverflowMode: OverflowMode.SCROLL,
    sidebarVisibleCount: 8,

    // Header Defaults
    headerDropdownMode: HeaderDropdownMode.CASCADING,
    headerOverflowMode: OverflowMode.MORE,
    headerVisibleCount: 6,
  });

  // Close mobile menu on resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        layoutMode,
        setLayoutMode,
        sidebarStyle,
        setSidebarStyle,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        navConfig,
        setNavConfig
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
