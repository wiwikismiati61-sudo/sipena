
import React, { useState, useMemo } from 'react';
import { AppState, TransactionStatus } from '../types';
import { Download, FileText, User, RefreshCw, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

interface ReportsProps {
  db: AppState;
  setDb: React.Dispatch<React.SetStateAction<AppState>>;
}

const Reports: React.FC<ReportsProps> = ({ db, setDb }) => {
  const [filterSiswa, setFilterSiswa] = useState('');

  const uniqueBorrowers = useMemo(() => {
    return [...new Set(db.transaksi.map(t => t.siswa))].sort();
  }, [db.transaksi]);

  const filteredHistory = useMemo(() => {
    return db.transaksi
      .filter(t => !filterSiswa || t.siswa === filterSiswa)
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [db.transaksi, filterSiswa]);

  const exportGeneral = (type: 'pinjam' | 'kembali') => {
    const data = db.transaksi
      .filter(t => t.status === (type === 'pinjam' ? TransactionStatus.BORROWED : TransactionStatus.RETURNED))
      .map(t => ({
        'Tgl Transaksi': t.tglPinjam,
        'Jam': t.jam,
        'Siswa': t.siswa,
        'Kelas': t.kelas,
        'Buku': t.buku,
        'Status': t.status.toUpperCase(),
        ...(type === 'pinjam' ? { 'Batas Kembali': t.tglKembali } : { 'Tgl Kembali': t.tglDikembalikan })
      }));

    if (data.length === 0) return Swal.fire('Info', 'Tidak ada data', 'info');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `Laporan_${type === 'pinjam' ? 'Peminjaman' : 'Pengembalian'}.xlsx`);
  };

  const exportIndividual = () => {
    if (!filterSiswa) return Swal.fire('Error', 'Pilih siswa terlebih dahulu', 'error');
    const data = db.transaksi
      .filter(t => t.siswa === filterSiswa)
      .map(t => ({
        'Tgl Pinjam': t.tglPinjam,
        'Judul Buku': t.buku,
        'Status': t.status === TransactionStatus.BORROWED ? 'BELUM KEMBALI' : 'SUDAH KEMBALI',
        'Tgl Kembali': t.tglDikembalikan
      }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filterSiswa);
    XLSX.writeFile(wb, `Riwayat_${filterSiswa.replace(/\s+/g, '_')}.xlsx`);
  };

  const deleteTransaction = (id: string) => {
     Swal.fire({ title: 'Hapus riwayat ini?', text: 'Tindakan ini permanen', icon: 'warning', showCancelButton: true }).then(res => {
        if (res.isConfirmed) setDb(prev => ({ ...prev, transaksi: prev.transaksi.filter(t => t.id !== id) }));
     });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-blue-100 text-center space-y-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <FileText size={32} />
          </div>
          <h3 className="font-bold text-base md:text-lg">Laporan Peminjaman</h3>
          <p className="text-xs md:text-sm text-slate-500">Unduh data buku yang sedang dipinjam (Belum Kembali).</p>
          <button onClick={() => exportGeneral('pinjam')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 md:py-3 rounded-lg md:rounded-xl transition shadow-lg shadow-blue-200 text-xs md:text-sm">
            DOWNLOAD EXCEL (.xlsx)
          </button>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-green-100 text-center space-y-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <RefreshCw size={32} />
          </div>
          <h3 className="font-bold text-base md:text-lg">Laporan Pengembalian</h3>
          <p className="text-xs md:text-sm text-slate-500">Unduh histori data buku yang sudah dikembalikan.</p>
          <button onClick={() => exportGeneral('kembali')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 md:py-3 rounded-lg md:rounded-xl transition shadow-lg shadow-green-200 text-xs md:text-sm">
            DOWNLOAD EXCEL (.xlsx)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <User size={18} /> Riwayat Per Siswa
          </h3>
          <div className="flex w-full md:w-auto gap-2">
             <select 
               value={filterSiswa} 
               onChange={e => setFilterSiswa(e.target.value)}
               className="flex-1 border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
             >
                <option value="">-- Semua Siswa --</option>
                {uniqueBorrowers.map(n => <option key={n} value={n}>{n}</option>)}
             </select>
             <button onClick={exportIndividual} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
                <Download size={16} /> EXCEL
             </button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-xl">
           <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                 <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Tgl/Jam</th>
                    <th className="px-4 py-3">Siswa</th>
                    <th className="px-4 py-3">Buku</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y">
                 {filteredHistory.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                       <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === TransactionStatus.BORROWED ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                             {t.status === TransactionStatus.BORROWED ? 'Dipinjam' : 'Kembali'}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{t.tglPinjam}</div>
                          {t.status === TransactionStatus.RETURNED && <div className="text-[10px] text-green-600 font-bold">Ret: {t.tglDikembalikan}</div>}
                       </td>
                       <td className="px-4 py-3 font-bold text-slate-700">{t.siswa}</td>
                       <td className="px-4 py-3 text-slate-500">{t.buku}</td>
                       <td className="px-4 py-3 text-center">
                          <button onClick={() => deleteTransaction(t.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                       </td>
                    </tr>
                 ))}
                 {filteredHistory.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 italic">Tidak ada histori transaksi</td></tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
