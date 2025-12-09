import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { NAV_ITEMS } from '../constants';
import { NavItem } from '../types';
import { 
  AppTheme, 
  LayoutMode, 
  SidebarExpansionMode, 
  OverflowMode, 
  HeaderDropdownMode 
} from '../types';
import { 
  Menu, 
  Sun, 
  Moon, 
  Monitor, 
  LayoutTemplate,
  Sidebar as SidebarIcon,
  Settings2,
  X,
  ChevronRight
} from 'lucide-react';

// Helper to find the breadcrumb path recursively
const findBreadcrumbPath = (items: NavItem[], targetPath: string): NavItem[] => {
  for (const item of items) {
    if (item.path === targetPath) {
      return [item];
    }
    if (item.children) {
      const childPath = findBreadcrumbPath(item.children, targetPath);
      if (childPath.length > 0) {
        return [item, ...childPath];
      }
    }
  }
  return [];
};

export const TopBar: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    layoutMode, 
    setLayoutMode, 
    setIsMobileMenuOpen,
    navConfig,
    setNavConfig,
    activePath
  } = useApp();

  const [showConfig, setShowConfig] = useState(false);

  // Calculate breadcrumbs based on activePath
  const breadcrumbs = useMemo(() => {
    const path = findBreadcrumbPath(NAV_ITEMS, activePath);
    // Fallback if path not found (e.g. initial load or unknown route)
    if (path.length === 0 && activePath === '/overview') {
        const overview = NAV_ITEMS.find(i => i.id === 'overview');
        return overview ? [overview] : [];
    }
    return path;
  }, [activePath]);

  const getThemeStyles = () => {
    switch(theme) {
      case AppTheme.DRACULA:
        return {
          bar: 'bg-[#282a36] border-b border-[#44475a] text-gray-200',
          input: 'bg-[#44475a] text-white placeholder-gray-400 border-none focus:ring-[#bd93f9]',
          icon: 'text-[#bd93f9] hover:bg-[#44475a]',
          panel: 'bg-[#282a36] border-[#44475a] text-gray-200',
          crumbActive: 'text-[#bd93f9]',
          crumbInactive: 'text-gray-400 hover:text-[#f8f8f2]'
        };
      case AppTheme.LIGHT:
        return {
          bar: 'bg-white border-b border-gray-200 text-slate-800',
          input: 'bg-gray-100 text-slate-800 placeholder-slate-500 border-transparent focus:bg-white focus:ring-blue-500 focus:border-blue-500',
          icon: 'text-slate-500 hover:bg-gray-100 hover:text-blue-600',
          panel: 'bg-white border-gray-200 text-slate-800',
          crumbActive: 'text-blue-600',
          crumbInactive: 'text-slate-500 hover:text-slate-800'
        };
      case AppTheme.DARK:
      default:
        return {
          bar: 'bg-slate-900 border-b border-slate-800 text-gray-200',
          input: 'bg-slate-800 text-gray-200 placeholder-slate-500 border-transparent focus:ring-blue-500',
          icon: 'text-gray-400 hover:bg-slate-800 hover:text-white',
          panel: 'bg-slate-900 border-slate-700 text-gray-200',
          crumbActive: 'text-blue-400',
          crumbInactive: 'text-gray-400 hover:text-gray-200'
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <header className={`h-16 flex items-center justify-between px-6 transition-colors duration-300 z-30 relative ${styles.bar}`}>
      
      <div className="flex items-center gap-4 flex-1">
        {layoutMode === LayoutMode.SIDEBAR && (
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-md ${styles.icon}`}
            >
                <Menu size={20} />
            </button>
        )}
        
        {/* Dynamic Breadcrumb Area */}
        <nav className="hidden md:flex items-center text-sm font-medium">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={item.id} className="flex items-center">
                {index > 0 && (
                   <ChevronRight size={14} className="mx-2 opacity-40" />
                )}
                <span 
                    className={`
                        transition-colors 
                        ${isLast ? `font-bold ${styles.crumbActive}` : `opacity-70 ${styles.crumbInactive}`}
                    `}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Actions (Search Removed) */}
      <div className="flex items-center gap-2">
        
        {/* Config Toggle */}
        <button 
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-full transition-colors ${styles.icon} ${showConfig ? 'bg-opacity-20 bg-blue-500' : ''}`}
            title="Menu Settings"
        >
            <Settings2 size={18} />
        </button>

        {/* Layout Switcher */}
        <div className="hidden md:flex bg-opacity-10 rounded-lg p-1 mr-2 border border-transparent hover:border-current opacity-70 hover:opacity-100 transition-all">
            <button 
                onClick={() => setLayoutMode(LayoutMode.SIDEBAR)}
                className={`p-1.5 rounded ${layoutMode === LayoutMode.SIDEBAR ? 'bg-current text-current bg-opacity-20' : ''}`}
            >
                <SidebarIcon size={16} />
            </button>
            <button 
                onClick={() => setLayoutMode(LayoutMode.HEADER)}
                className={`p-1.5 rounded ${layoutMode === LayoutMode.HEADER ? 'bg-current text-current bg-opacity-20' : ''}`}
            >
                <LayoutTemplate size={16} />
            </button>
        </div>

        {/* Theme Toggles */}
        <button onClick={() => setTheme(AppTheme.LIGHT)} className={`p-2 rounded-full ${styles.icon} ${theme === AppTheme.LIGHT ? 'bg-opacity-20 bg-blue-500' : ''}`}><Sun size={18} /></button>
        <button onClick={() => setTheme(AppTheme.DARK)} className={`p-2 rounded-full ${styles.icon} ${theme === AppTheme.DARK ? 'bg-opacity-20 bg-blue-500' : ''}`}><Moon size={18} /></button>
        <button onClick={() => setTheme(AppTheme.DRACULA)} className={`p-2 rounded-full ${styles.icon} ${theme === AppTheme.DRACULA ? 'bg-opacity-20 bg-purple-500' : ''}`}><Monitor size={18} /></button>
      </div>

      {/* Configuration Panel (Absolute) */}
      {showConfig && (
          <div className={`absolute top-16 right-4 w-80 p-4 rounded-lg shadow-xl border z-50 ${styles.panel}`}>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Menu Configuration</h3>
                  <button onClick={() => setShowConfig(false)}><X size={16}/></button>
              </div>
              
              <div className="space-y-4 text-sm">
                  {layoutMode === LayoutMode.SIDEBAR ? (
                    <>
                        <div>
                            <label className="block opacity-70 mb-1">Sidebar Expansion</label>
                            <select 
                                value={navConfig.sidebarExpansionMode}
                                onChange={(e) => setNavConfig(prev => ({...prev, sidebarExpansionMode: e.target.value as any}))}
                                className={`w-full p-2 rounded bg-opacity-20 bg-black border border-gray-600`}
                            >
                                <option value={SidebarExpansionMode.ACCORDION}>All Accordion (Down)</option>
                                <option value={SidebarExpansionMode.FLYOUT}>All Flyout (Right)</option>
                                <option value={SidebarExpansionMode.HYBRID}>Hybrid (Mix)</option>
                            </select>
                        </div>
                        {navConfig.sidebarExpansionMode === SidebarExpansionMode.HYBRID && (
                            <div>
                                <label className="block opacity-70 mb-1">Flyout Trigger Depth</label>
                                <input 
                                    type="range" min="0" max="3" 
                                    value={navConfig.sidebarFlyoutTriggerDepth}
                                    onChange={(e) => setNavConfig(prev => ({...prev, sidebarFlyoutTriggerDepth: parseInt(e.target.value)}))}
                                    className="w-full"
                                />
                                <div className="text-xs opacity-50 flex justify-between">
                                    <span>L0 (All Fly)</span>
                                    <span>L1</span>
                                    <span>L2</span>
                                    <span>L3</span>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block opacity-70 mb-1">Overflow Handling</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setNavConfig(prev => ({...prev, sidebarOverflowMode: OverflowMode.SCROLL}))}
                                    className={`flex-1 p-2 rounded border ${navConfig.sidebarOverflowMode === OverflowMode.SCROLL ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-600'}`}
                                >Scroll</button>
                                <button 
                                    onClick={() => setNavConfig(prev => ({...prev, sidebarOverflowMode: OverflowMode.MORE}))}
                                    className={`flex-1 p-2 rounded border ${navConfig.sidebarOverflowMode === OverflowMode.MORE ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-600'}`}
                                >More Btn</button>
                            </div>
                        </div>
                    </>
                  ) : (
                    <>
                        <div>
                             <label className="block opacity-70 mb-1">Dropdown Style</label>
                             <select 
                                 value={navConfig.headerDropdownMode}
                                 onChange={(e) => setNavConfig(prev => ({...prev, headerDropdownMode: e.target.value as any}))}
                                 className={`w-full p-2 rounded bg-opacity-20 bg-black border border-gray-600`}
                             >
                                 <option value={HeaderDropdownMode.CASCADING}>Cascading (Standard)</option>
                                 <option value={HeaderDropdownMode.MEGA}>Mega Menu (Grid)</option>
                             </select>
                        </div>
                        <div>
                            <label className="block opacity-70 mb-1">Overflow Handling</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setNavConfig(prev => ({...prev, headerOverflowMode: OverflowMode.SCROLL}))}
                                    className={`flex-1 p-2 rounded border ${navConfig.headerOverflowMode === OverflowMode.SCROLL ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-600'}`}
                                >Scroll</button>
                                <button 
                                    onClick={() => setNavConfig(prev => ({...prev, headerOverflowMode: OverflowMode.MORE}))}
                                    className={`flex-1 p-2 rounded border ${navConfig.headerOverflowMode === OverflowMode.MORE ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-600'}`}
                                >More Btn</button>
                            </div>
                        </div>
                    </>
                  )}
              </div>
          </div>
      )}
    </header>
  );
};
