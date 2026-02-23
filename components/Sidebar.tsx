
import React from 'react';
import { 
  Home, 
  Database, 
  ArrowLeftRight, 
  RotateCcw, 
  Users, 
  UserSquare,
  FileSpreadsheet, 
  Settings, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'master', label: 'Master Data', icon: Database },
    { id: 'transaksi', label: 'Transaksi Pinjam', icon: ArrowLeftRight },
    { id: 'pengembalian', label: 'Transaksi Kembali', icon: RotateCcw },
    { id: 'kunjungan', label: 'Kunjungan Warta', icon: Users },
    { id: 'kunjunganSiswa', label: 'Kunjungan Siswa', icon: UserSquare },
    { id: 'laporan', label: 'Laporan', icon: FileSpreadsheet },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="w-20 md:w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 transition-all duration-300">
      <div className="p-4 md:p-6 flex items-center gap-3 border-b border-slate-700">
        <img src="https://iili.io/KDFk4fI.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full p-1 shrink-0" />
        <div className="hidden md:block">
          <h1 className="font-bold text-lg leading-tight">Perpus SMP</h1>
          <span className="text-xs text-slate-400">System Management</span>
        </div>
      </div>

      <nav className="flex-1 px-2 md:px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 text-sm font-medium rounded-lg transition-all ${
              activeTab === item.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className="shrink-0" />
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition active:scale-95"
        >
          <LogOut size={18} />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
