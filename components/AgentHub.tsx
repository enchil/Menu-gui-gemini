import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { AppTheme } from '../types';
import { 
  CloudDownload, 
  Search, 
  Monitor, 
  Smartphone, 
  Terminal, 
  Upload,
  FileBox,
  Trash2,
  Wrench,
  Download,
  Filter,
  Package,
  Layers,
  X,
  Check,
  Plus,
  ArrowRight,
  Rocket,
  Globe,
  Zap,
  Beaker,
  AlertTriangle,
  FileText,
  Cpu,
  Info,
  Eye,
  PenTool,
  Key,
  List,
  User,
  History,
  Clock,
  Save,
  Edit3,
  Calendar,
  Archive,
  Ban,
  Radio,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Hash,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  FileBadge,
  Link as LinkIcon,
  Building2,
  Lock,
  FileCode,
  HelpCircle,
  ChevronDown,
  Fingerprint
} from 'lucide-react';

// --- Types ---
type ProductType = 'Agent' | 'OTA Img' | 'Tool' | 'Library';
type PlatformType = 'Android' | 'Windows' | 'Linux';
type ArchType = 'x86' | 'x86_64' | 'arm' | 'arm64';
type ReleaseChannel = 'Production' | 'Test' | 'Beta' | 'Experimental';
type ReleaseTarget = 'Spotlight Download Page' | 'Automation Update Service';

interface ActivityLog {
    id: string;
    user: string;
    action: string;
    timestamp: string;
}

interface ReleasePackage {
  id: string;
  product: ProductType;
  platform: PlatformType;
  series: string;
  arch: ArchType[];
  supportOS: string[]; // Stores names of supported OS
  version: string;
  filename: string;
  size: string;
  uploadedAt: string;
  uploader: string;
  status: 'active' | 'deprecated'; // explicit status
  channels: ReleaseChannel[]; // New: Active channels
  targets: ReleaseTarget[];   // New: Where it is released
  scope?: 'Generic' | 'Customized';
  customers?: string[];
  identityKey?: string;
  description: string;
  releaseNotes: string;
  dependencies: { major: string, minor: string, patch: string, isStandalone: boolean };
  activityLog: ActivityLog[];
}

// Mock Data
const MOCK_RELEASES: ReleasePackage[] = [
  { 
    id: '1', product: 'Agent', platform: 'Android', series: 'FT-GMS', arch: ['x86_64'], 
    supportOS: ['Android 13', 'Android 12', 'AuraOS 5', 'FT GMS 12'], version: '2.5.0', filename: 'agent-ft-gms-x64-v2.5.apk', 
    size: '24 MB', uploadedAt: '2025-10-20', uploader: 'admin@corp.com', status: 'active', identityKey: 'KEY-8829-X',
    channels: ['Production'], targets: ['Automation Update Service', 'Spotlight Download Page'],
    scope: 'Generic', customers: [],
    description: 'Main production agent for GMS devices.',
    releaseNotes: '# v2.5.0\n- Initial GMS support\n- Fixed Wifi bug',
    dependencies: { major: '2', minor: '1', patch: '0', isStandalone: false },
    activityLog: [
        { id: 'a1', user: 'admin@corp.com', action: 'Uploaded package', timestamp: '2025-10-20 14:30' },
        { id: 'a2', user: 'system', action: 'Virus scan passed', timestamp: '2025-10-20 14:32' },
        { id: 'a3', user: 'admin@corp.com', action: 'Deployed to Production', timestamp: '2025-10-21 09:00' }
    ]
  },
  { 
    id: '2', product: 'Agent', platform: 'Windows', series: 'Windows', arch: ['x86_64'], 
    supportOS: ['Win 10 IoT', 'Win 11', 'Modern Kiosk'], version: '10.0.19044', filename: 'agent_win_x64.zip', 
    size: '1.2 GB', uploadedAt: '2025-10-18', uploader: 'devops@corp.com', status: 'active',
    channels: ['Beta'], targets: ['Automation Update Service'],
    scope: 'Customized', customers: ['RetailCorp'],
    description: 'Windows IoT Core agent runtime.',
    releaseNotes: '# v10.0\n- Win 11 compat layer',
    dependencies: { major: '', minor: '', patch: '', isStandalone: true },
    activityLog: [
        { id: 'a1', user: 'devops@corp.com', action: 'Uploaded package', timestamp: '2025-10-18 09:00' }
    ]
  },
  { 
    id: '3', product: 'Tool', platform: 'Linux', series: 'Universal', arch: ['x86_64'], 
    supportOS: ['Ubuntu 22.04', 'Debian 11'], version: '1.0.5', filename: 'log-collector-linux.sh', 
    size: '15 KB', uploadedAt: '2025-09-05', uploader: 'support@corp.com', status: 'deprecated',
    channels: [], targets: [],
    scope: 'Generic', customers: [],
    description: 'Debug script for log retrieval.',
    releaseNotes: 'Fixed permission issue.',
    dependencies: { major: '', minor: '', patch: '', isStandalone: true },
    activityLog: [
        { id: 'a1', user: 'support@corp.com', action: 'Uploaded package', timestamp: '2025-09-05 11:20' },
        { id: 'a2', user: 'admin@corp.com', action: 'Marked as Deprecated', timestamp: '2025-10-01 10:00' }
    ]
  },
  { 
    id: '4', product: 'OTA Img', platform: 'Android', series: 'Aura', arch: ['arm64'], 
    supportOS: ['AuraOS 6'], version: '6.0.0-rc1', filename: 'aura_os_6_rc1.zip', 
    size: '850 MB', uploadedAt: '2025-11-01', uploader: 'qa@corp.com', status: 'active',
    channels: [], targets: [], // Not Released yet
    scope: 'Customized', customers: ['FastFood Chain A'],
    description: 'Release Candidate for AuraOS 6',
    releaseNotes: 'RC1 Build.',
    dependencies: { major: '', minor: '', patch: '', isStandalone: true },
    activityLog: [
        { id: 'a1', user: 'qa@corp.com', action: 'Uploaded package', timestamp: '2025-11-01 10:00' }
    ]
  },
];

interface OSTarget {
  id: string;
  name: string;
  osVer: string;
  code: string;
  platform: string; 
  series: string[];
  arch: string[];
}

const MOCK_TARGETS: OSTarget[] = [
    { id: 't1', name: 'AuraOS 5', osVer: 'Android 12', code: 'AuraOS_5/12/x64', platform: 'Android', series: ['Aura', 'FT-GMS'], arch: ['x86_64'] },
    { id: 't2', name: 'AuraOS 6', osVer: 'Android 13', code: 'AuraOS_6/13/x64', platform: 'Android', series: ['Aura'], arch: ['x86_64'] },
    { id: 't3', name: 'Legacy POS', osVer: 'Win 10 IoT', code: 'Win10_IoT/1809/x64', platform: 'Windows', series: ['Windows', 'Universal'], arch: ['x86_64'] },
    { id: 't4', name: 'Kiosk V2', osVer: 'Android 11', code: 'AuraOS_K/11/arm', platform: 'Android', series: ['Aura'], arch: ['arm', 'arm64'] },
    { id: 't5', name: 'Signage Pro', osVer: 'Ubuntu 22.04', code: 'Lin_Ubu/22/x64', platform: 'Linux', series: ['Universal'], arch: ['x86_64'] },
    { id: 't6', name: 'FT GMS 11', osVer: 'Android 11', code: 'FT_GMS/11/x64', platform: 'Android', series: ['FT-GMS'], arch: ['x86_64'] },
    { id: 't7', name: 'FT GMS 12', osVer: 'Android 12', code: 'FT_GMS/12/x64', platform: 'Android', series: ['FT-GMS'], arch: ['x86_64'] },
    { id: 't8', name: 'TD GMS 11', osVer: 'Android 11', code: 'TD_GMS/11/x86', platform: 'Android', series: ['TD-GMS'], arch: ['x86'] },
    { id: 't9', name: 'Modern Kiosk', osVer: 'Win 11', code: 'Win11/22H2/x64', platform: 'Windows', series: ['Windows', 'Universal'], arch: ['x86_64'] },
    { id: 't10', name: 'Embedded Box', osVer: 'Debian 11', code: 'Deb_11/arm64', platform: 'Linux', series: ['Universal'], arch: ['arm64'] },
    { id: 't11', name: 'Generic Android', osVer: 'Android 10+', code: 'Gen_A/x64', platform: 'Android', series: ['Universal', 'FT-AOSP'], arch: ['x86_64'] },
    { id: 't12', name: 'Legacy 32-bit', osVer: 'Win 10', code: 'Win10/x86', platform: 'Windows', series: ['Windows', 'Universal'], arch: ['x86'] },
    { id: 't13', name: 'Android 13', osVer: 'Android 13', code: 'AOSP/13/x64', platform: 'Android', series: ['FT-GMS', 'Universal'], arch: ['x86_64'] },
    { id: 't14', name: 'Android 12', osVer: 'Android 12', code: 'AOSP/12/x64', platform: 'Android', series: ['FT-GMS', 'Universal'], arch: ['x86_64'] },
];

const FILTER_OPTIONS = {
  products: ['Agent', 'OTA Img', 'Tool', 'Library'],
  platforms: ['Android', 'Windows', 'Linux'],
  archs: ['x86', 'x86_64', 'arm', 'arm64'],
};

const MOCK_CUSTOMERS = [
    'RetailCorp', 
    'FastFood Chain A', 
    'Bank of Innovation', 
    'Gov Dept',
    'TechGiant Inc', 
    'Logistics Co', 
    'Healthcare Plus', 
    'EduSystem K12', 
    'Smart City Grid', 
    'Transport Authority', 
    'Global Shipping', 
    'Energy Provider X'
];

const CHANNEL_DESCRIPTIONS: Record<ReleaseChannel, string> = {
    'Production': 'Stable release for all end-users. Requires Spotlight target to be active.',
    'Test': 'Internal QA and automated testing environments. Frequent updates allowed.',
    'Beta': 'Early access for opted-in partners. Subject to limited availability.',
    'Experimental': 'Unstable builds for internal development validation only.'
};

const TARGET_DESCRIPTIONS: Record<ReleaseTarget, string> = {
    'Spotlight Download Page': 'Public-facing portal. Enabling this strictly binds the release to the "Production" channel.',
    'Automation Update Service': 'OTA backend for connected devices. Can support multiple channels (Test, Beta, etc.).'
};

// --- Logic Helpers ---

// Platform Rule: OTA Img -> Android only.
const getPlatformsForProduct = (product: string): string[] => {
    if (product === 'OTA Img') return ['Android'];
    return ['Android', 'Windows', 'Linux'];
};

const getSeriesForPlatform = (platform: string, product: string): string[] => {
    if (product === 'Agent' && platform === 'Windows') return ['Windows'];
    switch (platform) {
        case 'Android': return ['Universal', 'Aura', 'FT-AOSP', 'FT-GMS', 'TD-GMS'];
        case 'Windows': return ['Universal'];
        case 'Linux': return ['Universal'];
        default: return ['Universal'];
    }
};

const getArchsForConfig = (platform: string, series: string, isCustomSeries: boolean): string[] => {
    if (isCustomSeries) {
        if (platform === 'Windows') return ['x86', 'x86_64'];
        if (platform === 'Linux') return ['x86', 'x86_64', 'arm', 'arm64'];
        if (platform === 'Android') return ['x86', 'x86_64', 'arm', 'arm64'];
        return ['x86', 'x86_64'];
    }
    if (platform === 'Windows') return ['x86', 'x86_64'];
    if (platform === 'Linux') return ['x86', 'x86_64', 'arm', 'arm64'];
    if (platform === 'Android') {
        if (series === 'Universal') return ['x86', 'x86_64'];
        if (series === 'Aura') return ['arm'];
        if (['FT-AOSP', 'FT-GMS', 'TD-GMS'].includes(series)) return ['x86', 'x86_64'];
    }
    return ['x86', 'x86_64'];
};


