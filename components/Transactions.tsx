
import React, { useState, useMemo } from 'react';
import { AppState, BookType, Transaction, TransactionStatus } from '../types';
import { Send, CheckCircle, Search, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface TransactionsProps {
  db: AppState;
  setDb: React.Dispatch<React.SetStateAction<AppState>>;
}

const Transactions: React.FC<TransactionsProps> = ({ db, setDb }) => {
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState('');
  const [txType, setTxType] = useState<BookType>(BookType.UMUM);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  
  const [dates, setDates] = useState({
    pinjam: new Date().toISOString().split('T')[0],
    kembali: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    })()
  });

  const uniqueKelas = useMemo(() => [...new Set(db.siswa.map(s => s.kelas))].sort(), [db.siswa]);
  const studentsInKelas = useMemo(() => db.siswa.filter(s => s.kelas === selectedKelas), [db.siswa, selectedKelas]);
  const activeBooks = useMemo(() => db.buku.filter(b => b.jenis === txType), [db.buku, txType]);
  const activeLoans = useMemo(() => db.transaksi.filter(t => t.status === TransactionStatus.BORROWED), [db.transaksi]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswa || (txType === BookType.UMUM && !selectedBookId) || (txType === BookType.WAJIB && selectedBulkIds.length === 0)) {
      return Swal.fire('Error', 'Lengkapi data peminjaman', 'error');
    }

    const newTransactions: Transaction[] = [];
    const jam = new Date().toLocaleTimeString('id-ID');

    if (txType === BookType.UMUM) {
      const b = db.buku.find(x => x.id === selectedBookId)!;
      newTransactions.push({
        id: `TX-${Date.now()}`,
        tglPinjam: dates.pinjam,
        jam,
        siswa: selectedSiswa,
        kelas: selectedKelas,
        buku: b.judul,
        jenis: BookType.UMUM,
        pengarang: b.pengarang,
        penerbit: b.penerbit,
        tglKembali: dates.kembali,
        status: TransactionStatus.BORROWED,
        tglDikembalikan: '-'
      });
    } else {
      selectedBulkIds.forEach((bid, idx) => {
        const b = db.buku.find(x => x.id === bid)!;
        newTransactions.push({
          id: `TX-${Date.now()}-${idx}`,
          tglPinjam: dates.pinjam,
          jam,
          siswa: selectedSiswa,
          kelas: selectedKelas,
          buku: b.judul,
          jenis: BookType.WAJIB,
          pengarang: b.pengarang,
          penerbit: b.penerbit,
          tglKembali: dates.kembali,
          status: TransactionStatus.BORROWED,
          tglDikembalikan: '-'
        });
      });
    }

    setDb(prev => ({ ...prev, transaksi: [...prev.transaksi, ...newTransactions] }));
    setSelectedBookId('');
    setSelectedBulkIds([]);
    Swal.fire('Berhasil', `${newTransactions.length} buku dipinjam`, 'success');
  };

  const returnBook = (id: string) => {
    Swal.fire({
      title: 'Konfirmasi Kembali',
      text: 'Buku telah diterima kembali?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981'
    }).then(result => {
      if (result.isConfirmed) {
        setDb(prev => ({
          ...prev,
          transaksi: prev.transaksi.map(t => t.id === id ? { ...t, status: TransactionStatus.RETURNED, tglDikembalikan: new Date().toISOString().split('T')[0] } : t)
        }));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-slate-800 p-4 md:p-6 text-white">
          <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
            <Send size={20} /> Form Peminjaman Baru
          </h3>
        </div>
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b pb-2">Data Peminjam</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Pilih Kelas</label>
                  <select 
                    value={selectedKelas} 
                    onChange={(e) => { setSelectedKelas(e.target.value); setSelectedSiswa(''); }}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">-- Kelas --</option>
                    {uniqueKelas.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nama Siswa</label>
                  <select 
                    value={selectedSiswa} 
                    onChange={(e) => setSelectedSiswa(e.target.value)}
                    disabled={!selectedKelas}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    required
                  >
                    <option value="">-- Siswa --</option>
                    {studentsInKelas.map(s => <option key={s.id} value={s.nama}>{s.nama}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b pb-2">Detail Buku</h4>
              <div className="flex gap-4 p-1 bg-slate-100 rounded-lg">
                {[BookType.UMUM, BookType.WAJIB].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setTxType(type); setSelectedBookId(''); setSelectedBulkIds([]); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition ${txType === type ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Buku {type}
                  </button>
                ))}
              </div>

              {txType === BookType.UMUM ? (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Cari & Pilih Buku</label>
                  <select 
                    value={selectedBookId} 
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Pilih Buku Umum --</option>
                    {activeBooks.map(b => <option key={b.id} value={b.id}>{b.judul} - {b.pengarang}</option>)}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Pilih Buku Paket:</label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-slate-50 space-y-2">
                    {activeBooks.map(b => (
                      <label key={b.id} className="flex items-center gap-3 p-2 bg-white border rounded-md hover:border-blue-300 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedBulkIds.includes(b.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedBulkIds([...selectedBulkIds, b.id]);
                            else setSelectedBulkIds(selectedBulkIds.filter(id => id !== b.id));
                          }}
                          className="w-4 h-4 text-blue-600 rounded" 
                        />
                        <span className="text-xs font-medium text-slate-700">{b.judul}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Tgl Pinjam</label>
                  <input type="date" value={dates.pinjam} onChange={(e) => setDates({ ...dates, pinjam: e.target.value })} className="w-full border rounded p-2 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Wajib Kembali</label>
                  <input type="date" value={dates.kembali} onChange={(e) => setDates({ ...dates, kembali: e.target.value })} className="w-full border rounded p-2 text-xs" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-xl shadow-blue-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                <CheckCircle size={20} /> PROSES PEMINJAMAN
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Search size={18} /> Peminjaman Aktif (Belum Kembali)
        </h3>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Tgl/Jam</th>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">Buku</th>
                <th className="px-4 py-3">Jatuh Tempo</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeLoans.length > 0 ? activeLoans.map(t => {
                // Fix: Comparing timestamps directly to resolve "Operator '<' cannot be applied to types 'Date' and 'number'".
                const isOverdue = new Date(t.tglKembali).getTime() < new Date().setHours(0,0,0,0);
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{t.jam}</div>
                      <div className="text-[10px] text-slate-400">{t.tglPinjam}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-700">{t.siswa}</div>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500">{t.kelas}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{t.buku}</div>
                      <div className="text-[10px] text-slate-400 italic">Oleh {t.pengarang}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${isOverdue ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>{t.tglKembali}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => returnBook(t.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition transform active:scale-95">
                        KEMBALI
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 italic">Tidak ada peminjaman aktif</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
