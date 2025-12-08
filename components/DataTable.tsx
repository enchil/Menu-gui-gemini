import React from 'react';
import { useApp } from '../contexts/AppContext';
import { AppTheme, DeviceData } from '../types';
import { 
  MoreVertical, 
  RotateCw, 
  Download, 
  Filter, 
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const MOCK_DATA: DeviceData[] = [
  { id: '1', name: 'ubuntu2404-WhiskeyLake', os: 'Linux', model: 'WhiskeyLake', sn: 'Type2 - Board Seri', agentVer: '2.1.1', lastConnect: '2025-12-08 17:27', status: 'connected' },
  { id: '2', name: 'Android_G17', os: 'Android', model: 'Android_G17', sn: 'UNKNOWN', agentVer: '1.2.8', lastConnect: '2025-10-31 17:27', status: 'inactive' },
  { id: '3', name: 'DESKTOP-1JOGCVL', os: 'Windows', model: 'Skylake Client', sn: '0060ef27', agentVer: '1.6.5_20251001', lastConnect: '2025-11-13 15:23', status: 'disconnected' },
  { id: '4', name: 'DESKTOP-OQCOPPL', os: 'Windows', model: 'POS350', sn: 'S303310184', agentVer: '1.6.5_20251001', lastConnect: '2025-10-09 17:27', status: 'connected' },
  { id: '5', name: 'POS337N2', os: 'Windows', model: 'WhiskeyLake', sn: 'Type2 - Board Seri', agentVer: '1.6.5_20251001', lastConnect: '2025-12-08 17:32', status: 'connected' },
  { id: '6', name: 'RPI-4-Node-01', os: 'Linux', model: 'Raspberry Pi 4', sn: 'RP4-00123', agentVer: '2.1.0', lastConnect: '2025-12-08 18:00', status: 'connected' },
  { id: '7', name: 'Kiosk-Lobby-A', os: 'Android', model: 'Samsung Tab S7', sn: 'SAM-8892', agentVer: '1.2.9', lastConnect: '2025-12-07 09:12', status: 'disconnected' },
];

const CHART_DATA = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 65 },
    { name: 'Thu', value: 50 },
    { name: 'Fri', value: 85 },
    { name: 'Sat', value: 45 },
    { name: 'Sun', value: 60 },
];

