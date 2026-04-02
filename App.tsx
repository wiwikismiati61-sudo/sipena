
import React, { useState, useEffect, useCallback } from 'react';
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
import { auth, db as firestoreDb } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, query, getDocs, writeBatch, getDocFromServer, deleteDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [db, setDbState] = useState<AppState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', pass: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setCurrentUserEmail(user?.email || null);
      setIsAuthReady(true);
    });

    // Test connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(firestoreDb, 'siswa', 'connection-test'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const collections = ['siswa', 'guru', 'buku', 'transaksi', 'kunjungan', 'kunjunganSiswa', 'mapel', 'jam'];
    const unsubscribes = collections.map(colName => {
      return onSnapshot(collection(firestoreDb, colName), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDbState(prev => ({ ...prev, [colName]: data }));
      }, (error) => {
        console.error(`Firestore Error in ${colName}: `, error);
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [isAuthReady]);

  const setDb = useCallback((action: React.SetStateAction<AppState>) => {
    setDbState(prev => {
      const nextState = typeof action === 'function' ? action(prev) : action;
      
      if (isLoggedIn) {
        // Sync changes to Firestore
        const collections: (keyof AppState)[] = ['siswa', 'guru', 'buku', 'transaksi', 'kunjungan', 'kunjunganSiswa', 'mapel', 'jam'];
        
        collections.forEach(colName => {
          const nextCol = nextState[colName];
          const prevCol = prev[colName];
          
          if (Array.isArray(nextCol) && Array.isArray(prevCol) && nextCol !== prevCol) {
            // Find what changed (added or updated)
            nextCol.forEach(item => {
              if (item && item.id) {
                const prevItem = prevCol.find(p => p.id === item.id);
                if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
                  setDoc(doc(firestoreDb, colName as string, String(item.id)), item).catch(console.error);
                }
              }
            });

            // Find what was deleted
            prevCol.forEach(item => {
              if (item && item.id && !nextCol.find(n => n.id === item.id)) {
                deleteDoc(doc(firestoreDb, colName as string, String(item.id))).catch(console.error);
              }
            });
          }
        });
      }
      return nextState;
    });
  }, [isLoggedIn]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, loginForm.email, loginForm.pass);
        Swal.fire({ icon: 'success', title: 'Pendaftaran Berhasil', timer: 1500, showConfirmButton: false });
      } else {
        await signInWithEmailAndPassword(auth, loginForm.email, loginForm.pass);
        Swal.fire({ icon: 'success', title: 'Login Berhasil', timer: 1500, showConfirmButton: false });
      }
    } catch (error: any) {
      let message = `Firebase: Error (${error.code}).`;
      if (error.code === 'auth/invalid-credential') {
        message = 'Email atau Password salah. Silakan periksa kembali atau gunakan Lupa Password.';
      }
      Swal.fire({ icon: 'error', title: isRegistering ? 'Pendaftaran Gagal' : 'Login Gagal', text: message });
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      Swal.fire({ icon: 'success', title: 'Login Berhasil', timer: 1500, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Login Gagal', text: `Firebase: Error (${error.code}).` });
    }
  };

  const handleResetPassword = async () => {
    if (!loginForm.email) {
      Swal.fire({ icon: 'warning', title: 'Email Kosong', text: 'Masukkan email Anda terlebih dahulu di kolom email untuk mereset password.' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, loginForm.email);
      Swal.fire({ icon: 'success', title: 'Email Terkirim', text: 'Link reset password telah dikirim ke email Anda. Silakan cek kotak masuk/spam.' });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Gagal Mengirim Email', text: `Firebase: Error (${error.code}).` });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setLoginForm({ email: '', pass: '' });
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (!isAuthReady) {
    return <div className="flex h-screen items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!isLoggedIn && activeTab !== 'dashboard') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md text-center">
          <img src="https://iili.io/KDFk4fI.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h2 className="text-2xl font-bold text-slate-800 mb-1">System Perpustakaan SMP</h2>
          <p className="text-gray-500 text-sm mb-6">
            {isRegistering ? 'Daftar akun baru untuk guru' : 'Silakan login untuk mengakses menu ini'}
          </p>
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="email@sekolah.com" 
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
                placeholder="Password (min 6 karakter)" 
                required 
                minLength={6}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition shadow-lg transform active:scale-95">
              {isRegistering ? 'Daftar Sekarang' : 'Masuk Aplikasi'}
            </button>
            {!isRegistering && (
              <button 
                type="button" 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg transition shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Masuk dengan Google
              </button>
            )}
            <div className="flex justify-between items-center text-sm mt-4">
              <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 hover:underline">
                {isRegistering ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
              </button>
              {!isRegistering && (
                <button type="button" onClick={handleResetPassword} className="text-slate-500 hover:text-slate-700 hover:underline">
                  Lupa Password?
                </button>
              )}
            </div>
            <button type="button" onClick={() => setActiveTab('dashboard')} className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg transition transform active:scale-95">
              Kembali ke Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isLoggedIn={isLoggedIn} onLogout={logout} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} username={currentUserEmail || 'Guest'} onMenuClick={() => setIsSidebarOpen(true)} />
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
