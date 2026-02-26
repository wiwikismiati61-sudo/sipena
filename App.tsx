
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

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('perpusDB', JSON.stringify(db));
  }, [db]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === db.auth.user && loginForm.pass === db.auth.pass) {
      setIsLoggedIn(true);
      Swal.fire({ icon: 'success', title: 'Login Berhasil', timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Login Gagal', text: 'Username atau Password salah!' });
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setLoginForm({ user: '', pass: '' });
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md text-center">
          <img src="https://iili.io/KDFk4fI.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h2 className="text-2xl font-bold text-slate-800 mb-1">System Perpustakaan SMP</h2>
          <p className="text-gray-500 text-sm mb-6">Silakan login untuk melanjutkan</p>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                value={loginForm.user}
                onChange={(e) => setLoginForm({ ...loginForm, user: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Username" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={loginForm.pass}
                onChange={(e) => setLoginForm({ ...loginForm, pass: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Password" 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition shadow-lg transform active:scale-95">
              Masuk Aplikasi
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-400 italic">Default: admin / admin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} username={db.auth.user} onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
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
