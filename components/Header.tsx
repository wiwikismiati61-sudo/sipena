
import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  username: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, username, onMenuClick }) => {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    master: 'Master Data Management',
    transaksi: 'Transaksi Peminjaman',
    pengembalian: 'Transaksi Pengembalian Buku',
    kunjungan: 'Kunjungan Warta (Pembelajaran)',
    kunjunganSiswa: 'Kunjungan Siswa Individual',
    laporan: 'Laporan & Export',
    settings: 'Pengaturan System'
  };

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-4 md:px-8 z-10 shadow-sm shrink-0">
            <div className="flex items-center gap-2">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-full hover:bg-slate-100">
          <Menu size={24} className="text-slate-600" />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-slate-800 capitalize">
        {titles[activeTab] || 'Library System'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-slate-800">{username}</p>
          <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online</p>
        </div>
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
          {username.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
