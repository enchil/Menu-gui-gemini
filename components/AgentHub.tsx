import React, { useState, useEffect, useMemo } from 'react';
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
  List
} from 'lucide-react';

// --- Types ---
type ProductType = 'Agent' | 'OTA Img' | 'Tool' | 'Library';
type PlatformType = 'Android' | 'Windows' | 'Linux';
type ArchType = 'x86' | 'x86_64' | 'arm' | 'arm64';

interface ReleasePackage {
  id: string;
  product: ProductType;
  platform: PlatformType;
  series: string; // Changed to string to support custom series
  arch: ArchType[];
  supportOS: string[]; 
  version: string;
  filename: string;
  size: string;
  uploadedAt: string;
  status: 'active' | 'deprecated' | 'beta';
  identityKey?: string;
}

// Mock Data
const MOCK_RELEASES: ReleasePackage[] = [
  { 
    id: '1', product: 'Agent', platform: 'Android', series: 'FT-GMS', arch: ['x86_64'], 
    supportOS: ['Android 13'], version: '2.5.0', filename: 'agent-ft-gms-x64-v2.5.apk', 
    size: '24 MB', uploadedAt: '2025-10-20', status: 'active', identityKey: 'KEY-8829-X'
  },
  { 
    id: '2', product: 'Agent', platform: 'Windows', series: 'Windows', arch: ['x86_64'], 
    supportOS: ['Win 10 IoT', 'Win 11'], version: '10.0.19044', filename: 'agent_win_x64.zip', 
    size: '1.2 GB', uploadedAt: '2025-10-18', status: 'active' 
  },
  { 
    id: '3', product: 'Tool', platform: 'Linux', series: 'Universal', arch: ['x86_64'], 
    supportOS: ['Ubuntu 22.04'], version: '1.0.5', filename: 'log-collector-linux.sh', 
    size: '15 KB', uploadedAt: '2025-09-05', status: 'deprecated' 
  },
  { 
    id: '4', product: 'Agent', platform: 'Android', series: 'Aura', arch: ['arm'], 
    supportOS: ['Android 12'], version: '3.1.0-RC1', filename: 'agent-aura-arm.apk', 
    size: '14.5 MB', uploadedAt: '2025-11-01', status: 'beta' 
  },
  { 
    id: '5', product: 'Agent', platform: 'Android', series: 'TD-GMS', arch: ['x86'], 
    supportOS: ['Android 11'], version: '1.0.2', filename: 'agent-td-gms-x86.apk', 
    size: '22 MB', uploadedAt: '2025-11-05', status: 'active', identityKey: 'TD-991-A' 
  },
  // Add a duplicate for testing validation (e.g., trying to add Agent Android FT-GMS 2.5.0 again)
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
    { id: 't1', name: 'AuraOS 5', osVer: 'Android 12', code: 'AuraOS_5/12/x64', platform: 'Android', series: ['Aura'], arch: ['x86_64'] },
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
];

const FILTER_OPTIONS = {
  products: ['Agent', 'OTA Img', 'Tool', 'Library'],
  platforms: ['Android', 'Windows', 'Linux'],
  archs: ['x86', 'x86_64', 'arm', 'arm64'],
};

const KNOWN_CORE_VERSIONS = ['1.2.3', '2.1.0', '3.0.0'];

// --- Logic Helpers ---

// Platform Rule: OTA Img -> Android only.
const getPlatformsForProduct = (product: string): string[] => {
    if (product === 'OTA Img') return ['Android'];
    return ['Android', 'Windows', 'Linux'];
};

const getSeriesForPlatform = (platform: string, product: string): string[] => {
    // Diagram Rule: Agent + Windows -> ['Windows']
    if (product === 'Agent' && platform === 'Windows') {
        return ['Windows'];
    }
    
    switch (platform) {
        case 'Android': return ['Universal', 'Aura', 'FT-AOSP', 'FT-GMS', 'TD-GMS'];
        case 'Windows': return ['Universal']; // For non-Agent products
        case 'Linux': return ['Universal'];
        default: return ['Universal'];
    }
};

const getArchsForConfig = (platform: string, series: string, isCustomSeries: boolean): string[] => {
    // Rule: If custom series, show all valid archs for that platform
    if (isCustomSeries) {
        if (platform === 'Windows') return ['x86', 'x86_64'];
        if (platform === 'Linux') return ['x86', 'x86_64', 'arm', 'arm64'];
        if (platform === 'Android') return ['x86', 'x86_64', 'arm', 'arm64'];
        return ['x86', 'x86_64'];
    }

    // Diagram Rules Implementation
    if (platform === 'Windows') {
        return ['x86', 'x86_64'];
    }
    if (platform === 'Linux') {
        return ['x86', 'x86_64', 'arm', 'arm64'];
    }
    if (platform === 'Android') {
        if (series === 'Universal') return ['x86', 'x86_64'];
        if (series === 'Aura') return ['arm'];
        if (['FT-AOSP', 'FT-GMS', 'TD-GMS'].includes(series)) return ['x86', 'x86_64'];
    }
    return ['x86', 'x86_64'];
};


