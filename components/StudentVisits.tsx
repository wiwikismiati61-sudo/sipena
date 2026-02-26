
import React, { useState, useMemo } from 'react';
import { AppState, StudentVisit } from '../types';
import { UserSquare, Plus, Save, Trash2, Edit, Download, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

interface StudentVisitsProps {
  db: AppState;
  setDb: React.Dispatch<React.SetStateAction<AppState>>;
}

const KEPERLUAN_OPTIONS = [
  'Belajar mandiri',
  'Membaca',
  'Mengembalikan',
  'Meminjam Buku',
  'Lainnya...',
];

const StudentVisits: React.FC<StudentVisitsProps> = ({ db, setDb }) => {
  const initialFormState = {
    tgl: new Date().toISOString().split('T')[0],
    jam: new Date().toTimeString().slice(0, 5),
    kelas: '',
    nama: '',
    keperluan: KEPERLUAN_OPTIONS[0],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [otherKeperluan, setOtherKeperluan] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const uniqueKelas = useMemo(() => [...new Set(db.siswa.map(s => s.kelas))].sort(), [db.siswa]);
  const studentsInClass = useMemo(() => db.siswa.filter(s => s.kelas === formData.kelas), [db.siswa, formData.kelas]);
  const studentVisits = useMemo(() => db.kunjunganSiswa || [], [db.kunjunganSiswa]);

  const resetForm = () => {
    setFormData(initialFormState);
    setOtherKeperluan('');
    setIsEditing(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalKeperluan = formData.keperluan === 'Lainnya...' ? otherKeperluan : formData.keperluan;
    if (!formData.kelas || !formData.nama || !finalKeperluan) {
      return Swal.fire('Error', 'Semua field wajib diisi', 'error');
    }

    if (isEditing) {
      setDb(prev => ({
        ...prev,
        kunjunganSiswa: (prev.kunjunganSiswa || []).map(v =>
          v.id === isEditing ? { ...v, ...formData, keperluan: finalKeperluan } : v
        ),
      }));
      Swal.fire('Sukses', 'Data kunjungan berhasil diperbarui', 'success');
    } else {
      const newVisit: StudentVisit = {
        id: `SV-${Date.now()}`,
        ...formData,
        keperluan: finalKeperluan,
      };
      setDb(prev => ({ ...prev, kunjunganSiswa: [...(prev.kunjunganSiswa || []), newVisit] }));
      Swal.fire('Sukses', 'Kunjungan siswa berhasil dicatat', 'success');
    }
    resetForm();
  };

  const handleEdit = (visit: StudentVisit) => {
    setIsEditing(visit.id);
    const isOther = !KEPERLUAN_OPTIONS.includes(visit.keperluan);
    setFormData({
      tgl: visit.tgl,
      jam: visit.jam,
      kelas: visit.kelas,
      nama: visit.nama,
      keperluan: isOther ? 'Lainnya...' : visit.keperluan,
    });
    if (isOther) {
      setOtherKeperluan(visit.keperluan);
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Yakin hapus data ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    }).then(result => {
      if (result.isConfirmed) {
        setDb(prev => ({
          ...prev,
          kunjunganSiswa: (prev.kunjunganSiswa || []).filter(v => v.id !== id),
        }));
      }
    });
  };

  const exportToExcel = () => {
    if (studentVisits.length === 0) return Swal.fire('Info', 'Tidak ada data untuk di-export', 'info');
    const dataToExport = studentVisits.map(({ id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kunjungan Siswa');
    XLSX.writeFile(wb, 'Laporan_Kunjungan_Siswa.xlsx');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 sticky top-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <UserSquare size={18} /> {isEditing ? 'Edit Kunjungan' : 'Form Kunjungan Siswa'}
              </h3>
              {isEditing && (
                <button type="button" onClick={resetForm} className="p-1 text-slate-400 hover:text-red-500">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Tanggal</label>
                <input type="date" value={formData.tgl} onChange={e => setFormData({ ...formData, tgl: e.target.value })} className="w-full mt-1 border rounded-lg p-2 text-sm" required />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Jam</label>
                <input type="time" value={formData.jam} onChange={e => setFormData({ ...formData, jam: e.target.value })} className="w-full mt-1 border rounded-lg p-2 text-sm" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Kelas</label>
              <select value={formData.kelas} onChange={e => setFormData({ ...formData, kelas: e.target.value, nama: '' })} className="w-full mt-1 border rounded-lg p-2 text-sm" required>
                <option value="">-- Pilih Kelas --</option>
                {uniqueKelas.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nama Siswa</label>
              <select value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} disabled={!formData.kelas} className="w-full mt-1 border rounded-lg p-2 text-sm disabled:bg-slate-50" required>
                <option value="">-- Pilih Siswa --</option>
                {studentsInClass.map(s => <option key={s.id} value={s.nama}>{s.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Keperluan</label>
              <select value={formData.keperluan} onChange={e => setFormData({ ...formData, keperluan: e.target.value })} className="w-full mt-1 border rounded-lg p-2 text-sm" required>
                {KEPERLUAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {formData.keperluan === 'Lainnya...' && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Tulis Keperluan</label>
                <input type="text" value={otherKeperluan} onChange={e => setOtherKeperluan(e.target.value)} placeholder="Contoh: Mengerjakan tugas kelompok" className="w-full mt-1 border rounded-lg p-2 text-sm" required />
              </div>
            )}
            <button type="submit" className={`w-full font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 ${isEditing ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}>
              {isEditing ? <><Save size={16} /> Update Data</> : <><Plus size={16} /> Simpan Kunjungan</>}
            </button>
          </form>
        </div>
      </div>

      <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="font-bold text-slate-800">Riwayat Kunjungan Siswa</h3>
          <button onClick={exportToExcel} className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-1">
            <Download size={14} /> EXCEL
          </button>
        </div>
        <div className="overflow-x-auto border rounded-xl max-h-[70vh]">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold sticky top-0">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">Keperluan</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...studentVisits].reverse().map(v => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-bold">{v.tgl}</div>
                    <div className="text-xs text-slate-400">{v.jam}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700">{v.nama}</div>
                    <div className="text-xs text-slate-400">{v.kelas}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{v.keperluan}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(v)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {studentVisits.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">Belum ada data kunjungan siswa.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentVisits;
