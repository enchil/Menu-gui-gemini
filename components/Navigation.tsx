import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { ChevronDown, ChevronRight, X, Command, MoreHorizontal, Circle } from 'lucide-react';

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

  // --- MEGA MENU (Recursive Tree) ---
  const MegaMenuNode: React.FC<{ item: NavItem, depth: number }> = ({ item, depth }) => {
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div className="mb-1">
        <button 
          onClick={() => handleLinkClick(item)}
          className={`
            text-sm block w-full text-left transition-colors flex items-center gap-2
            ${depth === 0 ? 'font-semibold mb-2 ' + (theme === AppTheme.LIGHT ? 'text-slate-900' : 'text-white') : 'opacity-80 hover:opacity-100 hover:underline py-1'}
          `}
          style={{ paddingLeft: depth > 0 ? `${depth * 12}px` : 0 }}
        >
          {depth === 0 && <item.icon size={16} />}
          {depth > 0 && <span className="opacity-30">•</span>}
          <span>{item.label}</span>
        </button>
        {hasChildren && (
          <div className="ml-0">
            {item.children!.map(child => (
              <MegaMenuNode key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const HeaderMegaMenuPortal = ({ items, parentRect }: { items: NavItem[], parentRect: DOMRect }) => {
      // Mega Menu spans widely. We position it aligned to the left of the parent, but max-width constrained.
      const style: React.CSSProperties = {
          top: parentRect.bottom + 4,
          left: Math.max(20, parentRect.left - 200), // Shift left slightly to center-ish or align
          position: 'fixed',
          zIndex: 9999,
          maxHeight: '80vh',
          overflowY: 'auto'
      };

      return createPortal(
          <div 
             style={style} 
             className={`
                p-6 grid grid-cols-3 gap-8 w-[900px] max-w-[95vw]
                rounded-md border shadow-2xl
                animate-in fade-in zoom-in-95 duration-100
                ${getDropdownColors()}
             `}
             onMouseEnter={() => { /* Keep open logic handled by parent state usually, but Portal requires careful mouse tracking */ }}
          >
             {items.map(colRoot => (
                <div key={colRoot.id}>
                    <MegaMenuNode item={colRoot} depth={0} />
                </div>
             ))}
          </div>,
          document.body
      );
  };


  // --- CASCADING MENU (Portal Based) ---
  const CascadingMenuPortal = ({ items, depth, parentRect, onClose }: { items: NavItem[], depth: number, parentRect: DOMRect, onClose: () => void }) => {
      const isRoot = depth === 0;
      
      // Position Logic
      // Root: Top = Bottom of Parent, Left = Left of Parent
      // Nested: Top = Top of Parent, Left = Right of Parent
      
      const top = isRoot ? parentRect.bottom + 2 : parentRect.top;
      const left = isRoot ? parentRect.left : parentRect.right - 4; // -4 overlap for safety

      // Fix off-screen logic (Basic)
      const screenW = window.innerWidth;
      const width = 220;
      const finalLeft = (left + width > screenW) ? (parentRect.left - width) : left;

      const style: React.CSSProperties = {
          top: top,
          left: finalLeft,
          position: 'fixed',
          zIndex: 9999 + depth,
      };

      return createPortal(
        <ul 
          style={style}
          className={`
            min-w-[220px] rounded-md border py-1 shadow-xl
            animate-in fade-in zoom-in-95 duration-75
            ${getDropdownColors()}
          `}
          onMouseLeave={onClose} // Basic close trigger, usually handled by parent Hover but Portals break nesting
        >
            {/* Safe Bridge for Diagonal Movement */}
            {!isRoot && (
                <div 
                    className="absolute -left-4 top-0 w-4 h-full bg-transparent"
                    style={{ left: left === finalLeft ? '-10px' : '100%' }} // Adjust based on side
                />
            )}

            {items.map(item => (
                <HeaderItemPortalWrapper key={item.id} item={item} depth={depth + 1} />
            ))}
        </ul>,
        document.body
      );
  };

  // Wrapper to handle Hover state for Portal generation
  const HeaderItemPortalWrapper: React.FC<{ item: NavItem, depth: number }> = ({ item, depth }) => {
      const [isHovered, setIsHovered] = useState(false);
      const [rect, setRect] = useState<DOMRect | null>(null);
      const ref = useRef<HTMLLIElement>(null);
      const hasChildren = item.children && item.children.length > 0;
      const isActive = activeId === item.id;
      
      const handleEnter = (e: React.MouseEvent) => {
          if(ref.current) {
              setRect(ref.current.getBoundingClientRect());
          }
          setIsHovered(true);
      };

      const handleLeave = () => {
          setIsHovered(false);
      };

      return (
          <li 
            ref={ref}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            className="relative list-none"
          >
              <button
                onClick={() => handleLinkClick(item)}
                className={`
                    w-full flex items-center justify-between px-4 py-2.5 text-sm
                    ${getHoverColors()}
                    ${isActive && !hasChildren ? getActiveColors() : ''}
                `}
              >
                  <div className="flex items-center gap-2">
                    {/* Only show icon for deeper levels if needed, or keep clean */}
                    {depth === 1 && item.icon && <item.icon size={16} className="opacity-70" />} 
                    <span>{item.label}</span>
                  </div>
                  {hasChildren && <ChevronRight size={14} className="opacity-50" />}
              </button>

              {hasChildren && isHovered && rect && (
                  <CascadingMenuPortal 
                    items={item.children!} 
                    depth={depth} 
                    parentRect={rect} 
                    onClose={() => setIsHovered(false)}
                  />
              )}
          </li>
      )
  };


  const HeaderItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const ref = useRef<HTMLLIElement>(null);
    
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeId === item.id;

    // Config Check
    const useMegaMenu = navConfig.headerDropdownMode === HeaderDropdownMode.MEGA && hasChildren;

    const handleMouseEnter = () => {
        if(ref.current) setRect(ref.current.getBoundingClientRect());
        setIsHovered(true);
    };

    return (
        <li 
            ref={ref}
            className={`relative h-full flex items-center`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={() => handleLinkClick(item)}
                className={`
                    flex items-center justify-between gap-2 whitespace-nowrap transition-colors
                    px-4 py-2 rounded-md text-sm font-medium
                    ${getHoverColors()}
                    ${isActive && !hasChildren ? getActiveColors() : ''}
                `}
            >
                <div className="flex items-center gap-2">
                     <item.icon size={18} />
                     <span>{item.label}</span>
                </div>
                {hasChildren && (
                    <ChevronDown size={14} className={`opacity-70 transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`} />
                )}
            </button>

            {/* DROPDOWN CONTENT (Portal) */}
            {hasChildren && isHovered && rect && (
                useMegaMenu 
                ? <HeaderMegaMenuPortal items={item.children!} parentRect={rect} />
                : <CascadingMenuPortal items={item.children!} depth={0} parentRect={rect} onClose={() => setIsHovered(false)} />
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
      // Calculate top position.
      const style: React.CSSProperties = {
          top: parentRect.top,
          left: parentRect.right,
          position: 'fixed',
          zIndex: 9999,
      };

      return createPortal(
          <div style={style} className={`ml-2 min-w-[200px] rounded-md border py-1 shadow-xl ${getDropdownColors()}`}>
              {/* Invisible bridge to allow mouse travel */}
               <div className="absolute -left-4 top-0 w-6 h-full bg-transparent" />
              {items.map(item => <SidebarItem key={item.id} item={item} depth={depth} isFlyoutContext={true} />)}
          </div>,
          document.body
      );
  };

  const SidebarItem: React.FC<{ item: NavItem; depth?: number; isFlyoutContext?: boolean }> = ({ item, depth = 0, isFlyoutContext = false }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeId === item.id;
    const isCollapsed = sidebarStyle === SidebarStyle.COLLAPSED;

    let useFlyout = false;

    if (isFlyoutContext) {
        useFlyout = true;
    } else if (isCollapsed && depth === 0) {
        useFlyout = true;
    } else {
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