// --- Wizard & Release Types ---
type ReleaseChannel = 'Production' | 'Test' | 'Beta' | 'Experimental';
type ReleaseTarget = 'Spotlight Download Page' | 'Automation Update Service';

export const AgentHub: React.FC = () => {
  const { theme } = useApp();
  
  // UI States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ReleasePackage | null>(null);

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
          row: 'hover:bg-[#44475a]/50 border-b border-[#44475a]',
          input: 'bg-[#44475a] text-white border-[#6272a4]',
          buttonPrimary: 'bg-[#bd93f9] text-[#282a36] hover:bg-[#ff79c6]',
          badge: 'bg-[#44475a] text-[#8be9fd] border border-[#6272a4]',
          modalOverlay: 'bg-[#282a36]/90',
          modalBg: 'bg-[#282a36] border-[#bd93f9]',
          stepActive: 'bg-[#bd93f9] text-[#282a36]',
          stepInactive: 'bg-[#44475a] text-[#6272a4]',
          inputGroup: 'bg-[#44475a] border-[#6272a4] text-white'
        };
      case AppTheme.LIGHT:
        return {
          card: 'bg-white border-gray-200 shadow-sm',
          textMain: 'text-slate-800',
          textSub: 'text-slate-500',
          header: 'bg-gray-50 text-slate-700 font-semibold',
          row: 'hover:bg-blue-50 border-b border-gray-100',
          input: 'bg-white border-gray-300 text-slate-800',
          buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-700',
          badge: 'bg-blue-50 text-blue-700 border border-blue-200',
          modalOverlay: 'bg-slate-900/50',
          modalBg: 'bg-white border-blue-500',
          stepActive: 'bg-blue-600 text-white',
          stepInactive: 'bg-white border-2 border-gray-200 text-gray-400',
          inputGroup: 'bg-white border-gray-300 text-slate-800'
        };
      case AppTheme.DARK:
      default:
        return {
          card: 'bg-slate-800 border-slate-700 shadow-md',
          textMain: 'text-gray-200',
          textSub: 'text-gray-400',
          header: 'bg-slate-900/50 text-gray-300 font-semibold',
          row: 'hover:bg-slate-700 border-b border-slate-700/50',
          input: 'bg-slate-900 border-slate-600 text-gray-200',
          buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-500',
          badge: 'bg-slate-700 text-blue-400 border border-slate-600',
          modalOverlay: 'bg-slate-900/80',
          modalBg: 'bg-slate-800 border-slate-600',
          stepActive: 'bg-blue-500 text-white',
          stepInactive: 'bg-slate-800 border-2 border-slate-600 text-gray-500',
          inputGroup: 'bg-slate-900 border-slate-600 text-gray-200'
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

  // --- WIZARD COMPONENT ---
  const UploadWizard = () => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    
    // Form Data
    const [formData, setFormData] = useState({
      product: 'Agent',
      platform: 'Android',
      series: 'Universal',
      customSeries: '', // To store new series name
      arch: 'x86_64',
      versionMajor: '3',
      versionMinor: '1',
      versionPatch: '0',
      isStandalone: false,
      depMajor: '',
      depMinor: '',
      depPatch: '',
      releaseNotes: '# New Features\n- Added support for custom peripheral X\n- Improved memory management\n\n## Bug Fixes\n- Fixed memory leak in serial driver',
      description: '',
      selectedTargets: [] as string[]
    });

    const [isCustomSeriesMode, setIsCustomSeriesMode] = useState(false);

    const steps = [
        { id: 1, label: 'MANIFEST' },
        { id: 2, label: 'COMPATIBILITY' },
        { id: 3, label: 'UPLOAD' },
        { id: 4, label: 'DOCS' }
    ];

    // -- State Management for Dependencies --

    // Reset Platform if Product changes (Rule: OTA Img -> Android)
    useEffect(() => {
        const validPlatforms = getPlatformsForProduct(formData.product);
        if (!validPlatforms.includes(formData.platform)) {
            setFormData(prev => ({ ...prev, platform: validPlatforms[0] }));
        }
    }, [formData.product]);

    // Reset Series/Arch when Platform Changes
    useEffect(() => {
        setIsCustomSeriesMode(false); // Reset custom mode on platform change
        const validSeries = getSeriesForPlatform(formData.platform, formData.product);
        // Default to first available series
        if (!validSeries.includes(formData.series)) {
            setFormData(prev => ({ ...prev, series: validSeries[0], customSeries: '' }));
        }
    }, [formData.platform, formData.product]);

    // Reset Arch when Series Changes
    useEffect(() => {
        const currentSeries = isCustomSeriesMode ? formData.customSeries : formData.series;
        const validArchs = getArchsForConfig(formData.platform, currentSeries, isCustomSeriesMode);
        if (!validArchs.includes(formData.arch)) {
            setFormData(prev => ({ ...prev, arch: validArchs[0] }));
        }
    }, [formData.platform, formData.series, isCustomSeriesMode, formData.customSeries]);

    // Reset selected targets when config changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, selectedTargets: [] }));
    }, [formData.platform, formData.series, formData.arch, isCustomSeriesMode]);


    const toggleTarget = (target: string) => {
        setFormData(prev => ({
            ...prev,
            selectedTargets: prev.selectedTargets.includes(target) 
                ? prev.selectedTargets.filter(t => t !== target)
                : [...prev.selectedTargets, target]
        }));
    };

    // Validation Logic
    const fullVersion = `${formData.versionMajor}.${formData.versionMinor}.${formData.versionPatch}`;
    
    // Check for duplicates
    const isDuplicateVersion = useMemo(() => {
        return MOCK_RELEASES.some(r => 
            r.product === formData.product &&
            r.platform === formData.platform &&
            r.version === fullVersion &&
            // Loose matching for series/arch for simplicity, or strict?
            // Let's assume strict uniqueness on Product+Platform+Version+Arch for this example
            r.arch.includes(formData.arch as any)
        );
    }, [formData.product, formData.platform, fullVersion, formData.arch]);

    const depVersion = `${formData.depMajor}.${formData.depMinor}.${formData.depPatch}`;
    const showDepWarning = !formData.isStandalone && 
                           formData.depMajor && 
                           formData.depMinor && 
                           formData.depPatch && 
                           !KNOWN_CORE_VERSIONS.includes(depVersion);

    // Get Existing Versions for display
    const existingVersions = useMemo(() => {
        return MOCK_RELEASES
            .filter(r => 
                r.product === formData.product && 
                r.platform === formData.platform && 
                (isCustomSeriesMode || r.series === formData.series)
            )
            .map(r => r.version);
    }, [formData.product, formData.platform, formData.series, isCustomSeriesMode]);


    // Step 1: Manifest
    const renderStep1_Manifest = () => {
        const availablePlatforms = getPlatformsForProduct(formData.product);
        const availableSeries = getSeriesForPlatform(formData.platform, formData.product);
        const availableArchs = getArchsForConfig(formData.platform, isCustomSeriesMode ? formData.customSeries : formData.series, isCustomSeriesMode);

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Row 1: Product, Platform, Series */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Product</label>
                        <select 
                            className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${styles.input}`}
                            value={formData.product}
                            onChange={(e) => setFormData({...formData, product: e.target.value})}
                        >
                            {FILTER_OPTIONS.products.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Platform</label>
                        <select 
                            className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${styles.input}`}
                            value={formData.platform}
                            onChange={(e) => setFormData({...formData, platform: e.target.value})}
                        >
                            {availablePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Series</label>
                        
                        {isCustomSeriesMode ? (
                            <div className="relative">
                                <input 
                                    type="text"
                                    autoFocus
                                    placeholder="Enter Series Name"
                                    value={formData.customSeries}
                                    onChange={(e) => setFormData({...formData, customSeries: e.target.value})}
                                    className={`w-full pl-3 pr-8 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${styles.input}`}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <span className="text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase">New</span>
                                    <button 
                                        onClick={() => setIsCustomSeriesMode(false)}
                                        className="p-1 hover:text-red-500"
                                        title="Cancel custom series"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <select 
                                className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${styles.input}`}
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
                                {availableSeries.map(p => <option key={p} value={p}>{p}</option>)}
                                <option value="__NEW__" className="font-bold text-blue-500">+ Create New Series...</option>
                            </select>
                        )}
                    </div>
                </div>

                {/* Row 2: Architecture (Identity Key Removed) */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Architecture</label>
                        <div className={`relative`}>
                            <Cpu size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.textSub}`} />
                            <select 
                                className={`w-full pl-10 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${styles.input}`}
                                value={formData.arch}
                                onChange={(e) => setFormData({...formData, arch: e.target.value})}
                            >
                                {availableArchs.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Row 3: Version Number */}
                <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Version Number</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={formData.versionMajor} 
                            onChange={e=>setFormData({...formData, versionMajor: e.target.value})} 
                            className={`flex-1 text-center p-3 rounded-lg border outline-none focus:ring-2 font-bold ${isDuplicateVersion ? 'bg-red-50 border-red-300 text-red-600 focus:ring-red-500' : `${styles.input} focus:ring-blue-500`}`}
                            placeholder="Major" 
                        />
                        <span className={styles.textSub}>.</span>
                        <input 
                            type="text" 
                            value={formData.versionMinor} 
                            onChange={e=>setFormData({...formData, versionMinor: e.target.value})} 
                            className={`flex-1 text-center p-3 rounded-lg border outline-none focus:ring-2 font-bold ${isDuplicateVersion ? 'bg-red-50 border-red-300 text-red-600 focus:ring-red-500' : `${styles.input} focus:ring-blue-500`}`}
                            placeholder="Minor" 
                        />
                        <span className={styles.textSub}>.</span>
                        <input 
                            type="text" 
                            value={formData.versionPatch} 
                            onChange={e=>setFormData({...formData, versionPatch: e.target.value})} 
                            className={`flex-1 text-center p-3 rounded-lg border outline-none focus:ring-2 font-bold ${isDuplicateVersion ? 'bg-red-50 border-red-300 text-red-600 focus:ring-red-500' : `${styles.input} focus:ring-blue-500`}`}
                            placeholder="Patch" 
                        />
                    </div>
                    
                    {isDuplicateVersion && (
                         <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1">
                            <AlertTriangle size={12} />
                            <span>Version {fullVersion} already exists for this configuration.</span>
                        </div>
                    )}

                    <div className={`mt-2 p-3 rounded-lg border ${theme === AppTheme.LIGHT ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
                        <span className={`text-xs font-bold ${styles.textSub}`}>EXISTING VERSIONS ({existingVersions.length})</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {existingVersions.length > 0 ? existingVersions.map(v => (
                                <span key={v} className={`inline-block px-2 py-1 rounded text-xs font-mono border ${theme === AppTheme.LIGHT ? 'bg-white border-gray-300' : 'bg-black/30 border-gray-600'}`}>v{v}</span>
                            )) : (
                                <span className="text-xs opacity-50 italic">No previous versions found.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 4: Dependencies */}
                <div className={`p-4 rounded-lg border ${styles.input}`}>
                    <div className="flex justify-between items-center mb-4">
                        <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Dependencies (Core Version)</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={formData.isStandalone} 
                                onChange={e => setFormData({...formData, isStandalone: e.target.checked})}
                                className="rounded text-blue-600 focus:ring-blue-500" 
                            />
                            <span className={`text-sm ${styles.textMain}`}>Standalone Version</span>
                        </label>
                    </div>
                    <div className={`flex items-center gap-2 transition-opacity ${formData.isStandalone ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                        <input type="text" value={formData.depMajor} onChange={e=>setFormData({...formData, depMajor: e.target.value})} className={`flex-1 text-center p-2 rounded border outline-none focus:ring-2 focus:ring-blue-500 ${styles.inputGroup}`} placeholder="Major" />
                        <span className={styles.textSub}>.</span>
                        <input type="text" value={formData.depMinor} onChange={e=>setFormData({...formData, depMinor: e.target.value})} className={`flex-1 text-center p-2 rounded border outline-none focus:ring-2 focus:ring-blue-500 ${styles.inputGroup}`} placeholder="Minor" />
                        <span className={styles.textSub}>.</span>
                        <input type="text" value={formData.depPatch} onChange={e=>setFormData({...formData, depPatch: e.target.value})} className={`flex-1 text-center p-2 rounded border outline-none focus:ring-2 focus:ring-blue-500 ${styles.inputGroup}`} placeholder="Patch" />
                    </div>
                    <p className={`text-xs mt-2 ${styles.textSub}`}>Specify the Universal Agent version this package depends on.</p>
                    
                    {showDepWarning && (
                        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-md text-xs flex gap-2 items-start">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <span>Warning: Core version {depVersion} was not found in the registry. Ensure you are referencing a valid stable release.</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Step 2: Compatibility
    const renderStep2_Compatibility = () => {
        const currentSeries = isCustomSeriesMode ? formData.customSeries : formData.series;

        const availableTargets = MOCK_TARGETS.filter(t => {
            if (t.platform !== formData.platform) return false;
            if (!t.arch.includes(formData.arch)) return false;
            
            // If Custom Series, matching Platform + Arch is sufficient
            if (isCustomSeriesMode) return true;

            // Otherwise, match Series (or Universal)
            return t.series.includes(formData.series) || t.series.includes('Universal');
        });
        
        return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Summary Banner */}
            <div className={`flex p-4 rounded-lg border mb-6 ${theme === AppTheme.LIGHT ? 'bg-blue-50 border-blue-100' : 'bg-blue-500/10 border-blue-500/20'}`}>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-x-6 gap-y-4 w-full">
                    <div>
                        <span className={`text-xs font-bold uppercase block text-blue-500/70 mb-1`}>Product</span>
                        <span className={`font-medium ${styles.textMain}`}>{formData.product}</span>
                    </div>
                    <div>
                        <span className={`text-xs font-bold uppercase block text-blue-500/70 mb-1`}>Platform</span>
                        <span className={`font-medium ${styles.textMain}`}>{formData.platform}</span>
                    </div>
                    <div>
                        <span className={`text-xs font-bold uppercase block text-blue-500/70 mb-1`}>Series</span>
                        <span className={`font-medium ${styles.textMain}`}>
                            {currentSeries || 'Untitled'} 
                            {isCustomSeriesMode && <span className="ml-2 text-[9px] bg-blue-500 text-white px-1 rounded">NEW</span>}
                        </span>
                    </div>
                    <div>
                        <span className={`text-xs font-bold uppercase block text-blue-500/70 mb-1`}>Arch</span>
                        <span className={`font-medium ${styles.textMain}`}>{formData.arch}</span>
                    </div>
                    <div>
                        <span className={`text-xs font-bold uppercase block text-blue-500/70 mb-1`}>Version</span>
                        <span className={`font-medium ${styles.textMain}`}>v{fullVersion}</span>
                    </div>
                     <div>
                        <span className={`text-xs font-bold uppercase block text-blue-500/70 mb-1`}>Dependencies</span>
                        <span className={`font-medium ${styles.textMain} text-sm`}>
                            {formData.isStandalone ? 'Standalone' : `Core v${formData.depMajor}.${formData.depMinor || 'x'}.${formData.depPatch || 'x'}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Unified View for OS Targets */}
            <div className={`flex-1 border rounded-lg overflow-hidden flex flex-col ${styles.input}`}>
                 <div className={`p-3 border-b flex justify-between items-center ${theme === AppTheme.DRACULA ? 'border-[#6272a4]' : 'border-gray-200'} bg-opacity-50 ${theme === AppTheme.LIGHT ? 'bg-gray-50' : 'bg-black/20'}`}>
                     <span className={`text-xs font-bold uppercase ${styles.textSub}`}>Supported OS Targets</span>
                     <div className="flex gap-2">
                        <span className="text-xs opacity-50 flex items-center gap-1"><Filter size={10}/> {formData.arch}</span>
                     </div>
                </div>
                
                <div className="p-2 space-y-2 overflow-y-auto flex-1">
                    {availableTargets.length > 0 ? (
                        availableTargets.map(target => (
                            <div 
                                key={target.id}
                                onClick={() => toggleTarget(target.id)}
                                className={`
                                    p-3 rounded-md border cursor-pointer transition-all flex items-center justify-between gap-3 group
                                    ${formData.selectedTargets.includes(target.id) 
                                        ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500' 
                                        : 'border-transparent hover:bg-gray-500/10'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.selectedTargets.includes(target.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-400 group-hover:border-blue-400'}`}>
                                        {formData.selectedTargets.includes(target.id) && <Check size={14} className="text-white"/>}
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold ${styles.textMain} flex items-center gap-2`}>
                                            {target.name}
                                            <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${styles.badge}`}>{target.osVer}</span>
                                        </div>
                                        <div className={`text-xs font-mono opacity-50`}>{target.code}</div>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-50">
                                    <Info size={16} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 p-4 text-center">
                            <Search size={24} className="mb-2" />
                            <p className="text-sm">No compatible OS targets found for {formData.platform} ({formData.arch}).</p>
                        </div>
                    )}
                </div>
                <div className="p-2 border-t border-inherit text-xs text-right opacity-50">
                    Selected: {formData.selectedTargets.length} targets
                </div>
            </div>
        </div>
        );
    };

    // Step 3: Upload
    const renderStep3_Upload = () => {
        const fullVersion = `${formData.versionMajor}.${formData.versionMinor}.${formData.versionPatch}`;
        return (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Info Banner */}
                <div className={`py-2 px-4 rounded-md mb-6 flex items-center justify-center gap-2 text-sm font-medium ${theme === AppTheme.LIGHT ? 'bg-blue-50 text-blue-700' : 'bg-blue-500/20 text-blue-300'}`}>
                    <Package size={16} />
                    <span>Upload Package for <strong>{formData.product}</strong> v{fullVersion}</span>
                </div>

                {/* Drop Zone / File Card */}
                <div className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative ${styles.input} border-opacity-50`}>
                    
                    {!file ? (
                        <div className="text-center p-8 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload size={32} />
                            </div>
                            <h3 className={`text-lg font-bold mb-1 ${styles.textMain}`}>Drag & Drop your package here</h3>
                            <p className={`text-sm ${styles.textSub} mb-4`}>or click to browse local files</p>
                            <button className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${styles.buttonPrimary}`}>
                                Browse Files
                            </button>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { if(e.target.files?.[0]) setFile(e.target.files[0]) }} />
                        </div>
                    ) : (
                        <div className="text-center p-8 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-blue-600 text-white rounded-xl shadow-xl flex items-center justify-center mx-auto mb-6">
                                <FileBox size={40} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${styles.textMain}`}>{file.name}</h3>
                            <p className={`text-sm ${styles.textSub} mb-8`}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            
                            <button 
                                onClick={() => setFile(null)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors mx-auto"
                            >
                                <Trash2 size={16} />
                                <span>Remove File</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Step 4: Docs
    const renderStep4_Docs = () => (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Release Notes (Markdown)</label>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => setIsPreviewMode(false)}
                            className={`px-3 py-1.5 text-xs rounded-l border-y border-l transition-colors flex items-center gap-1 ${!isPreviewMode ? 'bg-blue-500 text-white border-blue-500' : `${styles.input} hover:bg-gray-500/10`}`}
                        >
                            <PenTool size={10} /> Write
                        </button>
                        <button 
                             onClick={() => setIsPreviewMode(true)}
                             className={`px-3 py-1.5 text-xs rounded-r border transition-colors flex items-center gap-1 ${isPreviewMode ? 'bg-blue-500 text-white border-blue-500' : `${styles.input} hover:bg-gray-500/10`}`}
                        >
                            <Eye size={10} /> Preview
                        </button>
                    </div>
                </div>
                
                {isPreviewMode ? (
                     <div className={`flex-1 w-full p-4 rounded-lg border overflow-y-auto font-mono text-sm ${styles.input}`}>
                         {formData.releaseNotes.split('\n').map((line, i) => {
                             if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mb-2 pb-1 border-b border-gray-500/20">{line.replace('# ', '')}</h1>;
                             if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace('## ', '')}</h2>;
                             if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
                             if (line.trim() === '') return <br key={i}/>;
                             return <p key={i}>{line}</p>;
                         })}
                         {!formData.releaseNotes && <p className="opacity-50 italic">Nothing to preview.</p>}
                     </div>
                ) : (
                    <textarea 
                        className={`flex-1 w-full p-4 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none ${styles.input}`}
                        value={formData.releaseNotes}
                        onChange={(e) => setFormData({...formData, releaseNotes: e.target.value})}
                        placeholder="# Title..."
                    />
                )}

                <div className="text-right mt-1">
                    <span className="text-xs opacity-50">Supports: # Header, - List, **Bold**</span>
                </div>
            </div>

            <div className="flex flex-col">
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 ${styles.textSub}`}>Description (Optional)</label>
                <input 
                    type="text" 
                    className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${styles.input}`}
                    placeholder="Brief description for the dashboard card..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>
        </div>
    );

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${styles.modalOverlay}`}>
        <div className={`w-full max-w-3xl rounded-xl shadow-2xl border flex flex-col h-[700px] max-h-[90vh] ${styles.modalBg}`}>
          
          {/* Header */}
          <div className="p-6 border-b border-inherit">
            <div className="flex justify-between items-start mb-8">
                <h2 className={`text-xl font-bold ${styles.textMain}`}>Upload Custom Agent</h2>
                <button onClick={() => setIsUploadOpen(false)} className={`${styles.textSub} hover:text-red-500 transition-colors`}>
                    <X size={24} />
                </button>
            </div>
            
            {/* Custom Stepper */}
            <div className="flex items-center justify-between px-12 relative">
                {/* Connector Line */}
                <div className="absolute left-16 right-16 top-5 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
                
                {steps.map((s) => {
                    const isActive = step === s.id;
                    const isCompleted = step > s.id;
                    
                    return (
                        <div key={s.id} className="flex flex-col items-center gap-3 bg-inherit px-2 z-10">
                            <div 
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm
                                    ${isActive || isCompleted ? styles.stepActive : styles.stepInactive}
                                    ${isActive ? 'ring-4 ring-blue-500/20 scale-110' : ''}
                                `}
                            >
                                {isCompleted ? <Check size={18}/> : s.id}
                            </div>
                            <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${isActive ? 'text-blue-500' : styles.textSub}`}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto flex-1 bg-opacity-50">
             {step === 1 && renderStep1_Manifest()}
             {step === 2 && renderStep2_Compatibility()}
             {step === 3 && renderStep3_Upload()}
             {step === 4 && renderStep4_Docs()}
          </div>

          {/* Footer Navigation */}
          <div className="p-6 border-t border-inherit flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
             
             {/* Left Actions */}
             <div>
                <button 
                    onClick={() => setIsUploadOpen(false)}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors text-red-500 hover:bg-red-500/10`}
                >
                    Cancel
                </button>
             </div>

             {/* Right Actions */}
             <div className="flex gap-3">
                {step > 1 && (
                    <button 
                        onClick={() => setStep(step - 1)} 
                        className={`px-6 py-2.5 rounded-lg font-medium transition-colors border ${theme === AppTheme.LIGHT ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-transparent border-gray-600 hover:bg-white/5'} ${styles.textMain}`}
                    >
                        Back
                    </button>
                )}
                
                <button 
                    onClick={() => {
                        if (step < 4) {
                            // Validation Block
                            if(step === 3 && !file) return; 
                            setStep(step + 1);
                        } else {
                            setIsUploadOpen(false); // Submit
                        }
                    }}
                    disabled={step === 3 && !file}
                    className={`
                        px-8 py-2.5 rounded-lg font-medium shadow-lg transition-all flex items-center gap-2
                        ${step === 3 && !file ? 'opacity-50 cursor-not-allowed bg-gray-500 text-white' : styles.buttonPrimary}
                    `}
                >
                    {step === 4 ? 'Confirm Upload' : 'Next Step'}
                    {step < 4 && <ArrowRight size={16} />}
                </button>
             </div>
          </div>

        </div>
      </div>
    );
  };

  // --- RELEASE MODAL COMPONENT ---
  const ReleaseModal = () => {
      const [channels, setChannels] = useState<ReleaseChannel[]>([]);
      const [targets, setTargets] = useState<ReleaseTarget[]>([]);

      const toggleChannel = (c: ReleaseChannel) => 
         setChannels(prev => prev.includes(c) ? prev.filter(i => i !== c) : [...prev, c]);

      const toggleTarget = (t: ReleaseTarget) =>
         setTargets(prev => prev.includes(t) ? prev.filter(i => i !== t) : [...prev, t]);

      return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${styles.modalOverlay}`}>
            <div className={`w-full max-w-xl rounded-xl shadow-2xl border flex flex-col ${styles.modalBg}`}>
                <div className="p-6 border-b border-inherit flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <Rocket size={20} />
                        </div>
                        <div>
                            <h2 className={`text-lg font-bold ${styles.textMain}`}>Deploy Release</h2>
                            <p className={`text-xs ${styles.textSub} font-mono`}>{selectedPackage?.filename}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsReleaseOpen(false)} className={styles.textSub}><X size={20}/></button>
                </div>

                <div className="p-6 space-y-8">
                    {/* 1. Select Channels */}
                    <div>
                        <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${styles.textSub}`}>
                            <Beaker size={14} /> 1. Select Channels
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {['Production', 'Test', 'Beta', 'Experimental'].map((channel) => (
                                <label 
                                    key={channel}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                        ${channels.includes(channel as any) 
                                            ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500' 
                                            : styles.input + ' hover:border-gray-500'}
                                    `}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={channels.includes(channel as any)}
                                        onChange={() => toggleChannel(channel as any)}
                                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                    />
                                    <span className={`font-medium ${styles.textMain}`}>{channel}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 2. Select Targets */}
                    <div>
                         <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${styles.textSub}`}>
                            <Globe size={14} /> 2. Release To
                        </h3>
                        <div className="space-y-3">
                            <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${targets.includes('Spotlight Download Page') ? 'border-purple-500 bg-purple-500/10' : styles.input}`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 text-purple-500 rounded"><Globe size={18}/></div>
                                    <div>
                                        <div className={`font-medium ${styles.textMain}`}>Spotlight Download Page</div>
                                        <div className="text-xs opacity-60">Public download center for end-users</div>
                                    </div>
                                </div>
                                <input type="checkbox" className="w-5 h-5 rounded text-purple-500" checked={targets.includes('Spotlight Download Page')} onChange={() => toggleTarget('Spotlight Download Page')} />
                            </label>

                            <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${targets.includes('Automation Update Service') ? 'border-orange-500 bg-orange-500/10' : styles.input}`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/20 text-orange-500 rounded"><Zap size={18}/></div>
                                    <div>
                                        <div className={`font-medium ${styles.textMain}`}>Automation Update Service</div>
                                        <div className="text-xs opacity-60">Push to OTA servers and connected devices</div>
                                    </div>
                                </div>
                                <input type="checkbox" className="w-5 h-5 rounded text-orange-500" checked={targets.includes('Automation Update Service')} onChange={() => toggleTarget('Automation Update Service')} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-inherit flex justify-end gap-3 bg-opacity-50 bg-black/5">
                    <button onClick={() => setIsReleaseOpen(false)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${styles.textSub} hover:text-white`}>
                        Cancel
                    </button>
                    <button 
                        className={`px-6 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2 transition-all ${channels.length > 0 && targets.length > 0 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-600 cursor-not-allowed text-gray-400'}`}
                        disabled={channels.length === 0 || targets.length === 0}
                        onClick={() => setIsReleaseOpen(false)}
                    >
                        <Rocket size={18} />
                        Deploy Release
                    </button>
                </div>
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
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                 <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-inherit bg-opacity-10 bg-black">
                    <Filter size={16} className={styles.textSub} />
                    <span className={`text-sm font-medium ${styles.textMain}`}>Filters:</span>
                 </div>
                 
                 {/* Product Filter */}
                 <select 
                    value={filterProduct}
                    onChange={(e) => setFilterProduct(e.target.value)}
                    className={`px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500 ${styles.input}`}
                 >
                    <option value="All">All Products</option>
                    {FILTER_OPTIONS.products.map(p => <option key={p} value={p}>{p}</option>)}
                 </select>

                 {/* Platform Filter */}
                 <select 
                    value={filterPlatform}
                    onChange={(e) => setFilterPlatform(e.target.value)}
                    className={`px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500 ${styles.input}`}
                 >
                    <option value="All">All Platforms</option>
                    {FILTER_OPTIONS.platforms.map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
              </div>

              {/* Search */}
              <div className="flex gap-2 w-full xl:w-auto">
                 <div className="relative flex-1 xl:w-64">
                    <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.textSub}`} />
                    <input 
                        type="text" 
                        placeholder="Search version, filename..." 
                        className={`w-full pl-10 pr-4 py-2 rounded-md text-sm border focus:outline-none focus:ring-1 focus:ring-blue-500 ${styles.input}`}
                    />
                 </div>
              </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm border-collapse">
                  <thead>
                      <tr className={styles.header}>
                          <th className="p-4 font-semibold w-12">Product</th>
                          <th className="p-4 font-semibold">Platform & Series</th>
                          <th className="p-4 font-semibold">Architecture</th>
                          <th className="p-4 font-semibold">Support OS</th>
                          <th className="p-4 font-semibold">Version Info</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className={styles.textMain}>
                      {filteredReleases.map(item => (
                          <tr key={item.id} className={styles.row}>
                              {/* Product */}
                              <td className="p-4 align-top">
                                  <div className="flex flex-col items-center gap-1 w-16">
                                      {item.product === 'Agent' && <div className="p-2 rounded bg-blue-500/20 text-blue-500"><Monitor size={20}/></div>}
                                      {item.product === 'OTA Img' && <div className="p-2 rounded bg-purple-500/20 text-purple-500"><Layers size={20}/></div>}
                                      {item.product === 'Tool' && <div className="p-2 rounded bg-orange-500/20 text-orange-500"><Wrench size={20}/></div>}
                                      {item.product === 'Library' && <div className="p-2 rounded bg-green-500/20 text-green-500"><FileBox size={20}/></div>}
                                      <span className="text-xs font-bold text-center">{item.product}</span>
                                  </div>
                              </td>

                              {/* Platform & Series */}
                              <td className="p-4 align-top">
                                  <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                          {item.platform === 'Android' && <Smartphone size={14} className="text-green-500"/>}
                                          {item.platform === 'Windows' && <Monitor size={14} className="text-blue-500"/>}
                                          {item.platform === 'Linux' && <Terminal size={14} className="text-orange-500"/>}
                                          <span className="font-medium">{item.platform}</span>
                                      </div>
                                      <div className={`text-xs px-2 py-0.5 rounded-md inline-block w-fit bg-opacity-20 bg-gray-500`}>
                                          Series: {item.series}
                                      </div>
                                  </div>
                              </td>

                              {/* Arch */}
                              <td className="p-4 align-top">
                                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                                      {item.arch.map(a => (
                                          <Badge key={a} colorClass="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">{a}</Badge>
                                      ))}
                                  </div>
                              </td>

                              {/* Support OS */}
                              <td className="p-4 align-top">
                                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                                      {item.supportOS.map((os, i) => (
                                          <Badge key={i}>{os}</Badge>
                                      ))}
                                  </div>
                              </td>

                              {/* Version Info */}
                              <td className="p-4 align-top">
                                  <div className="flex flex-col">
                                      <span className="font-mono text-base font-bold">{item.version}</span>
                                      <span className={`text-xs ${styles.textSub} truncate max-w-[150px]`} title={item.filename}>{item.filename}</span>
                                      <span className={`text-xs opacity-60`}>{item.size} • {item.uploadedAt}</span>
                                      {item.identityKey && (
                                          <span className="text-[10px] text-amber-500 flex items-center gap-1 mt-1">
                                              <Key size={10} /> Key Required
                                          </span>
                                      )}
                                  </div>
                              </td>

                              {/* Actions */}
                              <td className="p-4 align-top text-right">
                                  <div className="flex flex-col items-end gap-2">
                                      <div className="flex gap-1 mt-1">
                                          <button 
                                            title="Release Flow"
                                            onClick={() => { setSelectedPackage(item); setIsReleaseOpen(true); }}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${theme === AppTheme.LIGHT ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'}`}
                                          >
                                              <Rocket size={14} /> Release
                                          </button>
                                          
                                      </div>
                                      <div className="flex gap-1 mt-1">
                                          <button className={`p-1.5 rounded hover:bg-gray-500/20 text-gray-400 transition-colors`}>
                                              <Download size={16} />
                                          </button>
                                          <button className={`p-1.5 rounded hover:bg-red-500/20 text-red-500 transition-colors`}>
                                              <Trash2 size={16} />
                                          </button>
                                      </div>
                                  </div>
                              </td>
                          </tr>
                      ))}
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