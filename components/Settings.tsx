
import React, { useState } from 'react';
import { AppState } from '../types';
import { DEFAULT_STATE } from '../constants';
import { Shield, Database, Download, Upload, Save, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

interface SettingsProps {
  db: AppState;
  setDb: React.Dispatch<React.SetStateAction<AppState>>;
}

const Settings: React.FC<SettingsProps> = ({ db, setDb }) => {
  const [authForm, setAuthForm] = useState({ user: db.auth.user, pass: db.auth.pass });

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    setDb(prev => ({ ...prev, auth: authForm }));
    Swal.fire('Sukses', 'Informasi login telah diperbarui', 'success');
  };

  const backupData = () => {
    const blob = new Blob([JSON.stringify(db)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_perpus_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    Swal.fire({
      title: 'Hapus data saat ini?',
      text: 'Data lama akan ditimpa total oleh file backup ini.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Timpa Data'
    }).then(result => {
      if (result.isConfirmed) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const restored = JSON.parse(event.target?.result as string);
            // CRITICAL FIX: Merge with default state to prevent errors with old backup files.
            setDb({ ...DEFAULT_STATE, ...restored });
            Swal.fire('Berhasil', 'Database berhasil dipulihkan', 'success');
          } catch (err) {
            Swal.fire('Error', 'File backup tidak valid', 'error');
          }
        };
        reader.readAsText(file);
      }
    });
    // Reset file input to allow re-uploading the same file
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
          <Shield className="text-blue-600" /> Keamanan Akun
        </h3>
        <form onSubmit={handleSecuritySave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username Administrator</label>
              <input 
                type="text" 
                value={authForm.user}
                onChange={e => setAuthForm({ ...authForm, user: e.target.value })}
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password Baru</label>
              <input 
                type="password" 
                value={authForm.pass}
                onChange={e => setAuthForm({ ...authForm, pass: e.target.value })}
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                required 
              />
            </div>
          </div>
          <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg flex items-center gap-2">
            <Save size={18} /> SIMPAN PERUBAHAN
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
          <Database className="text-indigo-600" /> Database & Backup
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Gunakan fitur ini untuk memindahkan data ke perangkat lain atau mencegah kehilangan data jika cache browser dibersihkan. 
          Sangat disarankan melakukan backup berkala secara manual.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={backupData} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg transition transform active:scale-95">
            <Download size={20} /> DOWNLOAD BACKUP (JSON)
          </button>
          
          <label className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg transition cursor-pointer transform active:scale-95">
            <Upload size={20} /> RESTORE DATABASE
            <input type="file" className="hidden" accept=".json" onChange={restoreData} />
          </label>
        </div>

        <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-4">
          <AlertTriangle className="text-red-600 shrink-0" />
          <div className="text-xs text-red-800 leading-tight">
            <strong>Peringatan Penting:</strong> Melakukan <strong>Restore</strong> akan menghapus seluruh data yang ada saat ini secara permanen. 
            Pastikan file backup Anda benar sebelum melakukan konfirmasi.
          </div>
        </div>
      </div>
      
      <div className="text-center text-slate-300 text-[10px] uppercase font-bold tracking-widest pb-8">
        Library System v2.0 - Powered by React & Tailwind
      </div>
    </div>
  );
};

export default Settings;
