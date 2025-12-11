import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AppTheme } from '../types';
import { 
  Server, 
  Plus, 
  Search, 
  Users, 
  Monitor, 
  Smartphone, 
  Cpu, 
  Box, 
  Trash2,
  X, 
  Check,
  Building2,
  Copy,
  Archive,
  Layers,
  Terminal,
  Wrench,
  FileBox,
  Globe,
  Lock,
  AlertCircle
} from 'lucide-react';

// --- Types ---
interface AppClient {
  id: string;
  product: string;
  platform: 'Android' | 'Windows' | 'Linux';
  series: string;
  arch: string;
  productKey: string;
  fileCount: number;
  accessType: 'Public' | 'Customized'; // New Field
  customers: string[]; // Bound customers (Empty if Public)
  createdAt: string;
}

// Mock Data Source for "Existing Customers"
const MOCK_EXISTING_CUSTOMERS = [
  'RetailCorp', 
  'FastFood Chain A', 
  'Bank of Innovation', 
  'Gov Dept', 
  'TechGiant Inc', 
  'Local School District', 
  'Logistics Co', 
  'HealthCare Plus'
];

const MOCK_CLIENTS: AppClient[] = [
  { 
      id: 'c1', product: 'Agent', platform: 'Android', series: 'FT-GMS', arch: 'x86_64', 
      productKey: 'PROD-8821-X', fileCount: 12, accessType: 'Customized',
      customers: ['RetailCorp', 'FastFood Chain A'], createdAt: '2025-01-10' 
  },
  { 
      id: 'c2', product: 'Agent', platform: 'Windows', series: 'Universal', arch: 'x86_64', 
      productKey: 'WIN-9921-A', fileCount: 5, accessType: 'Public',
      customers: [], createdAt: '2025-01-12' 
  },
  { 
      id: 'c3', product: 'OTA Img', platform: 'Android', series: 'Aura', arch: 'arm64', 
      productKey: 'OTA-0012-Z', fileCount: 0, accessType: 'Customized',
      customers: [], // Needs binding warning
      createdAt: '2025-02-01' 
  },
  {
      id: 'c4', product: 'Tool', platform: 'Linux', series: 'Universal', arch: 'x86_64',
      productKey: 'TOOL-LIN-01', fileCount: 3, accessType: 'Public',
      customers: [], createdAt: '2025-02-15'
  }
];

