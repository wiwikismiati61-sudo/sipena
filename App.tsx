
import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import { DEFAULT_STATE } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MasterData from './components/MasterData';
import Transactions from './components/Transactions';
import Returns from './components/Returns';
import Visits from './components/Visits';
import StudentVisits from './components/StudentVisits';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Swal from 'sweetalert2';

const App: React.FC = () => {
  const [db, setDb] = useState<AppState>(() => {
    const saved = localStorage.getItem('perpusDB');
    if (saved) {
      const savedState = JSON.parse(saved);
      // Merge with default state to ensure all keys are present, preventing errors on data structure updates.
      return { ...DEFAULT_STATE, ...savedState };
    }
    return DEFAULT_STATE;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('perpusDB', JSON.stringify(db));
  }, [db]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} username={db.auth.user} onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-3 md:p-5">
          {activeTab === 'dashboard' && <Dashboard db={db} />}
          {activeTab === 'master' && <MasterData db={db} setDb={setDb} />}
          {activeTab === 'transaksi' && <Transactions db={db} setDb={setDb} />}
          {activeTab === 'pengembalian' && <Returns db={db} setDb={setDb} />}
          {activeTab === 'kunjungan' && <Visits db={db} setDb={setDb} />}
          {activeTab === 'kunjunganSiswa' && <StudentVisits db={db} setDb={setDb} />}
          {activeTab === 'laporan' && <Reports db={db} setDb={setDb} />}
          {activeTab === 'settings' && <Settings db={db} setDb={setDb} />}
        </div>
      </main>
    </div>
  );
};

export default App;