export const DataTable: React.FC = () => {
  const { theme } = useApp();

  const getStyles = () => {
    switch(theme) {
      case AppTheme.DRACULA:
        return {
          card: 'bg-[#282a36] border-[#44475a] shadow-lg',
          textMain: 'text-[#f8f8f2]',
          textSub: 'text-[#6272a4]',
          header: 'bg-[#44475a] text-[#bd93f9]',
          row: 'hover:bg-[#44475a]/50 border-b border-[#44475a]',
          input: 'bg-[#44475a] text-white border-none',
          buttonPrimary: 'bg-[#bd93f9] text-[#282a36] hover:bg-[#ff79c6]',
          chartGrid: '#44475a',
          chartBar: '#bd93f9'
        };
      case AppTheme.LIGHT:
        return {
          card: 'bg-white border-gray-200 shadow-sm',
          textMain: 'text-slate-800',
          textSub: 'text-slate-500',
          header: 'bg-gray-50 text-slate-700 font-semibold',
          row: 'hover:bg-blue-50 border-b border-gray-100',
          input: 'bg-white border border-gray-300 text-slate-800',
          buttonPrimary: 'bg-white border border-blue-500 text-blue-600 hover:bg-blue-50',
          chartGrid: '#e2e8f0',
          chartBar: '#3b82f6'
        };
      case AppTheme.DARK:
      default:
        return {
          card: 'bg-slate-800 border-slate-700 shadow-md',
          textMain: 'text-gray-200',
          textSub: 'text-gray-400',
          header: 'bg-slate-900/50 text-gray-300 font-semibold',
          row: 'hover:bg-slate-700 border-b border-slate-700/50',
          input: 'bg-slate-900 border border-slate-700 text-gray-200',
          buttonPrimary: 'bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500/10',
          chartGrid: '#334155',
          chartBar: '#60a5fa'
        };
    }
  };

  const styles = getStyles();

  const StatusIcon = ({ status }: { status: string }) => {
      if (status === 'connected') return <CheckCircle2 size={16} className="text-emerald-500" />;
      if (status === 'disconnected') return <XCircle size={16} className="text-red-500" />;
      return <AlertCircle size={16} className="text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Stats Area - mimicking "System Architecture" dashboard feel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-lg border ${styles.card} flex flex-col justify-between`}>
              <div className={styles.textSub}>Total Devices</div>
              <div className={`text-3xl font-bold ${styles.textMain}`}>1,024</div>
              <div className="text-xs text-emerald-500 flex items-center gap-1">
                  <span>+12%</span> from last month
              </div>
          </div>
          <div className={`p-5 rounded-lg border ${styles.card} flex flex-col justify-between`}>
              <div className={styles.textSub}>Online Status</div>
              <div className="flex gap-2 mt-2">
                  <div className="flex-1 bg-emerald-500/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{width: '75%'}}></div>
                  </div>
              </div>
              <div className={`text-xs mt-2 ${styles.textSub}`}>75% Connected</div>
          </div>
           {/* Mini Chart */}
           <div className={`col-span-1 lg:col-span-2 p-4 rounded-lg border ${styles.card} h-32`}>
              <div className={`text-xs mb-2 ${styles.textSub}`}>Connection Activity (7 Days)</div>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={styles.chartGrid} />
                      <XAxis dataKey="name" hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: styles.card.split(' ')[0], borderColor: 'transparent', color: styles.chartBar }}
                        cursor={{fill: 'transparent'}}
                      />
                      <Bar dataKey="value" fill={styles.chartBar} radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>


      {/* Main Table Card */}
      <div className={`rounded-lg border ${styles.card}`}>
        {/* Header Actions */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
               <h2 className={`text-xl font-bold ${styles.textMain}`}>Device List</h2>
               <div className="flex items-center gap-2 mt-2">
                   {['Enrolled', 'Inactive'].map((tab, idx) => (
                       <button key={tab} className={`px-3 py-1 text-sm rounded-md transition-colors ${idx === 0 ? 'bg-blue-500/10 text-blue-500 font-medium' : styles.textSub}`}>
                           {tab} <span className="text-xs opacity-70 ml-1">{idx === 0 ? '18' : ''}</span>
                       </button>
                   ))}
               </div>
           </div>
           
           <div className="flex items-center gap-2 w-full sm:w-auto">
               <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${styles.buttonPrimary}`}>
                   <Download size={16} />
                   <span>Export CSV</span>
               </button>
           </div>
        </div>

        {/* Toolbar */}
        <div className={`px-4 py-3 border-t border-b ${theme === AppTheme.DRACULA ? 'border-[#44475a]' : 'border-gray-200/10'} flex flex-col sm:flex-row gap-3`}>
            <div className="relative flex-1">
                <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.textSub}`} />
                <input 
                    type="text" 
                    placeholder="Search device name, ID, or serial number..." 
                    className={`w-full pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${styles.input}`}
                />
            </div>
            <div className="flex items-center gap-2">
                 <button className={`p-2 rounded-md ${styles.input} hover:brightness-110`} title="Refresh">
                     <RotateCw size={18} className={styles.textSub} />
                 </button>
                 <button className={`p-2 rounded-md ${styles.input} hover:brightness-110 flex items-center gap-2 px-3`} title="Filter">
                     <Filter size={18} className={styles.textSub} />
                     <span className={`text-sm ${styles.textMain}`}>OS: All</span>
                 </button>
            </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className={styles.header}>
                <th className="p-4 font-semibold w-10"></th>
                <th className="p-4 font-semibold">Device Name</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">OS</th>
                <th className="p-4 font-semibold">Model</th>
                <th className="p-4 font-semibold hidden lg:table-cell">SN</th>
                <th className="p-4 font-semibold hidden md:table-cell">Agent Ver.</th>
                <th className="p-4 font-semibold text-right">Last Connect</th>
              </tr>
            </thead>
            <tbody className={styles.textMain}>
              {MOCK_DATA.map((row) => (
                <tr key={row.id} className={`transition-colors group ${styles.row}`}>
                   <td className="p-4">
                       <input type="checkbox" className="rounded border-gray-500" />
                   </td>
                   <td className="p-4 font-medium text-blue-500 cursor-pointer hover:underline">
                       {row.name}
                   </td>
                   <td className="p-4">
                       <div className="flex items-center gap-2">
                           <StatusIcon status={row.status} />
                           <span className="capitalize">{row.status}</span>
                       </div>
                   </td>
                   <td className="p-4">{row.os}</td>
                   <td className="p-4 text-opacity-80">{row.model}</td>
                   <td className="p-4 hidden lg:table-cell font-mono text-xs opacity-70">{row.sn}</td>
                   <td className="p-4 hidden md:table-cell opacity-80">{row.agentVer}</td>
                   <td className="p-4 text-right font-mono text-xs opacity-70">
                       {row.lastConnect}
                       <button className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <MoreVertical size={16} />
                       </button>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${theme === AppTheme.DRACULA ? 'border-[#44475a]' : 'border-gray-200/10'}`}>
            <div className={`text-sm ${styles.textSub}`}>
                Showing 1 to 7 of 12 entries
            </div>
            <div className="flex gap-1">
                <button className={`px-3 py-1 rounded-md text-sm ${styles.input} opacity-50 cursor-not-allowed`}>Prev</button>
                <button className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white">1</button>
                <button className={`px-3 py-1 rounded-md text-sm ${styles.input} hover:brightness-125`}>2</button>
                <button className={`px-3 py-1 rounded-md text-sm ${styles.input} hover:brightness-125`}>Next</button>
            </div>
        </div>
      </div>
    </div>
  );
};
