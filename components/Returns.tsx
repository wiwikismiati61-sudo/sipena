
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
  const [selectedSubjek, setSelectedSubjek] = useState('');
  const [selectedBookTitle, setSelectedBookTitle] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [retDate, setRetDate] = useState(new Date().toISOString().split('T')[0]);

  const uniqueKelas = useMemo(() => [...new Set(db.siswa.map(s => s.kelas))].sort(), [db.siswa]);
  const studentsInKelas = useMemo(() => db.siswa.filter(s => s.kelas === selectedKelas), [db.siswa, selectedKelas]);
  
  const borrowedBooks = useMemo(() => {
    let loans = db.transaksi.filter(t => t.status === TransactionStatus.BORROWED);
    if (selectedKelas) {
      loans = loans.filter(t => t.kelas === selectedKelas);
    }
    if (selectedSiswa) {
      loans = loans.filter(t => t.siswa === selectedSiswa);
    }
    if (selectedSubjek) {
      loans = loans.filter(t => (t.subjek || 'Umum') === selectedSubjek);
    }
    if (selectedBookTitle) {
      loans = loans.filter(t => t.buku === selectedBookTitle);
    }

    // If no filters are applied, don't show anything to keep it clean (or show all if that's preferred)
    // Based on user request, they want to "pilih kelas, nama siswa, subjek, judul buku"
    if (!selectedKelas && !selectedSiswa && !selectedSubjek && !selectedBookTitle) {
      return [];
    }
    
    return loans;
  }, [db.transaksi, selectedKelas, selectedSiswa, selectedSubjek, selectedBookTitle]);

  const uniqueSubjek = useMemo(() => {
    let loans = db.transaksi.filter(t => t.status === TransactionStatus.BORROWED);
    if (selectedSiswa) {
      loans = loans.filter(t => t.siswa === selectedSiswa);
    }
    const subjects = loans.map(t => t.subjek || 'Umum');
    return [...new Set(subjects)].sort();
  }, [db.transaksi, selectedSiswa]);

  const uniqueTitles = useMemo(() => {
    let loans = db.transaksi.filter(t => t.status === TransactionStatus.BORROWED);
    if (selectedSiswa) {
      loans = loans.filter(t => t.siswa === selectedSiswa);
    }
    if (selectedSubjek) {
      loans = loans.filter(t => (t.subjek || 'Umum') === selectedSubjek);
    }
    const titles = loans.map(t => t.buku);
    return [...new Set(titles)].sort();
  }, [db.transaksi, selectedSiswa, selectedSubjek]);

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
        <div className="bg-green-600 p-3 md:p-5 text-white flex justify-between items-center">
          <h3 className="font-bold text-base md:text-lg flex items-center gap-2"><RotateCcw size={20} /> Form Pengembalian Buku</h3>
          <p className="text-xs opacity-80">Proses pengembalian buku pinjaman siswa</p>
        </div>
        <div className="p-3 md:p-5">
          <form onSubmit={handleReturn} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tanggal Kembali</label>
                <input type="date" value={retDate} onChange={e => setRetDate(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kelas</label>
                <select value={selectedKelas} onChange={e => { setSelectedKelas(e.target.value); setSelectedSiswa(''); setSelectedSubjek(''); setSelectedBookTitle(''); setSelectedIds([]); }} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">-- Pilih Kelas --</option>
                  {uniqueKelas.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Siswa</label>
                <select value={selectedSiswa} onChange={e => { setSelectedSiswa(e.target.value); setSelectedIds([]); }} disabled={!selectedKelas} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none disabled:bg-slate-50">
                  <option value="">-- Pilih Siswa --</option>
                  {studentsInKelas.map(s => <option key={s.id} value={s.nama}>{s.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Subjek</label>
                <select value={selectedSubjek} onChange={e => { setSelectedSubjek(e.target.value); setSelectedBookTitle(''); setSelectedIds([]); }} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">-- Pilih Subjek --</option>
                  {uniqueSubjek.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Judul Buku</label>
                <select value={selectedBookTitle} onChange={e => { setSelectedBookTitle(e.target.value); setSelectedIds([]); }} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">-- Pilih Judul Buku --</option>
                  {uniqueTitles.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase">Daftar Buku Dipinjam:</label>
              <div className="min-h-[150px] max-h-64 overflow-y-auto border rounded-lg p-3 bg-slate-50 space-y-3">
                {!selectedKelas && !selectedSiswa && !selectedSubjek && !selectedBookTitle ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-10">
                    <Info size={32} />
                    <p className="text-sm italic">Pilih filter di atas untuk melihat daftar buku yang belum dikembalikan</p>
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
                           <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-bold text-blue-600 uppercase">{t.subjek || 'Umum'}</p>
                                <p className="font-bold text-slate-800">{t.buku}</p>
                                <p className="text-[10px] text-slate-500 font-mono">PENERBIT: {t.penerbit || '-'}</p>
                                <p className="text-[10px] text-slate-400 font-mono">KODE: {t.kode_eksemplar}</p>
                              </div>
                              {isLate && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">TERLAMBAT</span>}
                           </div>
                           <div className="mt-2 flex justify-between items-end border-t pt-2">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Pinjam: {t.tglPinjam} | Jatuh Tempo: {t.tglKembali}</p>
                              <p className="text-[10px] font-bold text-slate-600">{t.siswa} ({t.kelas})</p>
                           </div>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-green-600 gap-2 py-10">
                    <CheckSquare size={32} />
                    <p className="text-sm font-medium">Tidak ada pinjaman aktif yang sesuai dengan filter.</p>
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