export const AgentHub: React.FC = () => {
  const { theme } = useApp();
  
  // UI States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false); 
  const [isStatusOpen, setIsStatusOpen] = useState(false); // Status/Delete Modal
  const [selectedPackage, setSelectedPackage] = useState<ReleasePackage | null>(null);

  // Force Update to refresh table when modals change data
  const [_, setTick] = useState(0);
  const handleRefresh = () => setTick(t => t + 1);

  // Filter States
  const [filterProduct, setFilterProduct] = useState<string>('All');
  const [filterPlatform, setFilterPlatform] = useState<string>('All');

  // Styles
  const getStyles = () => {
    switch(theme) {
      case AppTheme.DRACULA:
        return {
          card: 'bg-[#282a36] border-[#44475a] shadow-lg',
          textMain: 'text-[#f8f8f2]',
          textSub: 'text-[#6272a4]',
          header: 'bg-[#44475a] text-[#bd93f9]',
          row: 'hover:bg-[#44475a]/50 border-b border-[#44475a] cursor-pointer',
          input: 'bg-[#44475a] text-white border-[#6272a4]',
          buttonPrimary: 'bg-[#bd93f9] text-[#282a36] hover:bg-[#ff79c6]',
          badge: 'bg-[#44475a] text-[#8be9fd] border border-[#6272a4]',
          modalOverlay: 'bg-[#282a36]/90',
          modalBg: 'bg-[#282a36] border-[#bd93f9]',
          stepActive: 'bg-[#bd93f9] text-[#282a36]',
          stepInactive: 'bg-[#44475a] text-[#6272a4]',
          inputGroup: 'bg-[#44475a] border-[#6272a4] text-white',
          tabActive: 'border-b-2 border-[#bd93f9] text-[#bd93f9]',
          tabInactive: 'text-[#6272a4] hover:text-[#f8f8f2]'
        };
      case AppTheme.LIGHT:
        return {
          card: 'bg-white border-gray-200 shadow-sm',
          textMain: 'text-slate-800',
          textSub: 'text-slate-500',
          header: 'bg-gray-50 text-slate-700 font-semibold',
          row: 'hover:bg-blue-50 border-b border-gray-100 cursor-pointer',
          input: 'bg-white border-gray-300 text-slate-800',
          buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-700',
          badge: 'bg-blue-50 text-blue-700 border border-blue-200',
          modalOverlay: 'bg-slate-900/50',
          modalBg: 'bg-white border-blue-500',
          stepActive: 'bg-blue-600 text-white',
          stepInactive: 'bg-white border-2 border-gray-200 text-gray-400',
          inputGroup: 'bg-white border-gray-300 text-slate-800',
          tabActive: 'border-b-2 border-blue-600 text-blue-600',
          tabInactive: 'text-slate-500 hover:text-slate-700'
        };
      case AppTheme.DARK:
      default:
        return {
          card: 'bg-slate-800 border-slate-700 shadow-md',
          textMain: 'text-gray-200',
          textSub: 'text-gray-400',
          header: 'bg-slate-900/50 text-gray-300 font-semibold',
          row: 'hover:bg-slate-700 border-b border-slate-700/50 cursor-pointer',
          input: 'bg-slate-900 border-slate-600 text-gray-200',
          buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-500',
          badge: 'bg-slate-700 text-blue-400 border border-slate-600',
          modalOverlay: 'bg-slate-900/80',
          modalBg: 'bg-slate-800 border-slate-600',
          stepActive: 'bg-blue-500 text-white',
          stepInactive: 'bg-slate-800 border-2 border-slate-600 text-gray-500',
          inputGroup: 'bg-slate-900 border-slate-600 text-gray-200',
          tabActive: 'border-b-2 border-blue-500 text-blue-400',
          tabInactive: 'text-gray-400 hover:text-gray-300'
        };
    }
  };

  const styles = getStyles();

  // Helper for Badges
  const Badge: React.FC<{ children: React.ReactNode, colorClass?: string }> = ({ children, colorClass }) => (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colorClass || styles.badge}`}>
      {children}
    </span>
  );

  // Searchable Select Component for large customer lists
  const SearchableSelect: React.FC<{
      options: string[];
      value: string;
      onChange: (val: string) => void;
      placeholder?: string;
  }> = ({ options, value, onChange, placeholder = "Select..." }) => {
      const [isOpen, setIsOpen] = useState(false);
      const [search, setSearch] = useState('');
      const wrapperRef = useRef<HTMLDivElement>(null);

      const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

      useEffect(() => {
          function handleClickOutside(event: MouseEvent) {
              if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                  setIsOpen(false);
              }
          }
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      return (
          <div ref={wrapperRef} className="relative w-full">
              <div 
                  onClick={() => setIsOpen(!isOpen)} 
                  className={`w-full p-4 rounded-lg border text-lg flex justify-between items-center cursor-pointer ${styles.input} ${!value ? 'opacity-70' : ''}`}
              >
                  <span>{value || placeholder}</span>
                  <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isOpen && (
                  <div className={`absolute top-full left-0 w-full mt-2 rounded-lg border shadow-xl max-h-60 overflow-hidden flex flex-col z-50 ${theme === AppTheme.LIGHT ? 'bg-white border-blue-200' : 'bg-[#21222c] border-[#44475a]'}`}>
                      <div className="p-2 border-b border-inherit">
                          <div className="relative">
                              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                              <input 
                                  autoFocus
                                  type="text" 
                                  placeholder="Filter customers..." 
                                  className={`w-full pl-9 p-2 rounded text-sm bg-transparent border border-transparent focus:border-blue-500 focus:outline-none ${styles.textMain}`}
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                              />
                          </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                          {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                              <div 
                                  key={opt} 
                                  onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                                  className={`px-4 py-2.5 rounded cursor-pointer text-sm hover:bg-blue-500 hover:text-white transition-colors ${value === opt ? 'bg-blue-500/10 text-blue-500 font-bold' : styles.textMain}`}
                              >
                                  {opt}
                              </div>
                          )) : (
                              <div className="p-4 text-center text-sm opacity-50">No results found.</div>
                          )}
                      </div>
                  </div>
              )}
          </div>
      );
  };

  // ... (StatusManagementModal and DetailEditModal kept as is) ...
  const StatusManagementModal = () => {
    if (!selectedPackage) return null;
    const [confirmAction, setConfirmAction] = useState<'revert' | 'deprecate' | null>(null);

    const executeAction = () => {
        if (!confirmAction) return;
        const idx = MOCK_RELEASES.findIndex(r => r.id === selectedPackage.id);
        if (idx !== -1) {
            if (confirmAction === 'deprecate') {
                MOCK_RELEASES[idx].status = 'deprecated';
            } else if (confirmAction === 'revert') {
                MOCK_RELEASES[idx].status = 'active';
                MOCK_RELEASES[idx].channels = [];
                MOCK_RELEASES[idx].targets = [];
            }
        }
        setIsStatusOpen(false);
        setSelectedPackage(null);
        handleRefresh();
    };

    const getConfirmConfig = () => {
        switch(confirmAction) {
            case 'revert': return { icon: RotateCcw, color: 'text-gray-400', title: 'Revert to Not Released', desc: 'This will remove the package from all channels and targets. It will no longer be available for download.' };
            case 'deprecate': return { icon: Ban, color: 'text-amber-500', title: 'Deprecate File', desc: 'This will mark the release as obsolete. Existing users may still have it, but new downloads will be discouraged.' };
            default: return { icon: Info, color: 'text-white', title: '', desc: '' };
        }
    }
    const config = getConfirmConfig();

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${styles.modalOverlay}`}>
            <div className={`w-full max-w-md rounded-xl shadow-2xl border p-6 flex flex-col ${styles.modalBg}`}>
                {confirmAction ? (
                     <div className="space-y-6 animate-in zoom-in-95 duration-200">
                         <div className="flex flex-col items-center text-center">
                             <div className={`p-4 rounded-full bg-opacity-10 mb-4 ${config.color.replace('text-', 'bg-')}`}>
                                 <config.icon size={48} className={config.color} />
                             </div>
                             <h3 className={`text-xl font-bold ${styles.textMain}`}>Are you sure?</h3>
                             <p className={`text-sm ${styles.textSub} mt-2`}>{config.desc}</p>
                             
                             {/* Warning if actively released */}
                             {confirmAction === 'deprecate' && selectedPackage.targets.length > 0 && (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 text-xs text-amber-500 mt-2 flex items-start gap-2 text-left">
                                    <AlertTriangle size={16} className="shrink-0 mt-0.5"/>
                                    <div>
                                        <strong>Warning:</strong> This file is currently live on <strong>{selectedPackage.targets.length} targets</strong>. Deprecating it may affect active deployments.
                                    </div>
                                </div>
                             )}
                         </div>
                         <div className="flex gap-3 mt-4">
                             <button onClick={() => setConfirmAction(null)} className={`flex-1 py-3 rounded-lg font-medium border border-inherit ${styles.textSub} hover:bg-white/5`}>Cancel</button>
                             <button onClick={executeAction} className={`flex-1 py-3 rounded-lg font-bold text-white shadow-lg ${confirmAction === 'deprecate' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-600 hover:bg-gray-500'}`}>
                                 Yes, {config.title.split(' ')[0]}
                             </button>
                         </div>
                     </div>
                ) : (
                    <>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
                                <Archive size={24} />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold ${styles.textMain}`}>Manage Release Status</h3>
                                <p className={`text-sm ${styles.textSub} mt-1`}>
                                    Action for: <span className="font-mono font-bold">{selectedPackage.filename}</span>
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-6">
                            <button onClick={() => setConfirmAction('revert')} className={`w-full p-4 rounded-lg border text-left flex items-center gap-3 transition-colors hover:bg-gray-500/10 border-gray-500/30`}>
                                <div className="p-2 bg-gray-500/20 text-gray-400 rounded-full"><RotateCcw size={18}/></div>
                                <div><div className={`font-bold ${styles.textMain}`}>Revert to "Not Released"</div><div className={`text-xs ${styles.textSub}`}>Clear all channels and targets. Files remain in storage.</div></div>
                            </button>
                            <button onClick={() => setConfirmAction('deprecate')} className={`w-full p-4 rounded-lg border text-left flex items-center gap-3 transition-colors ${selectedPackage.status === 'deprecated' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-500/10 border-amber-500/30'}`} disabled={selectedPackage.status === 'deprecated'}>
                                <div className="p-2 bg-amber-500/20 text-amber-500 rounded-full"><Ban size={18}/></div>
                                <div><div className={`font-bold ${styles.textMain}`}>Deprecate File</div><div className={`text-xs ${styles.textSub}`}>Mark as obsolete. Prevents new downloads but keeps history.</div></div>
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={() => setIsStatusOpen(false)} className={`px-4 py-2 rounded font-medium ${styles.textSub} hover:text-white`}>Cancel</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
  };

  const DetailEditModal = () => {
    if (!selectedPackage) return null;
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'compat' | 'activity'>('general');
    const [editForm, setEditForm] = useState(selectedPackage);
    const [isPreviewMode, setIsPreviewMode] = useState(false); // Markdown Preview State

    // Find existing dependency ID logic
    const findDependencyId = (platform: string, major: string, minor: string, patch: string) => {
        const version = `${major}.${minor}.${patch}`;
        const found = MOCK_RELEASES.find(r => r.product === 'Agent' && r.platform === platform && r.version === version);
        return found ? found.id : '';
    };

    const [selectedDepId, setSelectedDepId] = useState(() => {
        if (selectedPackage.dependencies.isStandalone) return '';
        return findDependencyId(selectedPackage.platform, selectedPackage.dependencies.major, selectedPackage.dependencies.minor, selectedPackage.dependencies.patch);
    });

    const availableTargets = useMemo(() => {
        return MOCK_TARGETS.filter(t => {
            if (t.platform !== editForm.platform) return false;
            const hasMatchingArch = t.arch.some(a => editForm.arch.includes(a as any));
            if (!hasMatchingArch) return false;
            return true;
        });
    }, [editForm.platform, editForm.arch]);

    const availableDependencies = useMemo(() => {
        return MOCK_RELEASES
            .filter(r => r.product === 'Agent' && r.platform === editForm.platform) // Agent on same platform
            .map(r => ({ id: r.id, label: `Agent v${r.version} (${r.series})` }));
    }, [editForm.platform]);

    const toggleOsSupport = (targetName: string) => {
        setEditForm(prev => {
            const exists = prev.supportOS.includes(targetName);
            return {
                ...prev,
                supportOS: exists 
                  ? prev.supportOS.filter(n => n !== targetName)
                  : [...prev.supportOS, targetName]
            };
        });
    };

    const handleSave = () => {
        // Update dependencies structure based on selection
        let newDeps = { ...editForm.dependencies };
        if (!newDeps.isStandalone && selectedDepId) {
             const dep = MOCK_RELEASES.find(r => r.id === selectedDepId);
             if (dep) {
                 const [maj, min, pat] = dep.version.split('.');
                 newDeps = { isStandalone: false, major: maj, minor: min, patch: pat };
             }
        } else if (newDeps.isStandalone) {
             newDeps = { isStandalone: true, major: '', minor: '', patch: '' };
        }

        const newLog: ActivityLog = { id: `a-${Date.now()}`, user: 'current_admin', action: 'Updated package details', timestamp: new Date().toLocaleString() };
        const index = MOCK_RELEASES.findIndex(r => r.id === selectedPackage.id);
        if (index !== -1) {
            MOCK_RELEASES[index] = { 
                ...editForm, 
                dependencies: newDeps,
                activityLog: [newLog, ...editForm.activityLog] 
            };
        }
        setIsEditing(false);
        setIsDetailOpen(false);
        handleRefresh();
    };

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${styles.modalOverlay}`}>
          <div className={`w-full max-w-4xl rounded-xl shadow-2xl border flex flex-col h-[85vh] ${styles.modalBg}`}>
              <div className="p-6 border-b border-inherit flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${theme === AppTheme.LIGHT ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}><Package size={28} /></div>
                      <div>
                          <div className="flex items-center gap-3">
                              <h2 className={`text-2xl font-bold ${styles.textMain}`}>Application Detail</h2>
                              {editForm.status === 'deprecated' ? (
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/20">Deprecated</span>
                              ) : editForm.targets.length > 0 ? (
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 border border-green-500/20">Released</span>
                              ) : (
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-500 border border-gray-500/20">Not Released</span>
                              )}
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      {!isEditing ? (
                          selectedPackage.status !== 'deprecated' && (
                            <button onClick={() => setIsEditing(true)} className={`px-4 py-2 text-sm rounded-md border flex items-center gap-2 hover:bg-opacity-10 hover:bg-blue-500 transition-colors ${styles.textMain} border-inherit`}><Edit3 size={14} /> Edit Details</button>
                          )
                      ) : <div className="flex gap-2"><button onClick={() => { setIsEditing(false); setEditForm(selectedPackage); }} className="px-3 py-1.5 text-sm rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10">Cancel</button><button onClick={handleSave} className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${styles.buttonPrimary}`}><Save size={14} /> Save Changes</button></div>}
                      <button onClick={() => setIsDetailOpen(false)} className={`p-2 hover:text-red-500 transition-colors ${styles.textSub}`}><X size={20} /></button>
                  </div>
              </div>
              <div className={`flex px-6 border-b border-inherit gap-6 ${styles.textSub}`}><button onClick={() => setActiveTab('general')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? styles.tabActive : 'border-transparent ' + styles.tabInactive}`}>MANIFEST & Docs</button><button onClick={() => setActiveTab('compat')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'compat' ? styles.tabActive : 'border-transparent ' + styles.tabInactive}`}>Compatibility</button><button onClick={() => setActiveTab('activity')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? styles.tabActive : 'border-transparent ' + styles.tabInactive}`}>File Activity</button></div>
              <div className="flex-1 overflow-y-auto p-6 bg-opacity-50">
                  {activeTab === 'general' && <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                      
                      {/* Section 1: Package Identity */}
                      <div className={`p-5 rounded-lg border ${styles.input} bg-opacity-30`}>
                          <h4 className={`text-xs font-bold uppercase mb-4 tracking-wider flex items-center gap-2 ${styles.textSub}`}>
                              <Fingerprint size={14}/> Package Identity
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm">
                              <div>
                                  <div className={`text-[10px] font-bold uppercase opacity-50 mb-1 ${styles.textSub}`}>Product</div>
                                  <div className={`font-bold flex items-center gap-2 ${styles.textMain}`}>
                                      {editForm.product === 'Agent' && <Monitor size={16} className="text-blue-500"/>}
                                      {editForm.product === 'OTA Img' && <Layers size={16} className="text-purple-500"/>}
                                      {editForm.product === 'Tool' && <Wrench size={16} className="text-orange-500"/>}
                                      {editForm.product}
                                  </div>
                              </div>
                              <div>
                                  <div className={`text-[10px] font-bold uppercase opacity-50 mb-1 ${styles.textSub}`}>Platform</div>
                                  <div className={`font-medium ${styles.textMain}`}>{editForm.platform}</div>
                              </div>
                              <div>
                                  <div className={`text-[10px] font-bold uppercase opacity-50 mb-1 ${styles.textSub}`}>Series</div>
                                  <div className={`font-medium ${styles.textMain}`}>{editForm.series}</div>
                              </div>
                              <div>
                                  <div className={`text-[10px] font-bold uppercase opacity-50 mb-1 ${styles.textSub}`}>Architecture</div>
                                  <div className={`font-mono text-xs px-2 py-1 rounded bg-black/20 w-fit ${styles.textMain}`}>{editForm.arch.join(', ')}</div>
                              </div>
                              
                              <div className="col-span-2 md:col-span-4 pt-3 mt-1 border-t border-gray-500/20">
                                  <div className={`text-[10px] font-bold uppercase opacity-50 mb-1 ${styles.textSub}`}>Release Scope</div>
                                  {editForm.scope === 'Generic' ? (
                                      <div className="flex items-center gap-2 text-blue-500 font-medium">
                                          <Globe size={16} /> 
                                          <span>Generic Release</span>
                                          <span className="text-xs opacity-60 font-normal ml-2">(Available to all customers)</span>
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-2 text-amber-500 font-medium">
                                          <Lock size={16} /> 
                                          <span>Customized: {editForm.customers?.join(', ')}</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>

                      {/* Section 2: File Artifact */}
                      <div className={`p-5 rounded-lg border ${styles.input} bg-opacity-30`}>
                          <h4 className={`text-xs font-bold uppercase mb-4 tracking-wider flex items-center gap-2 ${styles.textSub}`}>
                              <FileBox size={14}/> File Artifact
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                  <div>
                                      <div className={`text-[10px] font-bold uppercase opacity-50 mb-1 ${styles.textSub}`}>Filename</div>
                                      <div className={`font-mono font-bold text-base truncate ${styles.textMain}`} title={editForm.filename}>{editForm.filename}</div>
                                  </div>
                                  <div className="flex gap-8">
                                      <div>
                                          <div className={`text-[10px] font-bold uppercase opacity-50 mb-1 ${styles.textSub}`}>Size</div>
                                          <div className={`font-mono ${styles.textMain}`}>{editForm.size}</div>
                                      </div>
                                      <div>
                                          <div className={`text-[10px] font-bold uppercase opacity-50 mb-1 ${styles.textSub}`}>Uploaded</div>
                                          <div className={`font-mono ${styles.textMain}`}>{editForm.uploadedAt}</div>
                                      </div>
                                  </div>
                              </div>
                              <div className="bg-black/10 rounded p-3 text-xs space-y-2 font-mono">
                                  <div>
                                      <div className="opacity-50 mb-0.5">MD5</div>
                                      <div className="break-all opacity-80 select-all">d41d8cd98f00b204e9800998ecf8427e</div>
                                  </div>
                                  <div className="pt-2 border-t border-gray-500/20">
                                      <div className="opacity-50 mb-0.5">SHA256</div>
                                      <div className="break-all opacity-80 select-all">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Dependencies Editing Section */}
                      <div className={`p-4 rounded border ${styles.input}`}>
                          <div className="flex justify-between items-center mb-2">
                              <label className={`text-xs font-bold uppercase ${styles.textSub}`}>Dependencies</label>
                              {isEditing && (
                                  <label className="flex items-center gap-2">
                                      <input 
                                          type="checkbox" 
                                          checked={editForm.dependencies.isStandalone} 
                                          onChange={e => setEditForm({...editForm, dependencies: {...editForm.dependencies, isStandalone: e.target.checked}})} 
                                          className="rounded text-blue-600" 
                                      />
                                      <span className={`text-sm ${styles.textMain}`}>Standalone</span>
                                  </label>
                              )}
                          </div>
                          {isEditing ? (
                              <div className={`relative ${editForm.dependencies.isStandalone ? 'opacity-30 pointer-events-none' : ''}`}>
                                  <select 
                                      value={selectedDepId} 
                                      onChange={e => setSelectedDepId(e.target.value)} 
                                      className={`w-full p-2 rounded border ${styles.inputGroup}`}
                                  >
                                      <option value="">Select Base Dependency...</option>
                                      {availableDependencies.map(dep => (<option key={dep.id} value={dep.id}>{dep.label}</option>))}
                                  </select>
                              </div>
                          ) : (
                              <div>
                                  {editForm.dependencies.isStandalone ? (
                                      <Badge colorClass="bg-green-500/10 text-green-500 border border-green-500/20">Standalone</Badge>
                                  ) : (
                                      <div className="flex items-center gap-2">
                                          <Badge colorClass="bg-amber-500/10 text-amber-500 border border-amber-500/20">Requires Agent</Badge>
                                          <span className="font-mono text-sm">v{editForm.dependencies.major}.{editForm.dependencies.minor}.{editForm.dependencies.patch}</span>
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>

                      <div className="space-y-2"><label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Description</label>{isEditing ? <input className={`w-full p-2 rounded border outline-none focus:ring-1 focus:ring-blue-500 ${styles.input}`} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} /> : <p className={`${styles.textMain} text-sm`}>{editForm.description || <span className="opacity-50 italic">No description provided.</span>}</p>}</div>
                      
                      {/* Release Notes with Markdown Toggle */}
                      <div className="space-y-2">
                          <div className="flex justify-between items-center">
                              <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Release Notes</label>
                              {isEditing && (
                                <div className="flex gap-1">
                                    <button onClick={() => setIsPreviewMode(false)} className={`px-2 py-0.5 text-[10px] rounded-l border ${!isPreviewMode ? 'bg-blue-500 text-white' : styles.input}`}>Write</button>
                                    <button onClick={() => setIsPreviewMode(true)} className={`px-2 py-0.5 text-[10px] rounded-r border ${isPreviewMode ? 'bg-blue-500 text-white' : styles.input}`}>Preview</button>
                                </div>
                              )}
                          </div>
                          {isEditing ? (
                              isPreviewMode ? (
                                  <div className={`w-full h-48 p-4 rounded border overflow-y-auto font-mono text-sm ${styles.input} bg-opacity-50`}>
                                      {editForm.releaseNotes || <span className="opacity-50 italic">No content.</span>}
                                  </div>
                              ) : (
                                  <textarea className={`w-full h-48 p-4 rounded border outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm ${styles.input}`} value={editForm.releaseNotes} onChange={e => setEditForm({...editForm, releaseNotes: e.target.value})} /> 
                              )
                          ) : (
                              <div className={`w-full p-4 rounded border font-mono text-sm whitespace-pre-wrap ${styles.input} bg-opacity-50`}>{editForm.releaseNotes || <span className="opacity-50 italic">No notes available.</span>}</div>
                          )}
                      </div>
                  </div>}
                  {activeTab === 'compat' && <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col"><div className="flex justify-between items-center"><h3 className={`font-bold ${styles.textMain}`}>Supported OS Targets</h3><div className={`text-xs ${styles.textSub}`}>{editForm.supportOS.length} targets selected</div></div>{isEditing ? <div className={`flex-1 overflow-y-auto border rounded-md p-2 ${styles.input}`}><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{availableTargets.map(t => { const isSelected = editForm.supportOS.includes(t.name); return (<div key={t.id} onClick={() => toggleOsSupport(t.name)} className={`p-3 rounded border cursor-pointer flex items-center gap-3 select-none transition-colors ${isSelected ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500/50' : 'border-transparent hover:bg-gray-500/10'}`}><div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-500'}`}>{isSelected && <Check size={10} />}</div><div><div className={`text-sm font-medium ${styles.textMain}`}>{t.name}</div><div className="text-xs opacity-50 font-mono">{t.code}</div></div></div>); })}</div></div> : <div className={`flex-1 overflow-y-auto border rounded-md ${styles.input}`}>{editForm.supportOS.length > 0 ? (<table className="w-full text-left text-sm"><thead className="bg-black/10"><tr><th className="p-3 font-semibold text-xs uppercase opacity-70">Target Name</th><th className="p-3 font-semibold text-xs uppercase opacity-70">Status</th></tr></thead><tbody>{editForm.supportOS.map((os, i) => (<tr key={i} className="border-b border-inherit last:border-0 hover:bg-white/5"><td className="p-3 font-medium flex items-center gap-2"><Monitor size={14} className="opacity-50"/> {os}</td><td className="p-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 border border-green-500/20">Verified</span></td></tr>))}</tbody></table>) : <div className="p-8 text-center opacity-50"><AlertTriangle size={24} className="mx-auto mb-2"/><p>No OS targets specified.</p></div>}</div>}</div>}
                  {activeTab === 'activity' && <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2"><div className="relative pl-4 space-y-6"><div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-500/20"></div>{editForm.activityLog && editForm.activityLog.length > 0 ? editForm.activityLog.map((log, index) => (<div key={log.id} className="relative pl-6"><div className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border-2 ${theme === AppTheme.LIGHT ? 'bg-white border-blue-500' : 'bg-slate-800 border-blue-400'} z-10`}></div><div className="flex flex-col"><span className={`text-sm font-medium ${styles.textMain}`}>{log.action}</span><div className="flex items-center gap-2 text-xs opacity-60 mt-1"><span className="flex items-center gap-1"><User size={10}/> {log.user}</span><span>•</span><span className="flex items-center gap-1"><Calendar size={10}/> {log.timestamp}</span></div></div></div>)) : <p className="text-sm opacity-50 italic pl-6">No activity recorded.</p>}</div></div>}
              </div>
          </div>
      </div>
    );
  };


  // --- WIZARD COMPONENT ---
  const UploadWizard = () => {
    const [step, setStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    
    // Updated State
    const [formData, setFormData] = useState({
      releaseType: 'Generic' as 'Generic' | 'Customized',
      selectedCustomer: '',
      product: 'Agent',
      platform: 'Android',
      series: 'Universal',
      customSeries: '', 
      arch: 'x86_64',
      versionMajor: '3',
      versionMinor: '1',
      versionPatch: '0',
      isStandalone: false,
      selectedDependency: '', 
      releaseNotes: '# New Features\n- Added support for custom peripheral X\n- Improved memory management\n\n## Bug Fixes\n- Fixed memory leak in serial driver',
      description: '',
      selectedTargets: [] as string[]
    });
    
    const [isCustomSeriesMode, setIsCustomSeriesMode] = useState(false);
    const steps = [
        { id: 1, label: 'SCOPE' },
        { id: 2, label: 'MANIFEST' }, 
        { id: 3, label: 'COMPATIBILITY' }, 
        { id: 4, label: 'UPLOAD' }, 
        { id: 5, label: 'DOCS' },
        { id: 6, label: 'REVIEW' }
    ];
    
    // Helper to get series based on scope
    const getAvailableSeries = () => {
        let list = getSeriesForPlatform(formData.platform, formData.product);
        if (formData.releaseType === 'Customized' && formData.selectedCustomer) {
            // Simplified logic: If customized, we might want to show specific custom series available for that customer
            // But if user wants to select a customized series specifically, we will handle that in the UI render.
            return list; 
        }
        return list;
    };

    // Helper to get mocked custom series for a customer
    const getCustomizedSeriesOptions = () => {
        if (!formData.selectedCustomer) return [];
        // Mocking some customized series
        return [`${formData.selectedCustomer}-Series-1`, `${formData.selectedCustomer}-Special`, `Legacy-${formData.selectedCustomer}`];
    };

    const handleSubmit = () => {
        setIsSuccess(true);
        // Add to Mock Data
        const newPkg: ReleasePackage = {
            id: `${Date.now()}`,
            product: formData.product as ProductType,
            platform: formData.platform as PlatformType,
            series: isCustomSeriesMode ? formData.customSeries : formData.series,
            arch: [formData.arch as ArchType],
            supportOS: formData.selectedTargets.map(id => MOCK_TARGETS.find(t => t.id === id)?.name || ''),
            version: `${formData.versionMajor}.${formData.versionMinor}.${formData.versionPatch}`,
            filename: file ? file.name : `${formData.product}_${formData.platform}_${formData.versionMajor}.${formData.versionMinor}.${formData.versionPatch}.zip`,
            size: '24.5 MB', // Mock
            uploadedAt: new Date().toISOString().split('T')[0],
            uploader: 'current_user@corp.com',
            status: 'active',
            channels: [], // Initially no channels active
            targets: [], // Initially not released
            scope: formData.releaseType,
            customers: formData.releaseType === 'Customized' && formData.selectedCustomer ? [formData.selectedCustomer] : [],
            description: formData.description,
            releaseNotes: formData.releaseNotes,
            dependencies: { 
                major: '0', minor: '0', patch: '0', // Simplification for mock
                isStandalone: formData.isStandalone 
            },
            activityLog: [
                { id: `log-${Date.now()}`, user: 'current_user', action: 'Uploaded package', timestamp: new Date().toLocaleString() }
            ]
        };
        MOCK_RELEASES.unshift(newPkg); // Add to top
        handleRefresh();
    };

    // Effects
    useEffect(() => {
        const validPlatforms = getPlatformsForProduct(formData.product);
        if (!validPlatforms.includes(formData.platform)) setFormData(prev => ({ ...prev, platform: validPlatforms[0] }));
    }, [formData.product]);
    
    useEffect(() => {
        setIsCustomSeriesMode(false);
        const validSeries = getAvailableSeries();
        if (!validSeries.includes(formData.series)) setFormData(prev => ({ ...prev, series: validSeries[0] || '', customSeries: '' }));
    }, [formData.platform, formData.product, formData.releaseType, formData.selectedCustomer]);
    
    useEffect(() => {
        const currentSeries = isCustomSeriesMode ? formData.customSeries : formData.series;
        const validArchs = getArchsForConfig(formData.platform, currentSeries, isCustomSeriesMode);
        if (!validArchs.includes(formData.arch)) setFormData(prev => ({ ...prev, arch: validArchs[0] }));
    }, [formData.platform, formData.series, isCustomSeriesMode, formData.customSeries]);
    
    useEffect(() => { setFormData(prev => ({ ...prev, selectedTargets: [] })); }, [formData.platform, formData.series, formData.arch, isCustomSeriesMode]);

    const toggleTarget = (target: string) => { setFormData(prev => ({...prev, selectedTargets: prev.selectedTargets.includes(target) ? prev.selectedTargets.filter(t => t !== target) : [...prev.selectedTargets, target]})); };
    const fullVersion = `${formData.versionMajor}.${formData.versionMinor}.${formData.versionPatch}`;
    const isDuplicateVersion = useMemo(() => MOCK_RELEASES.some(r => r.product === formData.product && r.platform === formData.platform && r.version === fullVersion && r.arch.includes(formData.arch as any)), [formData.product, formData.platform, fullVersion, formData.arch]);
    
    const existingVersions = useMemo(() => {
        const s = isCustomSeriesMode ? formData.customSeries : formData.series;
        return MOCK_RELEASES.filter(r => 
            r.product === formData.product && 
            r.platform === formData.platform && 
            r.series === s &&
            r.arch.includes(formData.arch as any)
        ).sort((a,b) => b.uploadedAt.localeCompare(a.uploadedAt));
    }, [formData.product, formData.platform, formData.series, formData.customSeries, formData.arch, isCustomSeriesMode]);

    const availableDependencies = useMemo(() => {
        return MOCK_RELEASES
            .filter(r => r.product === 'Agent' && r.platform === formData.platform)
            .map(r => ({ id: r.id, label: `Agent v${r.version} (${r.series})` }));
    }, [formData.platform]);

    const renderSteps = () => (
        <div className="flex justify-between mb-8 relative px-4">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-500/20 -z-10"></div>
             {steps.map((s, idx) => {
                 const isActive = step >= s.id || isSuccess;
                 const isCurrent = step === s.id && !isSuccess;
                 return (
                     <div key={s.id} className="flex flex-col items-center gap-2 bg-inherit z-10">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isActive ? (isCurrent ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/50' : 'bg-blue-600/20 text-blue-500 border border-blue-500/50') : 'bg-gray-500/20 text-gray-500 border border-gray-500/50'}`}>
                             {isActive && !isCurrent ? <Check size={16}/> : s.id}
                         </div>
                         <span className={`text-[10px] font-bold tracking-wider ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>{s.label}</span>
                     </div>
                 )
             })}
        </div>
    );

    const renderStep1_Scope = () => {
        return (
            <div className="flex flex-col h-full max-w-2xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-right-4">
                <div className="text-center mb-4">
                    <h3 className={`text-xl font-bold ${styles.textMain}`}>Define Release Scope</h3>
                    <p className={`text-sm ${styles.textSub} mt-2`}>Choose who this package is intended for.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center gap-4 group ${formData.releaseType === 'Generic' ? 'border-blue-500 bg-blue-500/5' : styles.input + ' hover:bg-white/5 border-transparent'}`}>
                        <input type="radio" name="releaseType" value="Generic" checked={formData.releaseType === 'Generic'} onChange={() => setFormData({...formData, releaseType: 'Generic', selectedCustomer: ''})} className="hidden" />
                        <div className={`p-4 rounded-full ${formData.releaseType === 'Generic' ? 'bg-blue-500 text-white' : 'bg-gray-500/20 text-gray-500'}`}>
                            <Globe size={32}/>
                        </div>
                        <div>
                            <span className={`text-lg font-bold block ${styles.textMain}`}>Generic</span>
                            <span className={`text-xs opacity-60 mt-1 block`}>Standard build available to all customers. Used for general updates and feature rollouts.</span>
                        </div>
                        {formData.releaseType === 'Generic' && <div className="absolute top-4 right-4 text-blue-500"><CheckCircle2 size={24}/></div>}
                    </label>

                    <label className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center gap-4 group ${formData.releaseType === 'Customized' ? 'border-amber-500 bg-amber-500/5' : styles.input + ' hover:bg-white/5 border-transparent'}`}>
                        <input type="radio" name="releaseType" value="Customized" checked={formData.releaseType === 'Customized'} onChange={() => setFormData({...formData, releaseType: 'Customized'})} className="hidden" />
                        <div className={`p-4 rounded-full ${formData.releaseType === 'Customized' ? 'bg-amber-500 text-white' : 'bg-gray-500/20 text-gray-500'}`}>
                            <Lock size={32}/>
                        </div>
                        <div>
                            <span className={`text-lg font-bold block ${styles.textMain}`}>Customized</span>
                            <span className={`text-xs opacity-60 mt-1 block`}>Private build specific to a single customer. Contains proprietary configs or features.</span>
                        </div>
                        {formData.releaseType === 'Customized' && <div className="absolute top-4 right-4 text-amber-500"><CheckCircle2 size={24}/></div>}
                    </label>
                </div>

                {formData.releaseType === 'Customized' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 pt-4 border-t border-dashed border-gray-500/30">
                        <label className={`text-xs font-bold uppercase mb-2 block ${styles.textSub}`}>Select Target Customer</label>
                        <SearchableSelect 
                            options={MOCK_CUSTOMERS}
                            value={formData.selectedCustomer}
                            onChange={(val) => setFormData({...formData, selectedCustomer: val})}
                            placeholder="-- Select Customer --"
                        />
                        <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                            <Info size={14}/> 
                            <span>This selection will filter available <strong>Series</strong> in the next step.</span>
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const renderStep2_Manifest = () => {
        const availablePlatforms = getPlatformsForProduct(formData.product);
        const availableSeries = getAvailableSeries();
        const availableArchs = getArchsForConfig(formData.platform, isCustomSeriesMode ? formData.customSeries : formData.series, isCustomSeriesMode);
        
        // Customized series logic
        const customizedSeriesOptions = getCustomizedSeriesOptions();

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-in fade-in slide-in-from-right-4">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><label className={`text-xs font-bold uppercase ${styles.textSub}`}>Product</label><select className={`w-full p-3 rounded-lg border ${styles.input}`} value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})}>{FILTER_OPTIONS.products.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        <div className="space-y-2"><label className={`text-xs font-bold uppercase ${styles.textSub}`}>Platform</label><select className={`w-full p-3 rounded-lg border ${styles.input}`} value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}>{availablePlatforms.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={`text-xs font-bold uppercase ${styles.textSub} flex items-center gap-2`}>
                                Series 
                                {formData.releaseType === 'Customized' && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded">CUSTOM</span>}
                            </label>
                            
                            {/* Render different Series selection if Customized */}
                            {formData.releaseType === 'Customized' ? (
                                <div className="relative">
                                    {isCustomSeriesMode ? (
                                        <div className="relative">
                                            <input type="text" autoFocus placeholder="Enter Custom Series Name" value={formData.customSeries} onChange={(e) => setFormData({...formData, customSeries: e.target.value})} className={`w-full pl-3 pr-8 py-3 rounded-lg border ${styles.input} border-amber-500/50`} />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                <button onClick={() => setIsCustomSeriesMode(false)}><X size={14} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <select 
                                            className={`w-full p-3 rounded-lg border ${styles.input} border-amber-500/30`} 
                                            value={formData.series} 
                                            onChange={(e) => { 
                                                if (e.target.value === '__NEW__') { 
                                                    setIsCustomSeriesMode(true); 
                                                    setFormData({...formData, customSeries: ''}); 
                                                } else { 
                                                    setFormData({...formData, series: e.target.value}); 
                                                } 
                                            }}
                                        >
                                            <option value="">Select Customized Series...</option>
                                            <optgroup label="Customer Specific">
                                                {customizedSeriesOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                            </optgroup>
                                            <optgroup label="Standard Base">
                                                {availableSeries.map(p => <option key={p} value={p}>{p}</option>)}
                                            </optgroup>
                                            <option value="__NEW__" className="font-bold text-amber-500">+ Create New Series...</option>
                                        </select>
                                    )}
                                </div>
                            ) : (
                                // Standard Series Selection
                                isCustomSeriesMode ? (
                                    <div className="relative">
                                        <input type="text" autoFocus placeholder="Enter Series Name" value={formData.customSeries} onChange={(e) => setFormData({...formData, customSeries: e.target.value})} className={`w-full pl-3 pr-8 py-3 rounded-lg border ${styles.input}`} />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <span className="text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase">New</span>
                                            <button onClick={() => setIsCustomSeriesMode(false)}><X size={14} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <select className={`w-full p-3 rounded-lg border ${styles.input}`} value={formData.series} onChange={(e) => { if (e.target.value === '__NEW__') { setIsCustomSeriesMode(true); setFormData({...formData, customSeries: ''}); } else { setFormData({...formData, series: e.target.value}); } }}>
                                        {availableSeries.map(p => <option key={p} value={p}>{p}</option>)}
                                        <option value="__NEW__" className="font-bold text-blue-500">+ Create New Series...</option>
                                    </select>
                                )
                            )}
                        </div>
                        <div className="space-y-2"><label className={`text-xs font-bold uppercase ${styles.textSub}`}>Architecture</label><div className={`relative`}><Cpu size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.textSub}`} /><select className={`w-full pl-10 p-3 rounded-lg border ${styles.input}`} value={formData.arch} onChange={(e) => setFormData({...formData, arch: e.target.value})}>{availableArchs.map(a => <option key={a} value={a}>{a}</option>)}</select></div></div>
                    </div>
                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase ${styles.textSub}`}>Version Number</label>
                        <div className="flex items-center gap-2 w-full">
                            <input type="text" value={formData.versionMajor} onChange={e=>setFormData({...formData, versionMajor: e.target.value})} className={`flex-1 min-w-0 text-center p-3 rounded-lg border font-bold ${isDuplicateVersion ? 'bg-red-50 border-red-300 text-red-600' : styles.input}`} placeholder="Major" />
                            <span className={styles.textSub}>.</span>
                            <input type="text" value={formData.versionMinor} onChange={e=>setFormData({...formData, versionMinor: e.target.value})} className={`flex-1 min-w-0 text-center p-3 rounded-lg border font-bold ${isDuplicateVersion ? 'bg-red-50 border-red-300 text-red-600' : styles.input}`} placeholder="Minor" />
                            <span className={styles.textSub}>.</span>
                            <input type="text" value={formData.versionPatch} onChange={e=>setFormData({...formData, versionPatch: e.target.value})} className={`flex-1 min-w-0 text-center p-3 rounded-lg border font-bold ${isDuplicateVersion ? 'bg-red-50 border-red-300 text-red-600' : styles.input}`} placeholder="Patch" />
                        </div>
                        {isDuplicateVersion && <p className="text-xs text-red-500 mt-1 font-bold">Error: Version {fullVersion} already exists for this client.</p>}
                    </div>
                    <div className={`p-4 rounded-lg border ${styles.input}`}>
                        <div className="flex justify-between items-center mb-4"><label className={`text-xs font-bold uppercase ${styles.textSub}`}>Dependencies</label><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isStandalone} onChange={e => setFormData({...formData, isStandalone: e.target.checked})} className="rounded text-blue-600" /><span className={`text-sm ${styles.textMain}`}>Standalone</span></label></div>
                        <div className={`relative ${formData.isStandalone ? 'opacity-30 pointer-events-none' : ''}`}><select value={formData.selectedDependency} onChange={e => setFormData({...formData, selectedDependency: e.target.value})} className={`w-full p-2 rounded border ${styles.inputGroup}`}><option value="">Select Base Dependency...</option>{availableDependencies.map(dep => (<option key={dep.id} value={dep.id}>{dep.label}</option>))}</select></div>
                    </div>
                </div>
                <div className={`border-l border-inherit pl-6 flex flex-col ${styles.textSub}`}><h4 className="text-xs font-bold uppercase mb-4 flex items-center gap-2"><History size={14}/> Client Version History</h4><div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[400px]">{existingVersions.length > 0 ? existingVersions.map(ver => (<div key={ver.id} className={`p-3 rounded border text-sm ${styles.input} opacity-80`}><div className="font-bold font-mono">{ver.version}</div><div className="text-[10px] mt-1 opacity-60 flex justify-between"><span>{ver.uploadedAt}</span><span>{ver.size}</span></div></div>)) : <div className="text-center p-8 opacity-40 text-xs italic border border-dashed rounded">No history found for this configuration.</div>}</div></div>
            </div>
        );
    };

    const renderStep3_Compatibility = () => {
         const fullVersion = `${formData.versionMajor}.${formData.versionMinor}.${formData.versionPatch}`;
         const currentSeries = isCustomSeriesMode ? formData.customSeries : formData.series;
         const availableTargets = MOCK_TARGETS.filter(t => { 
             if (t.platform !== formData.platform) return false; 
             if (!t.arch.includes(formData.arch)) return false; 
             if (isCustomSeriesMode) return true; 
             return t.series.includes(formData.series) || t.series.includes('Universal'); 
         });

         const summaryCardClass = theme === AppTheme.LIGHT 
            ? 'bg-blue-50/50 border-blue-100 text-slate-800' 
            : 'bg-[#bd93f9]/5 border-[#bd93f9]/20 text-gray-200';
            
         const headerClass = theme === AppTheme.LIGHT 
            ? 'bg-blue-100/50 text-blue-700' 
            : 'bg-[#bd93f9]/20 text-[#bd93f9]';

         return (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-in fade-in slide-in-from-right-4">
                <div className="lg:col-span-4 space-y-6">
                    {/* Target Platform Card - Moved Up */}
                    <div>
                        <div className={`text-[10px] font-bold uppercase opacity-50 mb-2`}>TARGET PLATFORM</div>
                        <div className={`p-4 rounded-lg border flex items-center justify-between ${styles.input}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-500/10 rounded">{formData.platform === 'Android' ? <Smartphone size={18}/> : <Monitor size={18}/>}</div>
                                <span className="font-medium">{formData.platform} System</span>
                            </div>
                            <div className="p-1 rounded-full bg-green-500 text-white"><Check size={12} strokeWidth={3} /></div>
                        </div>
                        <p className="text-[10px] opacity-50 mt-2 leading-relaxed">System targets below are automatically filtered for <strong>{formData.arch}</strong> compatibility based on the manifest.</p>
                    </div>

                    {/* Manifest Summary */}
                    <div className={`rounded-xl border overflow-hidden ${summaryCardClass}`}>
                        <div className={`px-4 py-3 flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${headerClass}`}>
                            <FileText size={14} /> Manifest Summary
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Scope Badge */}
                            <div className="flex justify-center mb-2">
                                {formData.releaseType === 'Generic' ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30 uppercase">Generic Release</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase flex items-center gap-1">
                                        <Lock size={10}/> Customized: {formData.selectedCustomer}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-start">
                                <div><div className={`text-[10px] font-bold uppercase opacity-50 mb-1`}>PRODUCT</div><div className="font-bold text-lg leading-none">{formData.product}</div></div>
                                <div className="text-right"><div className={`text-[10px] font-bold uppercase opacity-50 mb-1`}>VERSION</div><div className="font-mono font-bold">v{fullVersion}</div></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-dashed border-gray-400/20 pt-4">
                                <div><div className={`text-[10px] font-bold uppercase opacity-50 mb-1`}>PLATFORM</div><div className="font-medium text-sm">{formData.platform}</div></div>
                                <div><div className={`text-[10px] font-bold uppercase opacity-50 mb-1`}>SERIES</div><div className="font-medium text-sm">{currentSeries}</div></div>
                                <div><div className={`text-[10px] font-bold uppercase opacity-50 mb-1`}>ARCHITECTURE</div><Badge colorClass="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">{formData.arch}</Badge></div>
                                <div><div className={`text-[10px] font-bold uppercase opacity-50 mb-1`}>DEPENDENCIES</div><Badge colorClass={formData.isStandalone ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}>{formData.isStandalone ? 'Standalone' : 'Standard'}</Badge></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col h-full min-h-0">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Supported OS Versions</h3>
                        <div className="flex items-center gap-2">
                            <select className={`text-xs p-1.5 rounded border ${styles.input}`}>
                                <option>All Series</option>
                                <option>{currentSeries}</option>
                            </select>
                        </div>
                    </div>
                    <div className={`flex-1 border rounded-xl overflow-hidden flex flex-col ${styles.card}`}>
                        <div className={`flex items-center px-4 py-3 border-b border-inherit bg-black/5 text-xs font-bold uppercase opacity-70`}>
                            <div className="flex-1 pl-14">Target Name</div>
                            <div className="w-16 text-center">Version</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {availableTargets.map(target => {
                                const isSelected = formData.selectedTargets.includes(target.id);
                                return (
                                    <div key={target.id} onClick={() => toggleTarget(target.id)} className={`group flex items-center p-3 rounded-lg cursor-pointer border transition-all duration-200 ${isSelected ? 'bg-blue-500/5 border-blue-500/50' : 'border-transparent hover:bg-gray-500/5 hover:border-gray-500/20'}`}>
                                        <div className={`w-5 h-5 rounded border mr-4 flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400 group-hover:border-blue-400'}`}>
                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-bold ${styles.textMain} truncate`}>{target.name}</div>
                                            <div className="text-xs font-mono opacity-40 mt-0.5 truncate">{target.code}</div>
                                        </div>
                                        <div className="w-16 flex justify-center shrink-0">
                                            <div className={`text-[10px] font-bold px-2 py-1 rounded bg-gray-500/10 text-gray-500`}>{target.osVer.replace(/Android |Win |Ubuntu |Debian /g, '')}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="p-3 border-t border-inherit text-right text-xs opacity-50 bg-black/5">Selected: {formData.selectedTargets.length} targets</div>
                    </div>
                </div>
             </div>
         );
    };

    const renderStep4_Upload = () => (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-right-4">
            
            {/* Upload Area Instructions */}
            <div className={`p-4 rounded-lg border border-dashed ${styles.input} bg-opacity-30 border-blue-500/30`}>
                <h4 className="text-sm font-bold flex items-center gap-2 mb-2 text-blue-500">
                    <FileBadge size={16}/> Package Requirements
                </h4>
                <ul className="list-disc list-inside text-xs opacity-70 space-y-1.5 leading-relaxed">
                    <li>Filename must strictly follow the format: <strong>{`{Product}_{Platform}_{Series}_v{Version}.{ext}`}</strong></li>
                    <li>Ensure the <strong>SHA256</strong> & <strong>MD5</strong> checksums match your local build artifact.</li>
                    <li>Do not upload debug builds or unsigned binaries for Production release channels.</li>
                    <li>Maximum file size is <strong>2GB</strong>. For larger files, use the CLI tool.</li>
                </ul>
            </div>

            <div className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative ${styles.input} border-opacity-50 transition-colors ${file ? 'bg-blue-500/5 border-blue-500/50' : ''}`}>
                {!file ? (
                    <div className="text-center p-8 cursor-pointer">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><Upload size={32} /></div>
                        <p className={`text-sm font-medium ${styles.textMain}`}>Drag & Drop or Click to Browse</p>
                        <p className={`text-xs mt-2 ${styles.textSub}`}>Supported formats: .zip, .tar.gz, .apk (Max 2GB)</p>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { if(e.target.files?.[0]) setFile(e.target.files[0]) }} />
                    </div>
                ) : (
                    <div className="text-center p-8 w-full max-w-md">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in"><FileBox size={32} /></div>
                        <h3 className={`text-lg font-bold break-all ${styles.textMain}`}>{file.name}</h3>
                        <div className={`mt-6 space-y-2 text-sm p-4 rounded bg-black/10 text-left font-mono ${styles.textSub}`}>
                            <div className="flex justify-between"><span>Size:</span> <span>24.5 MB</span></div>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-500/20">
                                <span className="opacity-50">SHA256</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] opacity-90 bg-black/20 px-2 py-0.5 rounded truncate max-w-[200px]">
                                        e3b0c442...855
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="opacity-50">MD5</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] opacity-90 bg-black/20 px-2 py-0.5 rounded truncate max-w-[200px]">
                                        d41d8cd98f00b204e9800998ecf8427e
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setFile(null)} className="text-red-500 text-sm mt-4 hover:underline">Remove & Choose Another</button>
                    </div>
                )}
            </div>
            
            {/* Description Input Moved Here */}
            <div>
                <label className={`text-xs font-bold uppercase mb-2 block ${styles.textSub}`}>Description</label>
                <input 
                    type="text" 
                    className={`w-full p-3 rounded-lg border ${styles.input}`} 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="Brief summary of this upload..."
                />
            </div>
        </div>
    );

    const renderStep5_Docs = () => (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-right-4">
            {/* Helper Info Box */}
            <div className={`p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 flex gap-3 text-sm`}>
                <HelpCircle size={20} className="text-blue-500 shrink-0"/>
                <div className={styles.textSub}>
                    <h4 className={`font-bold ${styles.textMain} mb-1`}>Release Note Guidelines</h4>
                    <p className="text-xs opacity-80 mb-2">
                        Use <strong className="text-blue-500">Markdown</strong> to format your notes. Clear, structured notes help users understand changes.
                    </p>
                    <ul className="list-disc list-inside text-xs opacity-70 space-y-1 ml-1">
                        <li>Use <code># Header</code> for main sections (e.g., New Features).</li>
                        <li>Use <code>- List item</code> for bullet points.</li>
                        <li>Include ticket numbers (e.g., JIRA-123) for reference.</li>
                    </ul>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <label className={`text-xs font-bold uppercase ${styles.textSub} flex items-center gap-2`}>
                        Editor <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400 font-normal">Markdown Supported</span>
                    </label>
                    <div className="flex gap-1">
                        <button onClick={() => setIsPreviewMode(false)} className={`px-3 py-1 text-xs rounded-l border ${!isPreviewMode ? 'bg-blue-500 text-white' : styles.input}`}>Write</button>
                        <button onClick={() => setIsPreviewMode(true)} className={`px-3 py-1 text-xs rounded-r border ${isPreviewMode ? 'bg-blue-500 text-white' : styles.input}`}>Preview</button>
                    </div>
                </div>
                {isPreviewMode ? 
                    <div className={`flex-1 w-full p-4 rounded-lg border overflow-y-auto font-mono text-sm ${styles.input}`}>{formData.releaseNotes}</div> : 
                    <textarea className={`flex-1 w-full p-4 rounded-lg border font-mono text-sm resize-none ${styles.input}`} value={formData.releaseNotes} onChange={(e) => setFormData({...formData, releaseNotes: e.target.value})} />
                }
            </div>
        </div>
    );

    const renderStep6_Review = () => {
        const fullVersion = `${formData.versionMajor}.${formData.versionMinor}.${formData.versionPatch}`;
        const selectedTargetsList = MOCK_TARGETS.filter(t => formData.selectedTargets.includes(t.id));

        return (
        <div className="animate-in fade-in slide-in-from-right-4 space-y-6 h-full flex flex-col">
            <div className="text-center mb-4">
                <h3 className={`text-xl font-bold ${styles.textMain}`}>Review Release Candidate</h3>
                <p className={`text-sm ${styles.textSub}`}>Please verify all details before submitting to the registry.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Identity Card */}
                <div className={`p-5 rounded-xl border relative overflow-hidden ${styles.input}`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h4 className="text-xs font-bold uppercase opacity-50 mb-4 tracking-wider flex items-center gap-2">
                        <Package size={14}/> Package Identity
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div>
                            <div className="text-[10px] uppercase opacity-50 mb-1">Product & Platform</div>
                            <div className={`font-bold ${styles.textMain}`}>{formData.product} on {formData.platform}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase opacity-50 mb-1">Version</div>
                            <div className="font-mono font-bold text-base">{fullVersion}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase opacity-50 mb-1">Scope</div>
                            {formData.releaseType === 'Generic' ? (
                                <span className="inline-flex items-center gap-1.5 text-blue-500 font-bold text-xs"><Globe size={12}/> Generic Release</span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-amber-500 font-bold text-xs"><Lock size={12}/> {formData.selectedCustomer}</span>
                            )}
                        </div>
                        <div>
                            <div className="text-[10px] uppercase opacity-50 mb-1">Series & Arch</div>
                            <div className={styles.textMain}>{formData.series} <span className="opacity-50 mx-1">/</span> {formData.arch}</div>
                        </div>
                    </div>
                </div>

                {/* File & Targets Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${styles.input}`}>
                        <h4 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-wider flex items-center gap-2"><FileBox size={14}/> File Artifact</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="opacity-70">Filename:</span>
                                <span className={`font-mono font-bold truncate max-w-[120px] ${styles.textMain}`} title={file?.name}>{file?.name || 'No file selected'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-70">Size:</span>
                                <span className="font-mono">24.5 MB</span>
                            </div>
                            <div className="pt-2 border-t border-gray-500/20 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="opacity-50 text-[10px] uppercase">SHA256</span>
                                    <span className="font-mono text-[10px] opacity-50 bg-black/20 px-1.5 py-0.5 rounded">e3b0...855</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="opacity-50 text-[10px] uppercase">MD5</span>
                                    <span className="font-mono text-[10px] opacity-50 bg-black/20 px-1.5 py-0.5 rounded">d41d...427e</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col ${styles.input} h-64`}>
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-500/20">
                            <h4 className="text-xs font-bold uppercase opacity-50 tracking-wider flex items-center gap-2"><Layers size={14}/> Targets</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 font-bold">{formData.selectedTargets.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                            {selectedTargetsList.length > 0 ? selectedTargetsList.map(t => (
                                <div key={t.id} className="flex items-center justify-between text-xs p-2 rounded bg-white/5 border border-transparent">
                                    <span className="font-medium truncate max-w-[120px]" title={t.name}>{t.name}</span>
                                    <span className="opacity-50 font-mono text-[10px]">{t.osVer}</span>
                                </div>
                            )) : (
                                <div className="text-center opacity-50 text-xs italic py-10">No targets selected</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notes Preview */}
                <div className={`p-4 rounded-xl border ${styles.input}`}>
                    <h4 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-wider flex items-center gap-2"><FileText size={14}/> Release Notes Preview</h4>
                    <div className="text-xs font-mono opacity-70 bg-black/20 p-3 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {formData.releaseNotes}
                    </div>
                </div>
            </div>
        </div>
        );
    };

    const renderSuccess = () => (
        <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                 <Check size={48} strokeWidth={4} />
             </div>
             <h2 className={`text-2xl font-bold mb-2 ${styles.textMain}`}>Upload Successful!</h2>
             <p className={`${styles.textSub} text-center max-w-md mb-8`}>
                 Your package <span className="font-mono text-green-500 font-bold">{formData.product} v{fullVersion}</span> has been successfully uploaded and indexed.
             </p>
             <div className="p-6 rounded-lg border border-inherit bg-opacity-50 w-full max-w-lg mb-8 bg-black/5">
                 <div className="grid grid-cols-2 gap-y-4 text-sm">
                     <div className="opacity-60">Package ID</div><div className="font-mono text-right">pkg-{Date.now().toString().slice(-6)}</div>
                     <div className="opacity-60">Status</div><div className="text-right text-green-500 font-bold uppercase text-xs">Ready for Release</div>
                     <div className="opacity-60">Integrity Check</div><div className="text-right text-green-500 flex items-center justify-end gap-1"><CheckCircle2 size={12}/> Passed</div>
                 </div>
             </div>
             <div className="flex gap-3">
                 <button onClick={() => { setIsUploadOpen(false); }} className={`px-8 py-3 rounded-lg font-bold shadow-lg ${styles.buttonPrimary}`}>Return to Console</button>
             </div>
        </div>
    );

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${styles.modalOverlay}`}>
            <div className={`w-full max-w-4xl rounded-xl shadow-2xl border flex flex-col h-[750px] ${styles.modalBg}`}>
                <div className="p-6 border-b border-inherit">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className={`text-xl font-bold ${styles.textMain}`}>Upload Wizard</h2>
                        <button onClick={() => setIsUploadOpen(false)}><X size={24} className={styles.textSub} /></button>
                    </div>
                    {renderSteps()}
                </div>
                <div className="p-8 overflow-y-auto flex-1 bg-opacity-50 relative">
                    {isSuccess ? renderSuccess() : (
                        <>
                            {step === 1 && renderStep1_Scope()}
                            {step === 2 && renderStep2_Manifest()}
                            {step === 3 && renderStep3_Compatibility()}
                            {step === 4 && renderStep4_Upload()}
                            {step === 5 && renderStep5_Docs()}
                            {step === 6 && renderStep6_Review()}
                        </>
                    )}
                </div>
                {!isSuccess && (
                    <div className="p-6 border-t border-inherit flex justify-between items-center">
                        <div><button onClick={() => setIsUploadOpen(false)} className="text-red-500 text-sm">Cancel</button></div>
                        <div className="flex gap-3">
                            {step > 1 && <button onClick={() => setStep(step - 1)} className={`px-6 py-2 rounded-lg border ${styles.textMain}`}>Back</button>}
                            <button 
                                onClick={() => { if(step < 6) { if(step === 4 && !file) return; setStep(step + 1); } else { handleSubmit(); } }} 
                                disabled={(step === 4 && !file) || (step === 2 && isDuplicateVersion) || (step === 1 && formData.releaseType === 'Customized' && !formData.selectedCustomer)} 
                                className={`px-8 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2 ${(step === 4 && !file) || (step === 2 && isDuplicateVersion) || (step === 1 && formData.releaseType === 'Customized' && !formData.selectedCustomer) ? 'opacity-50 cursor-not-allowed bg-gray-500' : styles.buttonPrimary}`}
                            >
                                {step === 6 ? 'Confirm Upload' : 'Next'} <ArrowRight size={16}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  // --- RELEASE WIZARD MODAL COMPONENT (unchanged) ---
  const ReleaseModal = () => {
      const [step, setStep] = useState(1);
      const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
      const [channels, setChannels] = useState<ReleaseChannel[]>(selectedPackage?.channels || []);
      const [targets, setTargets] = useState<ReleaseTarget[]>(selectedPackage?.targets || []);

      const toggleChannel = (c: ReleaseChannel) => {
          const isActive = channels.includes(c);
          let newChannels = isActive ? channels.filter(i => i !== c) : [...channels, c];
          let newTargets = [...targets];

          // Logic: "Production" channel is strictly bound to "Spotlight" target
          if (c === 'Production') {
              if (!isActive) {
                  // Turning ON Production -> Force ON Spotlight
                  if (!newTargets.includes('Spotlight Download Page')) {
                      newTargets.push('Spotlight Download Page');
                  }
              } else {
                  // Turning OFF Production -> Force OFF Spotlight
                  newTargets = newTargets.filter(t => t !== 'Spotlight Download Page');
              }
          }

          setChannels(newChannels);
          setTargets(newTargets);
      };

      const toggleTarget = (t: ReleaseTarget) => {
          const isActive = targets.includes(t);
          let newTargets = isActive ? targets.filter(i => i !== t) : [...targets, t];
          let newChannels = [...channels];

          // Logic: "Spotlight" target is strictly bound to "Production" channel
          if (t === 'Spotlight Download Page') {
              if (!isActive) {
                  // Turning ON Spotlight -> Force ON Production
                  if (!newChannels.includes('Production')) {
                      newChannels.push('Production');
                  }
              } else {
                  // Turning OFF Spotlight -> Force OFF Production
                  newChannels = newChannels.filter(c => c !== 'Production');
              }
          }

          setTargets(newTargets);
          setChannels(newChannels);
      };

      const handleDeploy = () => {
          setStatus('loading');
          setTimeout(() => {
              if (!selectedPackage) return;
              const idx = MOCK_RELEASES.findIndex(r => r.id === selectedPackage.id);
              if (idx !== -1) {
                  const prev = MOCK_RELEASES[idx];
                  MOCK_RELEASES[idx] = {
                      ...prev,
                      channels: channels,
                      targets: targets,
                      activityLog: [
                          { 
                              id: `rel-${Date.now()}`, 
                              user: 'current_admin', 
                              action: `Updated Release Configuration`, 
                              timestamp: new Date().toLocaleString() 
                          },
                          ...prev.activityLog
                  ]};
              }
              setStatus('success');
              handleRefresh();
          }, 1500);
      };

      if (!selectedPackage) return null;

      // Wizard Steps Config
      const steps = [
          { id: 1, label: 'Release To' },
          { id: 2, label: 'Channels' },
          { id: 3, label: 'Review' }
      ];

      return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${styles.modalOverlay}`}>
            <div className={`w-full max-w-2xl rounded-xl shadow-2xl border flex flex-col overflow-hidden ${styles.modalBg}`}>
                
                {/* Header with Steps */}
                <div className="p-6 border-b border-inherit bg-gradient-to-r from-blue-600/10 to-transparent">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg text-white"><Rocket size={20} /></div>
                            <div><h2 className={`text-lg font-bold ${styles.textMain}`}>Manage Release</h2><p className={`text-xs ${styles.textSub} font-mono`}>{selectedPackage.filename}</p></div>
                        </div>
                        {status !== 'success' && <button onClick={() => setIsReleaseOpen(false)} className={styles.textSub}><X size={20}/></button>}
                    </div>
                    {status !== 'success' && (
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-500/20 -z-10"></div>
                            {steps.map((s, idx) => {
                                const isActive = step >= s.id;
                                const isCurrent = step === s.id;
                                return (
                                    <div key={s.id} className="flex flex-col items-center gap-2 bg-inherit z-10 px-2 bg-[#282a36]">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-500/20 text-gray-500'}`}>
                                            {isActive ? <Check size={12}/> : s.id}
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isCurrent ? 'text-blue-500' : 'text-gray-500'}`}>{s.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="p-6 flex-1 bg-opacity-50 min-h-[400px] overflow-y-auto">
                    {status === 'loading' ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                            <Loader2 size={48} className="animate-spin text-blue-500" />
                            <p className={styles.textSub}>Updating release configuration...</p>
                        </div>
                    ) : status === 'success' ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95">
                             <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
                                 <Check size={40} strokeWidth={4} />
                             </div>
                             <div className="text-center">
                                 <h2 className={`text-2xl font-bold ${styles.textMain}`}>Release Updated!</h2>
                                 <p className={`text-sm mt-2 max-w-xs mx-auto ${styles.textSub}`}>
                                     The package configuration has been successfully propagated to the selected targets.
                                 </p>
                             </div>
                             <button onClick={() => { setIsReleaseOpen(false); setSelectedPackage(null); }} className={`px-8 py-2 rounded-lg font-bold shadow-lg ${styles.buttonPrimary}`}>Close</button>
                        </div>
                    ) : step === 1 ? (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${styles.textSub}`}>Choose Destinations</h3>
                                <p className="text-xs opacity-60 mb-4 leading-relaxed">
                                    Select the platforms where this package should be distributed. 
                                    <br/><span className="text-amber-500 opacity-80">*Note: Selecting Spotlight automatically enables the Production channel.</span>
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    <div 
                                        onClick={() => toggleTarget('Spotlight Download Page')}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-4 relative overflow-hidden ${targets.includes('Spotlight Download Page') ? 'border-purple-500 bg-purple-500/10' : styles.input + ' hover:bg-white/5'}`}
                                    >
                                        {targets.includes('Spotlight Download Page') && <div className="absolute top-0 right-0 bg-purple-500 text-white text-[9px] px-2 py-0.5 rounded-bl">PROD LINKED</div>}
                                        <div className={`p-3 rounded-lg h-fit ${targets.includes('Spotlight Download Page') ? 'bg-purple-500 text-white' : 'bg-gray-500/20 text-gray-500'}`}><Globe size={24}/></div>
                                        <div className="flex-1">
                                            <div className={`font-bold text-lg ${styles.textMain}`}>Spotlight Download Page</div>
                                            <p className="text-xs opacity-70 mt-1 leading-relaxed">{TARGET_DESCRIPTIONS['Spotlight Download Page']}</p>
                                        </div>
                                        <div className="ml-2 flex items-center">
                                            {targets.includes('Spotlight Download Page') ? <CheckCircle2 className="text-purple-500" /> : <div className="w-6 h-6 rounded-full border border-gray-500"></div>}
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => toggleTarget('Automation Update Service')}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-4 ${targets.includes('Automation Update Service') ? 'border-orange-500 bg-orange-500/10' : styles.input + ' hover:bg-white/5'}`}
                                    >
                                        <div className={`p-3 rounded-lg h-fit ${targets.includes('Automation Update Service') ? 'bg-orange-500 text-white' : 'bg-gray-500/20 text-gray-500'}`}><Zap size={24}/></div>
                                        <div className="flex-1">
                                            <div className={`font-bold text-lg ${styles.textMain}`}>Automation Update Service</div>
                                            <p className="text-xs opacity-70 mt-1 leading-relaxed">{TARGET_DESCRIPTIONS['Automation Update Service']}</p>
                                        </div>
                                        <div className="ml-2 flex items-center">
                                            {targets.includes('Automation Update Service') ? <CheckCircle2 className="text-orange-500" /> : <div className="w-6 h-6 rounded-full border border-gray-500"></div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                            {/* Context from Step 1 */}
                            <div className="bg-black/10 rounded-lg p-3 border border-dashed border-gray-500/20 flex items-center gap-4 text-xs">
                                <span className={`font-bold uppercase tracking-wider ${styles.textSub}`}>Step 1 Context:</span>
                                <div className="flex gap-2">
                                    {targets.length > 0 ? targets.map(t => (
                                        <span key={t} className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-medium ${t.includes('Spotlight') ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            {t.includes('Spotlight') ? <Globe size={10}/> : <Zap size={10}/>}
                                            {t.includes('Spotlight') ? 'Spotlight' : 'Automation'}
                                        </span>
                                    )) : <span className="opacity-50 italic">No targets selected (Will unrelease)</span>}
                                </div>
                            </div>

                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${styles.textSub}`}>Select Channels</h3>
                                <p className="text-xs opacity-60 mb-4 leading-relaxed">
                                    Determine the stability level for this release. 
                                    <br/><span className="text-amber-500 opacity-80">*Note: The 'Production' channel requires and enforces the Spotlight target.</span>
                                </p>
                                <div className="space-y-3">
                                {['Production', 'Test', 'Beta', 'Experimental'].map((channel) => (
                                    <label key={channel} className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${channels.includes(channel as any) ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500' : styles.input + ' hover:border-gray-500'}`}>
                                        <div className="pt-1">
                                            <input type="checkbox" checked={channels.includes(channel as any)} onChange={() => toggleChannel(channel as any)} className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`font-bold text-base ${styles.textMain}`}>{channel}</div>
                                                {channel === 'Production' && channels.includes('Production') && (
                                                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
                                                        <LinkIcon size={8}/> SPOTLIGHT LINKED
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs opacity-60 mt-1 leading-relaxed">{CHANNEL_DESCRIPTIONS[channel as ReleaseChannel]}</div>
                                        </div>
                                    </label>
                                ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                            {/* Detailed File Info */}
                            <div className={`p-4 rounded-lg border bg-opacity-50 ${styles.input} flex flex-col gap-3`}>
                                <div className="flex items-center gap-3 border-b border-gray-500/10 pb-3">
                                    <div className={`p-2 rounded bg-blue-500/10 text-blue-500 shrink-0`}>
                                        <FileBadge size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-bold uppercase opacity-50 tracking-wider">File Manifest</div>
                                        <div className={`font-mono font-bold truncate text-sm ${styles.textMain}`} title={selectedPackage.filename}>{selectedPackage.filename}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-xs">
                                    <div>
                                        <div className="opacity-50 uppercase text-[10px] mb-0.5">Product</div>
                                        <div className={`font-medium ${styles.textMain}`}>{selectedPackage.product}</div>
                                    </div>
                                    <div>
                                        <div className="opacity-50 uppercase text-[10px] mb-0.5">Version</div>
                                        <div className={`font-mono font-bold ${styles.textMain}`}>v{selectedPackage.version}</div>
                                    </div>
                                    <div>
                                        <div className="opacity-50 uppercase text-[10px] mb-0.5">Size</div>
                                        <div className={`font-mono ${styles.textMain}`}>{selectedPackage.size}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="opacity-50 uppercase text-[10px] mb-0.5">Platform</div>
                                        <div className={`font-medium ${styles.textMain}`}>{selectedPackage.platform}</div>
                                    </div>
                                    <div>
                                        <div className="opacity-50 uppercase text-[10px] mb-0.5">Series</div>
                                        <div className={`font-medium ${styles.textMain}`}>{selectedPackage.series}</div>
                                    </div>
                                    <div>
                                        <div className="opacity-50 uppercase text-[10px] mb-0.5">Arch</div>
                                        <div className={`font-medium ${styles.textMain}`}>{selectedPackage.arch.join(', ')}</div>
                                    </div>

                                    <div className="col-span-3 pt-2 border-t border-gray-500/10 flex justify-between items-center">
                                        <div>
                                            <div className="opacity-50 uppercase text-[10px]">Uploaded</div>
                                            <div className="opacity-80">{selectedPackage.uploadedAt}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="opacity-50 uppercase text-[10px]">SHA Checksum</div>
                                            <div className="font-mono text-[10px] opacity-60 truncate max-w-[150px]">8829a...f9921</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Configuration Map (The Nested View) */}
                            <div>
                                <h4 className={`text-xs font-bold uppercase mb-3 ${styles.textSub}`}>Release Configuration Map</h4>
                                <div className="space-y-3">
                                    {targets.length === 0 ? (
                                        <div className="p-4 rounded border border-dashed border-gray-500/30 text-gray-500 italic text-center text-sm">
                                            No targets selected. This package will be unreleased (withdrawn from all channels).
                                        </div>
                                    ) : (
                                        targets.map(t => {
                                            const isSpotlight = t.includes('Spotlight');
                                            const color = isSpotlight ? 'purple' : 'orange';
                                            return (
                                                <div key={t} className={`border rounded-lg overflow-hidden border-${color}-500/30`}>
                                                    <div className={`px-4 py-2 bg-${color}-500/10 border-b border-${color}-500/10 flex items-center justify-between`}>
                                                        <div className="flex items-center gap-2">
                                                            {isSpotlight ? <Globe size={14} className="text-purple-500"/> : <Zap size={14} className="text-orange-500"/>}
                                                            <span className={`text-sm font-bold ${styles.textMain}`}>{t}</span>
                                                        </div>
                                                        <div className={`text-[10px] font-bold uppercase text-${color}-500 opacity-70`}>{isSpotlight ? 'Public' : 'Backend'}</div>
                                                    </div>
                                                    <div className="p-3 bg-opacity-20 bg-black">
                                                        <div className="text-[10px] uppercase opacity-50 mb-2">Active Channels</div>
                                                        {channels.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {channels.map(c => (
                                                                    <span key={c} className={`px-2 py-1 rounded text-xs font-bold border bg-${color}-500/20 text-${color}-400 border-${color}-500/30`}>
                                                                        {c}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs opacity-50 italic flex items-center gap-1"><AlertTriangle size={10}/> No channels selected (Inactive)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Risk Warning */}
                            {targets.length > 0 && channels.length > 0 && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3">
                                    <ShieldAlert size={24} className="text-red-500 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-red-500 text-sm">Confirm Release Action</h4>
                                        <p className="text-xs opacity-80 mt-1 leading-relaxed text-red-400">
                                            You are about to release <strong>{selectedPackage.filename}</strong> to <strong>{targets.length} targets</strong> on <strong>{channels.length} channels</strong>. 
                                            This action will make the file immediately available for download/update by users and devices on these channels.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {status === 'idle' && (
                    <div className="p-6 border-t border-inherit flex justify-between bg-opacity-50 bg-black/5">
                        {step === 1 ? (
                             <button onClick={() => setIsReleaseOpen(false)} className={`px-4 py-2 rounded-lg font-medium ${styles.textSub} hover:text-white`}>Cancel</button>
                        ) : (
                            <button onClick={() => setStep(step - 1)} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${styles.textSub} hover:bg-white/5`}>
                                <ArrowLeft size={16}/> Back
                            </button>
                        )}
                        
                        {step < 3 ? (
                            <button onClick={() => setStep(step + 1)} className={`px-6 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2 ${styles.buttonPrimary}`}>
                                Next <ArrowRight size={16}/>
                            </button>
                        ) : (
                            <button onClick={handleDeploy} className={`px-8 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white transform hover:scale-105 transition-all`}>
                                <Check size={16} strokeWidth={3}/> Confirm & Release
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
      );
  };

  // --- MAIN RENDER ---

  const filteredReleases = MOCK_RELEASES.filter(item => {
    if (filterProduct !== 'All' && item.product !== filterProduct) return false;
    if (filterPlatform !== 'All' && item.platform !== filterPlatform) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {isUploadOpen && <UploadWizard />}
      {isReleaseOpen && <ReleaseModal />}
      {isDetailOpen && <DetailEditModal />}
      {isStatusOpen && <StatusManagementModal />}

      {/* Header Banner */}
      <div className={`p-6 rounded-lg border ${styles.card} flex flex-col md:flex-row justify-between items-center gap-6`}>
         <div className="flex items-center gap-4">
             <div className={`p-4 rounded-full ${theme === AppTheme.LIGHT ? 'bg-blue-100 text-blue-600' : 'bg-opacity-20 bg-blue-500 text-blue-400'}`}>
                 <Package size={32} />
             </div>
             <div>
                 <h1 className={`text-2xl font-bold ${styles.textMain}`}>Update Service</h1>
                 <p className={styles.textSub}>Centralized Release Management Console</p>
             </div>
         </div>
         <div className="flex gap-3">
             <button 
               onClick={() => setIsUploadOpen(true)}
               className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-md ${styles.buttonPrimary}`}
             >
                 <Upload size={18} />
                 <span>Upload Wizard</span>
             </button>
         </div>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-lg border ${styles.card} flex flex-col min-h-[600px]`}>
          
          {/* Admin Toolbar */}
          <div className="p-4 border-b border-inherit flex flex-col xl:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-2 items-center">
                 <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-inherit bg-opacity-10 bg-black">
                    <Filter size={16} className={styles.textSub} />
                    <span className={`text-sm font-medium ${styles.textMain}`}>Filters:</span>
                 </div>
                 <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className={`px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500 ${styles.input}`}>
                    <option value="All">All Products</option>
                    {FILTER_OPTIONS.products.map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
                 <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className={`px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500 ${styles.input}`}>
                    <option value="All">All Platforms</option>
                    {FILTER_OPTIONS.platforms.map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
              </div>

              <div className="flex gap-2 w-full xl:w-auto">
                 <div className="relative flex-1 xl:w-64">
                    <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.textSub}`} />
                    <input type="text" placeholder="Search version, filename..." className={`w-full pl-10 pr-4 py-2 rounded-md text-sm border focus:outline-none focus:ring-1 focus:ring-blue-500 ${styles.input}`} />
                 </div>
              </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm border-collapse">
                  <thead>
                      <tr className={styles.header}>
                          <th className="p-4 font-semibold w-12 text-center">Product</th>
                          <th className="p-4 font-semibold">Platform</th>
                          <th className="p-4 font-semibold">Arch</th>
                          <th className="p-4 font-semibold">Series</th>
                          <th className="p-4 font-semibold">Version Info</th>
                          <th className="p-4 font-semibold">Dependencies</th>
                          <th className="p-4 font-semibold">Status</th>
                          <th className="p-4 font-semibold">Channels</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className={styles.textMain}>
                      {filteredReleases.map(item => {
                          const isReleased = item.targets.length > 0;
                          const isDeprecated = item.status === 'deprecated';

                          return (
                          <tr 
                             key={item.id} 
                             className={styles.row}
                             onClick={() => { setSelectedPackage(item); setIsDetailOpen(true); }}
                          >
                              {/* Product */}
                              <td className="p-4 align-top">
                                  <div className="flex items-center gap-2">
                                      {item.product === 'Agent' && <Monitor size={16} className="text-blue-500"/>}
                                      {item.product === 'OTA Img' && <Layers size={16} className="text-purple-500"/>}
                                      {item.product === 'Tool' && <Wrench size={16} className="text-orange-500"/>}
                                      {item.product === 'Library' && <FileBox size={16} className="text-green-500"/>}
                                      <span className="font-medium text-sm">{item.product}</span>
                                  </div>
                              </td>

                              {/* Platform */}
                              <td className="p-4 align-top">
                                  <div className="flex items-center gap-2">
                                          {item.platform === 'Android' && <Smartphone size={16} className="text-green-500"/>}
                                          {item.platform === 'Windows' && <Monitor size={16} className="text-blue-500"/>}
                                          {item.platform === 'Linux' && <Terminal size={16} className="text-orange-500"/>}
                                          <span className="font-medium text-sm">{item.platform}</span>
                                  </div>
                              </td>

                              {/* Architecture */}
                              <td className="p-4 align-top">
                                  <div className={`font-mono text-sm ${styles.textSub}`}>
                                      {item.arch.join(', ')}
                                  </div>
                              </td>

                              {/* Series (Scope Icon Added Here) */}
                              <td className="p-4 align-top">
                                  {item.scope === 'Customized' ? (
                                      <div className="flex items-center gap-1.5 text-amber-500" title={`Customized: ${item.customers?.join(', ')}`}>
                                          <Lock size={14} />
                                          <span className="text-sm font-medium">{item.series}</span>
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-1.5 text-blue-500" title="Generic Release">
                                          <Globe size={14} />
                                          <span className="text-sm font-medium">{item.series}</span>
                                      </div>
                                  )}
                              </td>

                              {/* Version Info */}
                              <td className="p-4 align-top">
                                  <div className="flex flex-col">
                                      <span className="font-mono text-sm font-bold">{item.version}</span>
                                      <span className={`text-[10px] ${styles.textSub} truncate max-w-[120px]`} title={item.filename}>{item.filename}</span>
                                      <span className={`text-[10px] opacity-60`}>{item.size} • {item.uploadedAt}</span>
                                  </div>
                              </td>

                              {/* Dependencies */}
                              <td className="p-4 align-top">
                                  {item.dependencies.isStandalone ? (
                                      <span className={`text-xs ${styles.textSub}`}>Standalone</span>
                                  ) : (
                                      <div className="flex flex-col text-xs">
                                          <span className="opacity-60 text-[10px] uppercase">Requires:</span>
                                          <span className="font-mono">Agent v{item.dependencies.major}.{item.dependencies.minor}</span>
                                      </div>
                                  )}
                              </td>

                              {/* Release Status */}
                              <td className="p-4 align-top">
                                  {isDeprecated ? (
                                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded w-fit border border-red-500/20">
                                          <Ban size={10} /> DEPRECATED
                                      </div>
                                  ) : isReleased ? (
                                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded w-fit border border-green-500/20">
                                          <Rocket size={10} /> RELEASED
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-500/10 px-2 py-1 rounded w-fit border border-gray-500/20">
                                          <Clock size={10} /> NOT RELEASED
                                      </div>
                                  )}
                              </td>

                              {/* Channels */}
                              <td className="p-4 align-top">
                                  {!isDeprecated && isReleased ? (
                                      <div className="flex flex-wrap gap-1 max-w-[120px]">
                                          {item.channels.length > 0 ? item.channels.map(c => (
                                              <Badge key={c} colorClass="bg-blue-500/20 text-blue-400 border border-blue-500/30">{c}</Badge>
                                          )) : (
                                              <span className="text-[10px] opacity-50 italic">No Active Channels</span>
                                          )}
                                      </div>
                                  ) : (
                                      <span className="text-[10px] opacity-30">-</span>
                                  )}
                              </td>

                              {/* Actions */}
                              <td className="p-4 align-top text-right">
                                  <div className="flex flex-col items-end gap-2">
                                      <div className="flex gap-1 mt-1">
                                          <button 
                                            title={isReleased ? "Manage Release" : "Release Now"}
                                            onClick={(e) => { e.stopPropagation(); setSelectedPackage(item); setIsReleaseOpen(true); }}
                                            disabled={item.status === 'deprecated'}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${item.status === 'deprecated' ? 'bg-gray-500 opacity-50 cursor-not-allowed' : (theme === AppTheme.LIGHT ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20')}`}
                                          >
                                              <Rocket size={12} /> {isReleased ? 'Manage' : 'Release'}
                                          </button>
                                      </div>
                                      <div className="flex gap-1 mt-1">
                                          <button 
                                            title="Download Package"
                                            onClick={(e) => e.stopPropagation()} 
                                            className={`p-1.5 rounded hover:bg-gray-500/20 text-gray-400 transition-colors`}
                                          >
                                              <Download size={14} />
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedPackage(item); setIsStatusOpen(true); }}
                                            className={`p-1.5 rounded hover:bg-amber-500/20 text-slate-400 hover:text-amber-500 transition-colors`}
                                            title="Manage Status"
                                          >
                                              <Archive size={14} />
                                          </button>
                                      </div>
                                  </div>
                              </td>
                          </tr>
                          );
                      })}
                  </tbody>
              </table>
              {filteredReleases.length === 0 && (
                  <div className="p-12 text-center opacity-50 flex flex-col items-center gap-2">
                      <Search size={32} />
                      <p>No releases match your filters.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};