export const AppClientList: React.FC = () => {
  const { theme } = useApp();
  const [clients, setClients] = useState<AppClient[]>(MOCK_CLIENTS);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<AppClient | null>(null);

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
        };
    }
  };
  const styles = getStyles();

  // --- Components ---

  const Badge: React.FC<{ icon?: any, children: React.ReactNode, className?: string }> = ({ icon: Icon, children, className }) => (
    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${styles.badge} ${className || ''}`}>
      {Icon && <Icon size={10} />}
      {children}
    </span>
  );

  const CreateClientModal = () => {
    const [form, setForm] = useState({ 
        product: 'Agent', 
        platform: 'Android', 
        series: '', 
        arch: 'x86_64',
        accessType: 'Public' as 'Public' | 'Customized',
        selectedCustomer: '' 
    });

    const handleSubmit = () => {
       const newClient: AppClient = {
           id: `c-${Date.now()}`,
           ...form,
           platform: form.platform as any,
           productKey: `${form.product.toUpperCase().slice(0,3)}-${Math.floor(Math.random()*10000)}-${form.platform.toUpperCase().slice(0,1)}`,
           fileCount: 0,
           // If customized, add the selected customer immediately
           customers: form.accessType === 'Customized' && form.selectedCustomer ? [form.selectedCustomer] : [],
           createdAt: new Date().toISOString().split('T')[0]
       };
       setClients([...clients, newClient]);
       setIsCreateOpen(false);
    };

    const isSubmitDisabled = form.accessType === 'Customized' && !form.selectedCustomer;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${styles.modalOverlay}`}>
            <div className={`w-full max-w-md rounded-xl shadow-2xl border p-6 ${styles.modalBg}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-lg font-bold ${styles.textMain}`}>Create App Client</h3>
                    <button onClick={() => setIsCreateOpen(false)}><X size={20} className={styles.textSub}/></button>
                </div>
                <div className="space-y-5">
                    
                    {/* Access Scope Section */}
                    <div className={`p-4 rounded-lg border ${styles.input} space-y-3`}>
                        <div className="flex justify-between items-center">
                            <label className={`text-xs uppercase font-bold ${styles.textSub}`}>Access Type</label>
                            {form.accessType === 'Public' ? <Globe size={14} className="text-blue-500"/> : <Lock size={14} className="text-amber-500"/>}
                        </div>
                        <select className={`w-full p-2 rounded border ${styles.input}`} value={form.accessType} onChange={e => setForm({...form, accessType: e.target.value as any})}>
                            <option value="Public">Public (Global Access)</option>
                            <option value="Customized">Customized (Private)</option>
                        </select>

                        {form.accessType === 'Customized' && (
                            <div className="animate-in fade-in slide-in-from-top-1 pt-2 border-t border-dashed border-gray-500/20">
                                <label className={`block text-xs uppercase font-bold mb-1 ${styles.textSub}`}>Target Customer</label>
                                <select 
                                    className={`w-full p-2 rounded border ${styles.input} ${!form.selectedCustomer ? 'border-amber-500/50 ring-1 ring-amber-500/20' : ''}`} 
                                    value={form.selectedCustomer} 
                                    onChange={e => setForm({...form, selectedCustomer: e.target.value})}
                                >
                                    <option value="">Select a Customer...</option>
                                    {MOCK_EXISTING_CUSTOMERS.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Client Definition */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-xs uppercase font-bold mb-1 ${styles.textSub}`}>Product</label>
                                <select className={`w-full p-2 rounded border ${styles.input}`} value={form.product} onChange={e => setForm({...form, product: e.target.value})}>
                                    <option>Agent</option><option>OTA Img</option><option>Tool</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs uppercase font-bold mb-1 ${styles.textSub}`}>Platform</label>
                                <select className={`w-full p-2 rounded border ${styles.input}`} value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
                                    <option>Android</option><option>Windows</option><option>Linux</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-xs uppercase font-bold mb-1 ${styles.textSub}`}>Architecture</label>
                                <select className={`w-full p-2 rounded border ${styles.input}`} value={form.arch} onChange={e => setForm({...form, arch: e.target.value})}>
                                    <option>x86_64</option><option>x86</option><option>arm64</option><option>arm</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs uppercase font-bold mb-1 ${styles.textSub}`}>Series</label>
                                <input type="text" placeholder="e.g. FT-GMS" className={`w-full p-2 rounded border outline-none focus:ring-1 focus:ring-blue-500 ${styles.input}`} value={form.series} onChange={e => setForm({...form, series: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    {form.accessType === 'Public' ? (
                        <div className="p-3 bg-blue-500/10 text-blue-500 text-xs rounded border border-blue-500/20 flex gap-2">
                             <Globe size={16} className="shrink-0" />
                             <span>Public clients are accessible to all customers. No binding required.</span>
                        </div>
                    ) : (
                        <div className="p-3 bg-amber-500/10 text-amber-500 text-xs rounded border border-amber-500/20 flex gap-2">
                             <Lock size={16} className="shrink-0" />
                             <span>Restricted to the selected customer only.</span>
                        </div>
                    )}

                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitDisabled}
                        className={`w-full py-2 rounded font-bold mt-4 ${isSubmitDisabled ? 'bg-gray-500 cursor-not-allowed opacity-50 text-white' : styles.buttonPrimary}`}
                    >
                        Create Client
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const CustomerBindingModal = () => {
      if (!selectedClient) return null;
      // Derived state from existing mock customers, excluding ones already bound
      const availableCustomers = MOCK_EXISTING_CUSTOMERS.filter(c => !selectedClient.customers.includes(c));
      
      const [localList, setLocalList] = useState(selectedClient.customers);

      const addCust = (custName: string) => {
          if(!localList.includes(custName)) {
              setLocalList([...localList, custName]);
          }
      };

      const removeCust = (c: string) => {
          setLocalList(localList.filter(item => item !== c));
      };

      const save = () => {
          const updated = clients.map(cl => cl.id === selectedClient.id ? { ...cl, customers: localList } : cl);
          setClients(updated);
          setIsCustomerOpen(false);
      };

      return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${styles.modalOverlay}`}>
            <div className={`w-full max-w-2xl rounded-xl shadow-2xl border flex flex-col max-h-[85vh] ${styles.modalBg}`}>
                
                {/* Header */}
                <div className="p-6 border-b border-inherit flex justify-between items-start">
                    <div>
                        <h3 className={`text-lg font-bold ${styles.textMain}`}>Manage Customers</h3>
                        <p className={`text-xs ${styles.textSub} mt-1 flex items-center gap-2`}>
                            Binding for: 
                            <span className="font-mono font-bold bg-opacity-20 bg-blue-500 px-1 rounded text-blue-500">
                                {selectedClient.product} / {selectedClient.platform} / {selectedClient.series}
                            </span>
                        </p>
                    </div>
                    <button onClick={() => setIsCustomerOpen(false)}><X size={20} className={styles.textSub}/></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Left: Bound Customers */}
                    <div className="flex-1 p-4 border-r border-inherit overflow-y-auto flex flex-col">
                        <h4 className={`text-xs font-bold uppercase mb-3 ${styles.textSub}`}>Bound Customers ({localList.length})</h4>
                        <div className="space-y-2 flex-1">
                            {localList.length === 0 ? (
                                <div className="text-center p-8 opacity-50 flex flex-col items-center">
                                    <Building2 size={24} className="mb-2" />
                                    <p className="text-sm">No customers bound.</p>
                                </div>
                            ) : (
                                localList.map(cust => (
                                    <div key={cust} className={`flex justify-between items-center p-3 rounded border border-inherit bg-opacity-10 bg-green-500/10`}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-full bg-green-500/20 text-green-500"><Check size={12}/></div>
                                            <span className={`text-sm font-medium ${styles.textMain}`}>{cust}</span>
                                        </div>
                                        <button onClick={() => removeCust(cust)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><Trash2 size={14}/></button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Available Customers */}
                    <div className="flex-1 p-4 overflow-y-auto bg-opacity-50 bg-black/5">
                        <h4 className={`text-xs font-bold uppercase mb-3 ${styles.textSub}`}>Available Customers</h4>
                        <div className="space-y-2">
                             {availableCustomers.length === 0 ? (
                                 <p className="text-sm opacity-50 italic">All known customers are already bound.</p>
                             ) : (
                                 availableCustomers.map(cust => (
                                     <button 
                                        key={cust} 
                                        onClick={() => addCust(cust)}
                                        className={`w-full flex items-center justify-between p-3 rounded border border-transparent hover:border-blue-500/30 hover:bg-blue-500/10 transition-all text-left group ${styles.input}`}
                                     >
                                         <span className={`text-sm ${styles.textSub} group-hover:text-blue-500`}>{cust}</span>
                                         <Plus size={14} className="opacity-0 group-hover:opacity-100 text-blue-500"/>
                                     </button>
                                 ))
                             )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-inherit flex justify-end bg-opacity-50 bg-gray-500/5">
                    <button onClick={save} className={`px-6 py-2 rounded font-medium ${styles.buttonPrimary}`}>Save Changes</button>
                </div>
            </div>
        </div>
      );
  };

  const getProductIcon = (p: string) => {
      switch(p) {
          case 'Agent': return Monitor;
          case 'OTA Img': return Layers;
          case 'Tool': return Wrench;
          default: return Box;
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {isCreateOpen && <CreateClientModal />}
      {isCustomerOpen && <CustomerBindingModal />}

      {/* Header */}
      <div className={`p-6 rounded-lg border ${styles.card} flex flex-col md:flex-row justify-between items-center gap-6`}>
         <div className="flex items-center gap-4">
             <div className={`p-4 rounded-full ${theme === AppTheme.LIGHT ? 'bg-orange-100 text-orange-600' : 'bg-opacity-20 bg-orange-500 text-orange-400'}`}>
                 <Server size={32} />
             </div>
             <div>
                 <h1 className={`text-2xl font-bold ${styles.textMain}`}>App Client Management</h1>
                 <p className={styles.textSub}>Manage Client Definitions & Customer Bindings</p>
             </div>
         </div>
         <div className="flex gap-3">
             <button 
               onClick={() => setIsCreateOpen(true)}
               className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-md ${styles.buttonPrimary}`}
             >
                 <Plus size={18} />
                 <span>Create Client</span>
             </button>
         </div>
      </div>

      {/* Main Table */}
      <div className={`rounded-lg border ${styles.card} flex flex-col min-h-[600px]`}>
          {/* Toolbar */}
          <div className="p-4 border-b border-inherit flex gap-4">
              <div className="relative flex-1 max-w-md">
                 <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.textSub}`} />
                 <input type="text" placeholder="Search clients..." className={`w-full pl-10 pr-4 py-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 ${styles.input}`} />
              </div>
          </div>

          <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm border-collapse">
                  <thead>
                      <tr className={styles.header}>
                          <th className="p-4 font-semibold w-[300px]">Client Definition</th>
                          <th className="p-4 font-semibold">Access Type</th>
                          <th className="p-4 font-semibold">Product Key</th>
                          <th className="p-4 font-semibold">Bound Customers</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className={styles.textMain}>
                      {clients.map(client => {
                          const Icon = getProductIcon(client.product);
                          const isPublic = client.accessType === 'Public';
                          return (
                            <tr key={client.id} className={styles.row}>
                                {/* Client Definition (Simplified) */}
                                <td className="p-4 align-top">
                                    <div className="flex items-center gap-3">
                                        {/* Icon */}
                                        <div className={`p-2.5 rounded-md shrink-0 ${theme === AppTheme.LIGHT ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-400'}`}>
                                            <Icon size={20} />
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            {/* Product Name */}
                                            <span className="text-base font-bold leading-tight">{client.product}</span>
                                            
                                            {/* Metadata Line */}
                                            <div className="flex items-center gap-1.5 mt-1 text-xs opacity-70">
                                                <span className={`${theme === AppTheme.LIGHT ? 'text-blue-600' : 'text-blue-400'} font-medium`}>{client.series}</span>
                                                <span className="w-1 h-1 rounded-full bg-current opacity-30"></span>
                                                <span>{client.platform}</span>
                                                <span className="w-1 h-1 rounded-full bg-current opacity-30"></span>
                                                <span className="font-mono">{client.arch}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Access Type */}
                                <td className="p-4 align-top">
                                    {isPublic ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                            <Globe size={12} /> Public
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            <Lock size={12} /> Customized
                                        </span>
                                    )}
                                </td>

                                {/* Product Key */}
                                <td className="p-4 align-top">
                                    <div className={`font-mono text-xs p-2 rounded border border-dashed flex items-center gap-2 w-fit ${theme === AppTheme.LIGHT ? 'bg-gray-50 border-gray-300' : 'bg-black/20 border-gray-600'}`}>
                                        <span className="select-all">{client.productKey}</span>
                                        <button className="opacity-50 hover:opacity-100 hover:text-blue-500"><Copy size={12}/></button>
                                    </div>
                                </td>

                                {/* Customers */}
                                <td className="p-4 align-top">
                                    {isPublic ? (
                                        <div className="opacity-40 flex items-center gap-2 text-xs italic">
                                            <Globe size={14} />
                                            <span>Global Access</span>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => { setSelectedClient(client); setIsCustomerOpen(true); }}
                                            className={`cursor-pointer group flex items-center gap-2`}
                                        >
                                            {client.customers.length === 0 ? (
                                                <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium bg-red-500/10 px-2 py-1 rounded border border-red-500/20 animate-pulse">
                                                    <AlertCircle size={12} />
                                                    <span>Action Required</span>
                                                </div>
                                            ) : (
                                                <div className="flex -space-x-2">
                                                    {client.customers.slice(0, 3).map((c, i) => (
                                                        <div key={i} title={c} className={`w-8 h-8 rounded-full border-2 border-[#282a36] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                                                            {c.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    ))}
                                                    {client.customers.length > 3 && (
                                                        <div className={`w-8 h-8 rounded-full border-2 border-[#282a36] bg-gray-600 flex items-center justify-center text-[10px] text-white`}>+{client.customers.length - 3}</div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <button className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${styles.input} hover:bg-blue-500 hover:text-white ml-2`}>
                                                <Users size={12} />
                                            </button>
                                        </div>
                                    )}
                                </td>

                                {/* Actions */}
                                <td className="p-4 align-top text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {client.fileCount > 0 ? (
                                            <div className="group relative">
                                                    <button disabled className={`p-2 rounded cursor-not-allowed text-gray-500 opacity-50`}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-2 w-48 p-2 text-[10px] bg-black text-white rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                                        Cannot delete client with existing file versions ({client.fileCount}).
                                                    </div>
                                            </div>
                                        ) : (
                                            <button className={`p-2 rounded hover:bg-red-500/20 text-red-500 transition-colors`}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};