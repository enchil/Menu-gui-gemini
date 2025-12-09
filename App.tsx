import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Navigation } from './components/Navigation';
import { TopBar } from './components/TopBar';
import { DataTable } from './components/DataTable';
import { AgentHub } from './components/AgentHub';
import { AppClientList } from './components/AppClientList'; // Import the new component
import { AppTheme, LayoutMode } from './types';

const MainLayout: React.FC = () => {
  const { theme, layoutMode, activePath } = useApp();

  // Root Background Strategy
  const getRootBackground = () => {
    switch(theme) {
      case AppTheme.DRACULA:
        return 'bg-[#21222c] text-[#f8f8f2]'; // Darker than card bg
      case AppTheme.LIGHT:
        return 'bg-gray-50 text-slate-900';
      case AppTheme.DARK:
      default:
        return 'bg-[#0f172a] text-slate-100'; // Slate-950/900 mix
    }
  };

  // Simple Router
  const renderContent = () => {
    if (activePath === '/update-service/tools') {
        return <AppClientList />;
    }
    if (activePath.startsWith('/update-service')) {
      return <AgentHub />;
    }
    // Default to Dashboard/Overview
    return <DataTable />;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans antialiased ${getRootBackground()} flex ${layoutMode === LayoutMode.SIDEBAR ? 'flex-row' : 'flex-col'}`}>
      
      {/* Navigation (Sidebar or Header) */}
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Bar (Breadcrumbs, etc) */}
        <TopBar />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto w-full">
                {renderContent()}
            </div>
        </main>

      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;