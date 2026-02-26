
import React from 'react';
import { AppState, TransactionStatus } from '../types';
import { Users, UserCheck, BookOpen, CheckCircle, PieChart, Download, AlertCircle, UserSquare } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

interface DashboardProps {
  db: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ db }) => {
  const activeLoans = db.transaksi.filter(t => t.status === TransactionStatus.BORROWED);
  const returnedLoans = db.transaksi.filter(t => t.status === TransactionStatus.RETURNED);
  
  const totalJamKunjungan = db.kunjungan.reduce((acc, curr) => acc + (curr.jam ? curr.jam.split(',').length : 0), 0);
  const uniqueKelasKunjungan = new Set(db.kunjungan.map(k => k.kelas)).size;
  const totalSiswaVisits = (db.kunjunganSiswa || []).length;

  const borrowerCount: Record<string, number> = {};
  db.transaksi.forEach(t => { borrowerCount[t.siswa] = (borrowerCount[t.siswa] || 0) + 1; });
  const sortedBorrowers = Object.entries(borrowerCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueList = activeLoans.filter(t => new Date(t.tglKembali) < today);
  const uniqueOverdueStudents = new Set(overdueList.map(t => t.siswa)).size;

  const uniqueBorrowers = new Set(db.transaksi.map(t => t.siswa)).size;
  const percentage = db.siswa.length > 0 ? ((uniqueBorrowers / db.siswa.length) * 100).toFixed(1) : '0';

  const exportTopBorrowers = () => {
    if (sortedBorrowers.length === 0) return Swal.fire('Info', 'Belum ada data', 'info');
    const data = sortedBorrowers.map(([nama, count]) => {
      const siswa = db.siswa.find(s => s.nama === nama);
      return { 'Nama Siswa': nama, 'Kelas': siswa?.kelas || '-', 'Total Pinjam': count };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Top Borrowers');
    XLSX.writeFile(wb, 'Laporan_Top_Borrowers.xlsx');
  };

  const exportOverdue = () => {
    if (overdueList.length === 0) return Swal.fire('Info', 'Tidak ada keterlambatan', 'info');
    const data = overdueList.map(t => ({ 'Nama Siswa': t.siswa, 'Kelas': t.kelas, 'Buku': t.buku, 'Jatuh Tempo': t.tglKembali }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jatuh Tempo');
    XLSX.writeFile(wb, 'Laporan_Jatuh_Tempo.xlsx');
  };

  const stats = [
    { label: 'Total Siswa', value: db.siswa.length, icon: Users, color: 'blue' },
    { label: 'Total Guru', value: db.guru.length, icon: UserCheck, color: 'purple' },
    { label: 'Kunjungan Kelas', value: `${totalJamKunjungan} Jam`, sub: `${uniqueKelasKunjungan} Kelas`, icon: Users, color: 'teal' },
    { label: 'Kunjungan Siswa', value: totalSiswaVisits, icon: UserSquare, color: 'pink' },
    { label: 'Dipinjam', value: activeLoans.length, sub: `${new Set(activeLoans.map(t => t.siswa)).size} Siswa`, icon: BookOpen, color: 'orange' },
    { label: 'Partisipasi', value: `${percentage}%`, icon: PieChart, color: 'indigo' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 border-${s.color}-500`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{s.value}</h3>
                {s.sub && <p className="text-xs text-gray-500">{s.sub}</p>}
              </div>
              <div className={`p-2 bg-${s.color}-50 rounded-lg text-${s.color}-600`}>
                <s.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Top 10 Peminjam</h3>
            <button onClick={exportTopBorrowers} className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold hover:bg-blue-200">
              <Download size={12} className="inline mr-1" /> EXCEL
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3 text-center">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedBorrowers.length > 0 ? sortedBorrowers.map(([nama, count], idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{nama}</td>
                    <td className="px-4 py-3 text-slate-500">{db.siswa.find(s => s.nama === nama)?.kelas || '-'}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600">{count}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-red-50">
            <h3 className="font-bold text-red-600 flex items-center">
              <AlertCircle size={18} className="mr-2" />
              Jatuh Tempo <span className="ml-2 text-[10px] bg-red-100 px-2 py-0.5 rounded-full border border-red-200">{uniqueOverdueStudents} Siswa</span>
            </h3>
            <button onClick={exportOverdue} className="text-[10px] bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold hover:bg-red-200">
              <Download size={12} className="inline mr-1" /> EXCEL
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-red-50 text-red-700 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Buku</th>
                  <th className="px-4 py-3">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {overdueList.length > 0 ? overdueList.map((t, idx) => (
                  <tr key={idx} className="bg-red-50/30 hover:bg-red-50">
                    <td className="px-4 py-3 font-medium text-red-800">{t.siswa}</td>
                    <td className="px-4 py-3 text-red-600 truncate max-w-[150px]">{t.buku}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{t.tglKembali}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-green-600 italic">Tidak ada pinjaman terlambat</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
