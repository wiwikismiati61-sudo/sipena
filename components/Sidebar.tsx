
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
  LogOut,
  LogIn
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, isLoggedIn, onLogout }) => {
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

    const handleSelect = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
      <aside className={`fixed md:relative inset-y-0 left-0 bg-slate-900 text-white flex flex-col shadow-xl z-30 transition-transform duration-300 ease-in-out w-60 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:w-16 lg:w-56`}>
            <div className="p-3 lg:p-5 flex items-center gap-3 border-b border-slate-700">
                <img src="https://iili.io/KDFk4fI.png" alt="Logo" className="w-8 h-8 lg:w-9 lg:h-9 bg-white rounded-full p-1 shrink-0" />
                <div className="hidden lg:block">
          <h1 className="font-bold text-base lg:text-lg leading-tight">Perpus SMP</h1>
          <span className="text-xs text-slate-400">System Management</span>
        </div>
      </div>

            <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item.id)}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 text-[13px] lg:text-sm font-medium rounded-lg transition-all ${
              activeTab === item.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={18} className="shrink-0" />
                        <span className="hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 lg:p-4 border-t border-slate-700">
        {isLoggedIn ? (
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-[13px] lg:text-sm font-medium transition active:scale-95"
          >
            <LogOut size={16} />
            <span className="hidden lg:block">Logout</span>
          </button>
        ) : (
          <button 
            onClick={() => handleSelect('master')}
            className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-[13px] lg:text-sm font-medium transition active:scale-95"
          >
            <LogIn size={16} />
            <span className="hidden lg:block">Login</span>
          </button>
        )}
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
