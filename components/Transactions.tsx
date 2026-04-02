
import React, { useState, useMemo } from 'react';
import { AppState, BookType, Transaction, TransactionStatus } from '../types';
import { Send, CheckCircle, Search, Trash2, Edit } from 'lucide-react';
import Swal from 'sweetalert2';

interface TransactionsProps {
  db: AppState;
  setDb: React.Dispatch<React.SetStateAction<AppState>>;
}

const Transactions: React.FC<TransactionsProps> = ({ db, setDb }) => {
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState('');
  const [selectedSubjek, setSelectedSubjek] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  
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
  const uniqueSubjek = useMemo(() => {
    const subjects = db.buku.map(b => b.subjek || 'Umum');
    return [...new Set(subjects)].sort();
  }, [db.buku]);
  const booksInSubjek = useMemo(() => {
    return db.buku.filter(b => (b.subjek || 'Umum') === selectedSubjek);
  }, [db.buku, selectedSubjek]);
  const activeLoans = useMemo(() => {
    let loans = db.transaksi.filter(t => t.status === TransactionStatus.BORROWED);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      loans = loans.filter(t => 
        t.siswa.toLowerCase().includes(q) || 
        t.buku.toLowerCase().includes(q) || 
        t.kode_eksemplar.toLowerCase().includes(q) ||
        t.kelas.toLowerCase().includes(q)
      );
    }
    return loans;
  }, [db.transaksi, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswa || !selectedBookId) {
      return Swal.fire('Error', 'Lengkapi data peminjaman', 'error');
    }

    const newTransactions: Transaction[] = [];
    const jam = new Date().toLocaleTimeString('id-ID');

    const b = db.buku.find(x => x.id === selectedBookId)!;
    
    if (editingTransactionId) {
      setDb(prev => ({
        ...prev,
        transaksi: prev.transaksi.map(t => t.id === editingTransactionId ? {
          ...t,
          tglPinjam: dates.pinjam,
          siswa: selectedSiswa,
          kelas: selectedKelas,
          buku: b.judul,
          subjek: b.subjek,
          kode_eksemplar: b.kode_eksemplar,
          jenis: b.jenis as any,
          pengarang: b.pengarang,
          penerbit: b.penerbit,
          tglKembali: dates.kembali,
        } : t)
      }));
      setEditingTransactionId(null);
      Swal.fire('Berhasil', 'Data peminjaman berhasil diperbarui', 'success');
    } else {
      newTransactions.push({
        id: `TX-${Date.now()}`,
        tglPinjam: dates.pinjam,
        jam,
        siswa: selectedSiswa,
        kelas: selectedKelas,
        buku: b.judul,
        subjek: b.subjek,
        kode_eksemplar: b.kode_eksemplar,
        jenis: b.jenis as any,
        pengarang: b.pengarang,
        penerbit: b.penerbit,
        tglKembali: dates.kembali,
        status: TransactionStatus.BORROWED,
        tglDikembalikan: '-'
      });

      setDb(prev => ({ ...prev, transaksi: [...prev.transaksi, ...newTransactions] }));
      Swal.fire('Berhasil', `Buku "${b.judul}" berhasil dipinjam`, 'success');
    }
    
    setSelectedBookId('');
    setSelectedSubjek('');
    setSelectedSiswa('');
    setSelectedKelas('');
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransactionId(t.id);
    setSelectedKelas(t.kelas);
    setSelectedSiswa(t.siswa);
    setSelectedSubjek(t.subjek || 'Umum');
    
    // Find book by title and subject to set selectedBookId
    const book = db.buku.find(b => b.judul === t.buku && (b.subjek || 'Umum') === (t.subjek || 'Umum'));
    if (book) setSelectedBookId(book.id);
    
    setDates({
      pinjam: t.tglPinjam,
      kembali: t.tglKembali
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTransaction = (id: string) => {
    Swal.fire({
      title: 'Hapus Peminjaman?',
      text: 'Data ini akan dihapus permanen dari riwayat aktif.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    }).then(result => {
      if (result.isConfirmed) {
        setDb(prev => ({
          ...prev,
          transaksi: prev.transaksi.filter(t => t.id !== id)
        }));
        Swal.fire('Terhapus', 'Data peminjaman telah dihapus', 'success');
      }
    });
  };

  const cancelEdit = () => {
    setEditingTransactionId(null);
    setSelectedKelas('');
    setSelectedSiswa('');
    setSelectedSubjek('');
    setSelectedBookId('');
    setDates({
      pinjam: new Date().toISOString().split('T')[0],
      kembali: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split('T')[0];
      })()
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-slate-800 p-3 md:p-5 text-white flex justify-between items-center">
          <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
            <Send size={20} /> {editingTransactionId ? 'Edit Peminjaman' : 'Form Peminjaman Baru'}
          </h3>
          {editingTransactionId && (
            <button onClick={cancelEdit} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg transition">
              BATAL EDIT
            </button>
          )}
        </div>
        <div className="p-3 md:p-5">
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
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Pilih Subjek</label>
                  <select 
                    value={selectedSubjek} 
                    onChange={(e) => { setSelectedSubjek(e.target.value); setSelectedBookId(''); }}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">-- Subjek --</option>
                    {uniqueSubjek.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Pilih Judul Buku</label>
                  <select 
                    value={selectedBookId} 
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    disabled={!selectedSubjek}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    required
                  >
                    <option value="">-- Judul Buku --</option>
                    {booksInSubjek.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.subjek || 'Umum'} ; {b.judul} ({b.kode_eksemplar})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
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
              <button type="submit" className={`w-full ${editingTransactionId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-3.5 rounded-xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2`}>
                <CheckCircle size={20} /> {editingTransactionId ? 'UPDATE PEMINJAMAN' : 'PROSES PEMINJAMAN'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-3 md:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Search size={18} /> Peminjaman Aktif (Belum Kembali)
          </h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari Siswa / Buku / Kode..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
              <tr>
                <th className="px-3 py-2.5">Tgl/Jam</th>
                <th className="px-3 py-2.5">Siswa</th>
                <th className="px-3 py-2.5">Subjek</th>
                <th className="px-3 py-2.5">Buku</th>
                <th className="px-3 py-2.5">Penerbit</th>
                <th className="px-3 py-2.5">Jatuh Tempo</th>
                <th className="px-3 py-2.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeLoans.length > 0 ? activeLoans.map(t => {
                const isOverdue = new Date(t.tglKembali).getTime() < new Date().setHours(0,0,0,0);
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-800">{t.jam}</div>
                      <div className="text-[10px] text-slate-400">{t.tglPinjam}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-700">{t.siswa}</div>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500">{t.kelas}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-[10px] font-bold text-blue-600">{t.subjek || 'Umum'}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-800">{t.buku}</div>
                      <div className="text-[10px] text-slate-400 italic">Oleh {t.pengarang}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-xs text-slate-600">{t.penerbit}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`font-bold ${isOverdue ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>{t.tglKembali}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleEditTransaction(t)} 
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition transform active:scale-95 shadow-sm"
                          title="Edit Peminjaman"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => deleteTransaction(t.id)} 
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition transform active:scale-95 shadow-sm"
                          title="Hapus Peminjaman"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 italic">Tidak ada peminjaman aktif</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
