import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { NAV_ITEMS } from '../constants';
import { 
  LayoutMode, 
  SidebarStyle, 
  AppTheme, 
  NavItem, 
  SidebarExpansionMode, 
  OverflowMode, 
  HeaderDropdownMode 
} from '../types';
import { ChevronDown, ChevronRight, X, Command, MoreHorizontal } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { 
    theme, 
    layoutMode, 
    sidebarStyle, 
    setSidebarStyle,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    navConfig
  } = useApp();

  const [expandedItems, setExpandedItems] = useState<string[]>(['users', 'settings']);
  const [activeId, setActiveId] = useState<string>('overview');

  // --- Helpers ---
  const getNavColors = () => {
    switch(theme) {
      case AppTheme.DRACULA: return 'bg-[#282a36] text-gray-300 border-[#44475a]';
      case AppTheme.LIGHT: return 'bg-white text-slate-700 border-gray-200 shadow-sm';
      case AppTheme.DARK: default: return 'bg-slate-900 text-gray-400 border-slate-800';
    }
  };

  const getDropdownColors = () => {
    switch(theme) {
      case AppTheme.DRACULA: return 'bg-[#282a36] border-[#44475a] text-gray-300 shadow-xl shadow-black/50';
      case AppTheme.LIGHT: return 'bg-white border-gray-200 text-slate-700 shadow-xl shadow-slate-200/50';
      case AppTheme.DARK: default: return 'bg-slate-900 border-slate-700 text-gray-300 shadow-xl shadow-black/50';
    }
  };

  const getHoverColors = () => {
    switch(theme) {
      case AppTheme.DRACULA: return 'hover:bg-[#44475a] hover:text-[#bd93f9]';
      case AppTheme.LIGHT: return 'hover:bg-blue-50 hover:text-blue-600';
      case AppTheme.DARK: default: return 'hover:bg-slate-800 hover:text-white';
    }
  };
  
  const getActiveColors = () => {
     switch(theme) {
      case AppTheme.DRACULA: return 'text-[#bd93f9] bg-[#44475a]/50';
      case AppTheme.LIGHT: return 'text-blue-600 bg-blue-50';
      case AppTheme.DARK: default: return 'text-blue-400 bg-slate-800';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleLinkClick = (item: NavItem) => {
    if (!item.children || item.children.length === 0) {
      setActiveId(item.id);
      if (layoutMode === LayoutMode.SIDEBAR && window.innerWidth < 1024) setIsMobileMenuOpen(false);
    }
  };

  // ==========================================
  // SHARED COMPONENTS
  // ==========================================

  const LogoArea = () => (
    <div className={`h-16 flex items-center px-4 transition-all duration-300 shrink-0 ${sidebarStyle === SidebarStyle.COLLAPSED && layoutMode === LayoutMode.SIDEBAR ? 'justify-center' : 'justify-between'}`}>
      <div className="flex items-center gap-2 overflow-hidden">
        <div className={`p-1.5 rounded-lg shrink-0 ${theme === AppTheme.LIGHT ? 'bg-blue-600' : 'bg-blue-500'}`}>
          <Command size={20} className="text-white" />
        </div>
        {!(sidebarStyle === SidebarStyle.COLLAPSED && layoutMode === LayoutMode.SIDEBAR) && (
          <span className={`font-bold text-lg whitespace-nowrap ${theme === AppTheme.LIGHT ? 'text-slate-800' : 'text-white'}`}>CloudOps</span>
        )}
      </div>
      {layoutMode === LayoutMode.SIDEBAR && sidebarStyle !== SidebarStyle.COLLAPSED && (
         <button onClick={() => setSidebarStyle(SidebarStyle.COLLAPSED)} className="lg:hidden"><X size={20} /></button>
      )}
    </div>
  );

  // ==========================================
  // HEADER IMPLEMENTATION
  // ==========================================

  // Mega Menu Item (Grid Layout)
  const HeaderMegaMenu = ({ items }: { items: NavItem[] }) => {
    return (
      <div className={`
          absolute top-full left-0 mt-1 p-6
          grid grid-cols-3 gap-6 w-[800px]
          rounded-md border z-50
          invisible opacity-0 group-hover:visible group-hover:opacity-100
          transition-all duration-200 ease-out
          ${getDropdownColors()}
      `}>
          {items.map(colRoot => (
            <div key={colRoot.id}>
               <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme === AppTheme.LIGHT ? 'text-slate-900' : 'text-white'}`}>
                  <colRoot.icon size={16} />
                  {colRoot.label}
               </h4>
               <ul className="space-y-2">
                 {colRoot.children?.map(child => (
                   <li key={child.id}>
                     <button 
                        onClick={() => handleLinkClick(child)}
                        className={`text-sm opacity-80 hover:opacity-100 hover:underline block w-full text-left`}
                     >
                       {child.label}
                     </button>
                   </li>
                 ))}
                 {!colRoot.children && <li className="text-xs opacity-50 italic">No sub-items</li>}
               </ul>
            </div>
          ))}
      </div>
    );
  };

  const HeaderCascadingMenu = ({ items, depth }: { items: NavItem[], depth: number }) => {
      const isRoot = depth === 0;
      return (
        <ul className={`
            absolute z-50 min-w-[220px] rounded-md border py-1
            invisible opacity-0 group-hover:visible group-hover:opacity-100 
            transition-all duration-200 ease-out origin-top-left
            ${isRoot ? 'top-full left-0 mt-1' : 'top-0 left-full ml-0'}
            ${getDropdownColors()}
        `}>
            {items.map(item => <HeaderItem key={item.id} item={item} depth={depth + 1} />)}
        </ul>
      );
  };

  const HeaderItem = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isRoot = depth === 0;
    const isActive = activeId === item.id;

    // Decide dropdown type
    const useMegaMenu = navConfig.headerDropdownMode === HeaderDropdownMode.MEGA && isRoot && hasChildren;
    
    return (
        <li className={`relative group list-none ${isRoot ? 'h-full flex items-center' : ''}`}>
            <button
                onClick={() => handleLinkClick(item)}
                className={`
                    flex items-center justify-between gap-2 whitespace-nowrap transition-colors
                    ${isRoot ? 'px-4 py-2 rounded-md text-sm font-medium' : 'w-full px-4 py-3 text-sm'}
                    ${getHoverColors()}
                    ${isActive && !hasChildren ? getActiveColors() : ''}
                `}
            >
                <div className="flex items-center gap-2">
                    {(!isRoot || item.icon) && (
                         <item.icon size={18} className={isRoot ? '' : 'opacity-70 scale-90'} />
                    )}
                    <span>{item.label}</span>
                </div>
                {hasChildren && (
                    isRoot
                        ? <ChevronDown size={14} className="opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                        : <ChevronRight size={14} className="opacity-70" />
                )}
            </button>

            {hasChildren && (
                useMegaMenu 
                ? <HeaderMegaMenu items={item.children!} />
                : <HeaderCascadingMenu items={item.children!} depth={depth} />
            )}
        </li>
    );
  };

  const HeaderLayout = () => {
      let itemsToRender = NAV_ITEMS;
      let moreItems: NavItem[] = [];

      // Logic for "More" vs "Scroll"
      if (navConfig.headerOverflowMode === OverflowMode.MORE) {
          itemsToRender = NAV_ITEMS.slice(0, navConfig.headerVisibleCount);
          moreItems = NAV_ITEMS.slice(navConfig.headerVisibleCount);
      }

      return (
        <nav className={`w-full h-16 border-b flex items-center px-4 gap-6 z-40 relative ${getNavColors()}`}>
            <LogoArea />
            <ul className={`flex-1 flex items-center gap-1 h-full ${navConfig.headerOverflowMode === OverflowMode.SCROLL ? 'overflow-x-auto no-scrollbar' : ''}`}>
                {itemsToRender.map(item => <HeaderItem key={item.id} item={item} />)}
                
                {moreItems.length > 0 && (
                    <HeaderItem 
                        item={{
                            id: 'more-menu',
                            label: 'More',
                            icon: MoreHorizontal,
                            path: '#',
                            children: moreItems
                        }} 
                        depth={0} 
                    />
                )}
            </ul>
        </nav>
      );
  }

  // ==========================================
  // SIDEBAR IMPLEMENTATION
  // ==========================================

  // Helper for Fixed Flyout
  const FlyoutContainer = ({ items, depth, parentRect }: { items: NavItem[], depth: number, parentRect: DOMRect }) => {
      // Calculate top position. If it goes off screen bottom, shift up.
      // Basic implementation: Align top.
      const style: React.CSSProperties = {
          top: parentRect.top,
          left: parentRect.right,
          position: 'fixed',
          zIndex: 9999,
      };

      return (
          <div style={style} className={`ml-2 min-w-[200px] rounded-md border py-1 shadow-xl ${getDropdownColors()}`}>
              {/* Invisible bridge to allow mouse travel */}
               <div className="absolute -left-2 top-0 w-4 h-full bg-transparent" />
              {items.map(item => <SidebarItem key={item.id} item={item} depth={depth} isFlyoutContext={true} />)}
          </div>
      );
  };

  const SidebarItem = ({ item, depth = 0, isFlyoutContext = false }: { item: NavItem; depth?: number; isFlyoutContext?: boolean }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeId === item.id;
    const isCollapsed = sidebarStyle === SidebarStyle.COLLAPSED;

    // DETERMINE BEHAVIOR
    // 1. If we are already in a flyout context, children MUST be flyouts (infinite nesting right).
    // 2. If Sidebar is collapsed, Root items are buttons that trigger Flyout.
    // 3. Otherwise, check config. 
    
    let useFlyout = false;

    if (isFlyoutContext) {
        useFlyout = true;
    } else if (isCollapsed && depth === 0) {
        useFlyout = true;
    } else {
        // Check Hybrid Config
        // e.g. Trigger Depth = 1. Level 0 is Accordion. Level 1+ is Flyout.
        if (navConfig.sidebarExpansionMode === SidebarExpansionMode.FLYOUT) {
            useFlyout = true;
        } else if (navConfig.sidebarExpansionMode === SidebarExpansionMode.HYBRID) {
            useFlyout = depth >= navConfig.sidebarFlyoutTriggerDepth;
        } else {
            useFlyout = false; // All Accordion
        }
    }
    
    const [isHovered, setIsHovered] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (!hasChildren) return;
        if (useFlyout) {
            setRect(e.currentTarget.getBoundingClientRect());
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (useFlyout) setIsHovered(false);
    };

    const handleClick = () => {
        if (hasChildren && !useFlyout) {
            toggleExpand(item.id);
        } else {
            handleLinkClick(item);
        }
    };

    const paddingLeft = (isCollapsed || isFlyoutContext) ? '1rem' : `${(depth * 1) + 1}rem`;

    return (
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={handleClick}
          className={`
            w-full flex items-center gap-3 py-2.5 
            text-sm font-medium transition-all duration-200
            ${isCollapsed && !isFlyoutContext ? 'justify-center px-2' : 'px-4'}
            ${getHoverColors()}
            ${isActive && !hasChildren ? getActiveColors() : ''}
            ${!isFlyoutContext && isActive && !isCollapsed ? `border-r-4 ${theme === AppTheme.DRACULA ? 'border-[#bd93f9]' : 'border-blue-500'}` : 'border-r-4 border-transparent'}
          `}
          style={{ paddingLeft: (isCollapsed && !isFlyoutContext) ? undefined : paddingLeft }}
          title={isCollapsed ? item.label : undefined}
        >
          <div className={`flex items-center gap-3 w-full ${(isCollapsed && !isFlyoutContext) ? 'justify-center' : ''}`}>
             <item.icon size={(isCollapsed && !isFlyoutContext) ? 22 : 18} className="shrink-0" />
             
             {/* Text Label */}
             {(!isCollapsed || isFlyoutContext) && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {hasChildren && (
                    <span className="opacity-50">
                      {useFlyout ? <ChevronRight size={14} /> : (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                    </span>
                  )}
                </>
             )}
          </div>
        </button>

        {/* ACCORDION RENDER */}
        {!useFlyout && hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => (
              <SidebarItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}

        {/* FLYOUT RENDER (Fixed Portal-ish Strategy) */}
        {useFlyout && hasChildren && isHovered && rect && (
             <FlyoutContainer items={item.children!} depth={depth + 1} parentRect={rect} />
        )}
      </div>
    );
  };

  const SidebarLayout = () => {
    let itemsToRender = NAV_ITEMS;
    let moreItems: NavItem[] = [];

    const isScrollMode = navConfig.sidebarOverflowMode === OverflowMode.SCROLL;
    const isCollapsed = sidebarStyle === SidebarStyle.COLLAPSED;

    if (!isScrollMode && !isCollapsed) {
        itemsToRender = NAV_ITEMS.slice(0, navConfig.sidebarVisibleCount);
        moreItems = NAV_ITEMS.slice(navConfig.sidebarVisibleCount);
    }

    return (
      <aside 
        className={`
          flex flex-col h-screen sticky top-0 border-r transition-all duration-300 z-40
          ${getNavColors()}
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 w-64 shadow-2xl' : 'hidden lg:flex'}
        `}
      >
        <LogoArea />
        
        <div className={`flex-1 py-4 custom-scrollbar ${isScrollMode ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          <nav className="space-y-1 px-0">
             {itemsToRender.map(item => (
               <SidebarItem key={item.id} item={item} />
             ))}

             {/* Sidebar "More" Button Logic (Accordion-ish) */}
             {moreItems.length > 0 && (
                <SidebarItem 
                    item={{
                        id: 'sidebar-more',
                        label: 'More Items',
                        icon: MoreHorizontal,
                        path: '#',
                        children: moreItems
                    }} 
                    depth={0}
                />
             )}
          </nav>
        </div>

        <div className={`p-4 border-t ${theme === AppTheme.DRACULA ? 'border-[#44475a]' : 'border-gray-700/20'}`}>
           <button 
              onClick={() => setSidebarStyle(isCollapsed ? SidebarStyle.EXPANDED : SidebarStyle.COLLAPSED)}
              className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${getHoverColors()}`}
           >
              {isCollapsed ? <ChevronRight size={20}/> : <div className="flex items-center gap-2"><ChevronDown size={20} className="rotate-90" /></div>}
           </button>
        </div>
      </aside>
    );
  };

  if (layoutMode === LayoutMode.HEADER) {
      return <HeaderLayout />;
  }
  return <SidebarLayout />;
};
