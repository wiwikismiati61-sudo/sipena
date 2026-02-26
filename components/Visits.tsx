
import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { BookOpen, Trash2, Download, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

interface VisitsProps {
  db: AppState;
  setDb: React.Dispatch<React.SetStateAction<AppState>>;
}

const Visits: React.FC<VisitsProps> = ({ db, setDb }) => {
  const [formData, setFormData] = useState({
    tgl: new Date().toISOString().split('T')[0],
    kelas: '',
    guru: '',
    mapel: '',
    jam: [] as string[]
  });

  const uniqueKelas = useMemo(() => [...new Set(db.siswa.map(s => s.kelas))].sort(), [db.siswa]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kelas || !formData.guru || !formData.mapel || formData.jam.length === 0) {
      return Swal.fire('Error', 'Lengkapi data kunjungan', 'error');
    }

    setDb(prev => ({
      ...prev,
      kunjungan: [...prev.kunjungan, { 
        ...formData, 
        jam: formData.jam.join(', '), 
        id: `KJ-${Date.now()}` 
      }]
    }));

    setFormData({ ...formData, jam: [] });
    Swal.fire('Tersimpan', 'Data Kunjungan berhasil disimpan', 'success');
  };

  const deleteVisit = (id: string) => {
    Swal.fire({ title: 'Hapus data kunjungan?', icon: 'warning', showCancelButton: true }).then(res => {
      if (res.isConfirmed) setDb(prev => ({ ...prev, kunjungan: prev.kunjungan.filter(v => v.id !== id) }));
    });
  };

  const exportVisits = () => {
    if (db.kunjungan.length === 0) return Swal.fire('Info', 'Tidak ada data', 'info');
    const data = db.kunjungan.map(k => ({ 'Tgl': k.tgl, 'Kelas': k.kelas, 'Guru': k.guru, 'Mapel': k.mapel, 'Jam': k.jam }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Visits');
    XLSX.writeFile(wb, 'Riwayat_Kunjungan_Warta.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-slate-800 p-4 md:p-6 text-white flex justify-between items-center">
          <h3 className="font-bold text-base md:text-lg flex items-center gap-2"><BookOpen size={20} /> Input Kunjungan Warta</h3>
          <p className="text-xs opacity-70 italic">Mencatat penggunaan perpustakaan oleh kelas</p>
        </div>
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Tanggal</label>
                <input type="date" value={formData.tgl} onChange={e => setFormData({ ...formData, tgl: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Kelas</label>
                <select value={formData.kelas} onChange={e => setFormData({ ...formData, kelas: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" required>
                  <option value="">-- Pilih Kelas --</option>
                  {uniqueKelas.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Guru Pengampu</label>
                <select value={formData.guru} onChange={e => setFormData({ ...formData, guru: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" required>
                  <option value="">-- Pilih Guru --</option>
                  {db.guru.map(g => <option key={g.id} value={g.nama}>{g.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Mata Pelajaran</label>
                <select value={formData.mapel} onChange={e => setFormData({ ...formData, mapel: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" required>
                  <option value="">-- Pilih Mapel --</option>
                  {db.mapel.map(m => <option key={m.id} value={m.nama}>{m.nama}</option>)}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Jam Pembelajaran (Bisa pilih multi)</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 border rounded-lg p-3 bg-slate-50">
                {db.jam.map(j => (
                  <label key={j.id} className={`flex items-center gap-2 p-2 rounded-md transition cursor-pointer ${formData.jam.includes(j.label) ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-blue-50'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.jam.includes(j.label)} 
                      onChange={e => {
                        if (e.target.checked) setFormData({ ...formData, jam: [...formData.jam, j.label] });
                        else setFormData({ ...formData, jam: formData.jam.filter(h => h !== j.label) });
                      }}
                    />
                    <span className="text-[10px] font-bold">{j.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2">
                <Save size={18} /> SIMPAN KUNJUNGAN
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="font-bold text-slate-800">Riwayat Kunjungan Warta</h3>
          <button onClick={exportVisits} className="text-[10px] font-bold bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 flex items-center gap-1">
            <Download size={14} /> EXCEL
          </button>
        </div>
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Guru</th>
                <th className="px-4 py-3">Mapel</th>
                <th className="px-4 py-3">Jam</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...db.kunjungan].reverse().map(k => (
                <tr key={k.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{k.tgl}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{k.kelas}</span></td>
                  <td className="px-4 py-3 text-slate-700">{k.guru}</td>
                  <td className="px-4 py-3 text-slate-500">{k.mapel}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-400 font-medium italic">{k.jam}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => deleteVisit(k.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {db.kunjungan.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">Belum ada data kunjungan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Visits;
