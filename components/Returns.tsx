
import React, { useState, useMemo } from 'react';
import { AppState, TransactionStatus } from '../types';
import { RotateCcw, CheckSquare, Info } from 'lucide-react';
import Swal from 'sweetalert2';

interface ReturnsProps {
  db: AppState;
  setDb: React.Dispatch<React.SetStateAction<AppState>>;
}

const Returns: React.FC<ReturnsProps> = ({ db, setDb }) => {
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [retDate, setRetDate] = useState(new Date().toISOString().split('T')[0]);

  const uniqueKelas = useMemo(() => [...new Set(db.siswa.map(s => s.kelas))].sort(), [db.siswa]);
  const studentsInKelas = useMemo(() => db.siswa.filter(s => s.kelas === selectedKelas), [db.siswa, selectedKelas]);
  const borrowedBooks = useMemo(() => 
    db.transaksi.filter(t => t.siswa === selectedSiswa && t.status === TransactionStatus.BORROWED), 
    [db.transaksi, selectedSiswa]
  );

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return Swal.fire('Error', 'Centang minimal satu buku', 'error');

    setDb(prev => ({
      ...prev,
      transaksi: prev.transaksi.map(t => 
        selectedIds.includes(t.id) 
        ? { ...t, status: TransactionStatus.RETURNED, tglDikembalikan: retDate } 
        : t
      )
    }));

    setSelectedIds([]);
    Swal.fire('Berhasil', `${selectedIds.length} buku telah dikembalikan`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-green-600 p-4 md:p-6 text-white flex justify-between items-center">
          <h3 className="font-bold text-base md:text-lg flex items-center gap-2"><RotateCcw size={20} /> Form Pengembalian Buku</h3>
          <p className="text-xs opacity-80">Proses pengembalian buku pinjaman siswa</p>
        </div>
        <div className="p-4 md:p-8">
          <form onSubmit={handleReturn} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tanggal Kembali</label>
                <input type="date" value={retDate} onChange={e => setRetDate(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kelas</label>
                <select value={selectedKelas} onChange={e => { setSelectedKelas(e.target.value); setSelectedSiswa(''); setSelectedIds([]); }} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" required>
                  <option value="">-- Pilih Kelas --</option>
                  {uniqueKelas.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Siswa</label>
              <select value={selectedSiswa} onChange={e => { setSelectedSiswa(e.target.value); setSelectedIds([]); }} disabled={!selectedKelas} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none disabled:bg-slate-50">
                <option value="">-- Pilih Siswa --</option>
                {studentsInKelas.map(s => <option key={s.id} value={s.nama}>{s.nama}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase">Daftar Buku Dipinjam:</label>
              <div className="min-h-[150px] max-h-64 overflow-y-auto border rounded-lg p-3 bg-slate-50 space-y-3">
                {!selectedSiswa ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-10">
                    <Info size={32} />
                    <p className="text-sm italic">Pilih siswa untuk melihat pinjaman</p>
                  </div>
                ) : borrowedBooks.length > 0 ? (
                  borrowedBooks.map(t => {
                    const isLate = new Date() > new Date(t.tglKembali);
                    return (
                      <label key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border transition cursor-pointer ${selectedIds.includes(t.id) ? 'bg-green-50 border-green-400' : 'bg-white border-slate-200 hover:border-green-300'}`}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(t.id)} 
                          onChange={e => {
                            if (e.target.checked) setSelectedIds([...selectedIds, t.id]);
                            else setSelectedIds(selectedIds.filter(i => i !== t.id));
                          }}
                          className="mt-1 w-5 h-5 text-green-600 rounded-full" 
                        />
                        <div className="flex-1">
                           <div className="flex justify-between items-center">
                              <p className="font-bold text-slate-800">{t.buku}</p>
                              {isLate && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">TERLAMBAT</span>}
                           </div>
                           <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Pinjam: {t.tglPinjam} | Jatuh Tempo: {t.tglKembali}</p>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-green-600 gap-2 py-10">
                    <CheckSquare size={32} />
                    <p className="text-sm font-medium">Siswa ini tidak memiliki pinjaman aktif.</p>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={selectedIds.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/20 transition transform active:scale-95 disabled:bg-slate-300 disabled:shadow-none">
              PROSES PENGEMBALIAN BUKU
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Returns;
