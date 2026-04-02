
import React, { useState } from 'react';
import { AppState, BookType, Student, Teacher, Subject, LessonHour, Book } from '../types';
import { Trash2, Plus, Upload, FileText, Clock, GraduationCap, Users, Edit } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

interface MasterDataProps {
  db: AppState;
  setDb: React.Dispatch<React.SetStateAction<AppState>>;
}

const MasterData: React.FC<MasterDataProps> = ({ db, setDb }) => {
  const [activeSection, setActiveSection] = useState('siswa');
  const [bukuForm, setBukuForm] = useState<Partial<Book>>({ jenis: BookType.UMUM });
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  const handleImport = (type: 'siswa' | 'guru' | 'mapel' | 'buku', file: File) => {
    Swal.fire({
      title: 'Konfirmasi Import',
      text: `Import ini akan MENGHAPUS SEMUA DATA ${type.toUpperCase()} yang ada saat ini dan menggantinya dengan data dari Excel. Lanjutkan?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Tindih Data!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

          if (type === 'siswa') {
            const newData: Student[] = json.slice(1)
              .filter(row => row[0] && row[1])
              .map((row, i) => ({ id: `S-${Date.now()}-${i}`, nama: String(row[0]), kelas: String(row[1]) }));
            setDb(prev => ({ ...prev, siswa: newData }));
            Swal.fire('Import Berhasil', `${newData.length} siswa diimpor (data lama dihapus).`, 'success');
          } else if (type === 'guru') {
            const newData: Teacher[] = json.slice(1)
              .filter(row => row[0])
              .map((row, i) => ({ id: `G-${Date.now()}-${i}`, nama: String(row[0]) }));
            setDb(prev => ({ ...prev, guru: newData }));
            Swal.fire('Import Berhasil', `${newData.length} guru diimpor (data lama dihapus).`, 'success');
          } else if (type === 'mapel') {
            const newData: Subject[] = json.slice(1)
              .filter(row => row[0])
              .map((row, i) => ({ id: `M-${Date.now()}-${i}`, nama: String(row[0]) }));
            setDb(prev => ({ ...prev, mapel: newData }));
            Swal.fire('Import Berhasil', `${newData.length} mapel diimpor (data lama dihapus).`, 'success');
          } else if (type === 'buku') {
            const newData: Book[] = json.slice(1)
              .filter(row => row[0]) // Judul must exist
              .map((row, i) => ({
                id: `B-${Date.now()}-${i}`,
                no: i + 1,
                judul: String(row[0] || ''),
                jenis: String(row[1] || ''),
                edisi: String(row[2] || ''),
                isbn_issn: String(row[3] || ''),
                penerbit: String(row[4] || ''),
                tahun: String(row[5] || ''),
                kolasi: String(row[6] || ''),
                judul_seri: String(row[7] || ''),
                nomor_panggil: String(row[8] || ''),
                bahasa_buku: String(row[9] || ''),
                kota_terbit: String(row[10] || ''),
                nomor_kelas: String(row[11] || ''),
                catatan: String(row[12] || ''),
                penanggung_jawab: String(row[13] || ''),
                pengarang: String(row[14] || ''),
                subjek: String(row[15] || ''),
                kode_eksemplar: String(row[16] || ''),
              }));
            setDb(prev => ({ ...prev, buku: newData }));
            Swal.fire('Import Berhasil', `${newData.length} buku diimpor (data lama dihapus).`, 'success');
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const addStudentManual = () => {
    Swal.fire({
      title: 'Tambah Siswa',
      html: `
        <input id="swal-nama" class="swal2-input" placeholder="Nama Lengkap">
        <input id="swal-kelas" class="swal2-input" placeholder="Kelas">
      `,
      preConfirm: () => {
        const nama = (document.getElementById('swal-nama') as HTMLInputElement).value;
        const kelas = (document.getElementById('swal-kelas') as HTMLInputElement).value;
        if (!nama || !kelas) return Swal.showValidationMessage('Nama dan Kelas wajib diisi');
        return { nama, kelas };
      }
    }).then(result => {
      if (result.isConfirmed) {
        setDb(prev => ({ ...prev, siswa: [...prev.siswa, { ...result.value, id: `S-${Date.now()}` }] }));
      }
    });
  };

  const cancelEdit = () => {
    setEditingBookId(null);
    setBukuForm({ jenis: BookType.UMUM });
  };

  const handleEditBook = (book: Book) => {
    setEditingBookId(book.id);
    setBukuForm(book);
    document.getElementById('book-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBukuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bukuForm.judul) return;
    
    if (editingBookId) {
      setDb(prev => ({
        ...prev,
        buku: prev.buku.map(b => b.id === editingBookId ? ({ ...b, ...bukuForm } as Book) : b)
      }));
      Swal.fire('Sukses', 'Buku berhasil diperbarui', 'success');
    } else {
      const nextNo = db.buku.length > 0 ? Math.max(...db.buku.map(b => b.no || 0)) + 1 : 1;
      setDb(prev => ({
        ...prev,
        buku: [...prev.buku, { ...bukuForm, id: `B-${Date.now()}`, no: nextNo } as Book]
      }));
      Swal.fire('Sukses', 'Buku berhasil ditambahkan', 'success');
    }
    cancelEdit();
  };

  const deleteItem = (type: keyof AppState, id: string) => {
    Swal.fire({
      title: 'Hapus data ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Hapus'
    }).then(result => {
      if (result.isConfirmed) {
        setDb(prev => ({
          ...prev,
          [type]: (prev[type] as any[]).filter((item: any) => item.id !== id)
        }));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: 'siswa', label: 'Siswa', icon: Users },
          { id: 'buku', label: 'Buku', icon: FileText },
          { id: 'guru', label: 'Guru', icon: GraduationCap },
          { id: 'mapel', label: 'Mata Pelajaran', icon: FileText },
          { id: 'jam', label: 'Jam Belajar', icon: Clock }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === tab.id ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
        {activeSection === 'siswa' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Master Data Siswa</h3>
              <div className="flex gap-2">
                <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow">
                  <Upload size={14} /> IMPORT EXCEL
                  <input type="file" className="hidden" accept=".xlsx,.xls" onChange={(e) => e.target.files && handleImport('siswa', e.target.files[0])} />
                </label>
                <button onClick={addStudentManual} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow">
                  <Plus size={14} /> MANUAL
                </button>
              </div>
            </div>
            <div className="overflow-x-auto border rounded-lg max-h-[500px] w-full">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 sticky top-0 text-slate-500 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="px-3 py-2.5">Nama Lengkap</th>
                    <th className="px-3 py-2.5">Kelas</th>
                    <th className="px-3 py-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {db.siswa.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5">{s.nama}</td>
                      <td className="px-3 py-2.5">{s.kelas}</td>
                      <td className="px-3 py-2.5 text-center">
                        <button onClick={() => deleteItem('siswa', s.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'buku' && (
          <div className="space-y-6">
            <form id="book-form-section" onSubmit={handleBukuSubmit} className="bg-slate-50 p-4 md:p-6 rounded-xl border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800">
                  {editingBookId ? `Mengedit Buku: ${bukuForm.judul}` : 'Tambah Buku Baru'}
                </h4>
                <div className="flex gap-2">
                  <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow">
                    <Upload size={14} /> IMPORT EXCEL
                    <input type="file" className="hidden" accept=".xlsx,.xls" onChange={(e) => e.target.files && handleImport('buku', e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Judul Buku</label>
                  <input 
                    type="text" 
                    value={bukuForm.judul || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, judul: e.target.value })}
                    placeholder="Judul Buku"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenis Buku</label>
                  <input 
                    type="text" 
                    value={bukuForm.jenis || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, jenis: e.target.value })}
                    placeholder="Jenis Buku"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Edisi</label>
                  <input 
                    type="text" 
                    value={bukuForm.edisi || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, edisi: e.target.value })}
                    placeholder="Edisi"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">ISBN / ISSN</label>
                  <input 
                    type="text" 
                    value={bukuForm.isbn_issn || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, isbn_issn: e.target.value })}
                    placeholder="ISBN / ISSN"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Penerbit</label>
                  <input 
                    type="text" 
                    value={bukuForm.penerbit || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, penerbit: e.target.value })}
                    placeholder="Penerbit"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahun</label>
                  <input 
                    type="text" 
                    value={bukuForm.tahun || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, tahun: e.target.value })}
                    placeholder="Tahun"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kolasi</label>
                  <input 
                    type="text" 
                    value={bukuForm.kolasi || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, kolasi: e.target.value })}
                    placeholder="Kolasi"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Judul Seri</label>
                  <input 
                    type="text" 
                    value={bukuForm.judul_seri || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, judul_seri: e.target.value })}
                    placeholder="Judul Seri"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor Panggil</label>
                  <input 
                    type="text" 
                    value={bukuForm.nomor_panggil || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, nomor_panggil: e.target.value })}
                    placeholder="Nomor Panggil"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bahasa Buku</label>
                  <input 
                    type="text" 
                    value={bukuForm.bahasa_buku || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, bahasa_buku: e.target.value })}
                    placeholder="Bahasa Buku"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kota Terbit</label>
                  <input 
                    type="text" 
                    value={bukuForm.kota_terbit || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, kota_terbit: e.target.value })}
                    placeholder="Kota Terbit"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor Kelas</label>
                  <input 
                    type="text" 
                    value={bukuForm.nomor_kelas || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, nomor_kelas: e.target.value })}
                    placeholder="Nomor Kelas"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Catatan</label>
                  <input 
                    type="text" 
                    value={bukuForm.catatan || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, catatan: e.target.value })}
                    placeholder="Catatan"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Penanggung Jawab</label>
                  <input 
                    type="text" 
                    value={bukuForm.penanggung_jawab || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, penanggung_jawab: e.target.value })}
                    placeholder="Penanggung Jawab"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pengarang</label>
                  <input 
                    type="text" 
                    value={bukuForm.pengarang || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, pengarang: e.target.value })}
                    placeholder="Nama Pengarang"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subjek</label>
                  <input 
                    type="text" 
                    value={bukuForm.subjek || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, subjek: e.target.value })}
                    placeholder="Subjek"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kode Eksemplar</label>
                  <input 
                    type="text" 
                    value={bukuForm.kode_eksemplar || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, kode_eksemplar: e.target.value })}
                    placeholder="Kode Eksemplar"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="lg:col-span-4 flex justify-end items-center gap-2 mt-2">
                  {editingBookId && (
                    <button type="button" onClick={cancelEdit} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg text-sm font-bold transition">
                      BATAL
                    </button>
                  )}
                  <button type="submit" className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition transform active:scale-95 ${editingBookId ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}>
                    {editingBookId ? 'UPDATE BUKU' : 'SIMPAN BUKU'}
                  </button>
                </div>
              </div>
            </form>

            <div className="overflow-x-auto border rounded-lg max-h-[400px] w-full">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 text-slate-500 text-[10px] uppercase font-bold z-10">
                  <tr>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">No</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Judul</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Jenis</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Edisi</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">ISBN/ISSN</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Penerbit</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Tahun</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Kolasi</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Judul Seri</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">No Panggil</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Bahasa</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Kota Terbit</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">No Kelas</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Catatan</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Penanggung Jawab</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Pengarang</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Subjek</th>
                    <th className="px-3 py-2.5 border-b whitespace-nowrap">Kode Eksemplar</th>
                    <th className="px-3 py-2.5 border-b text-center sticky right-0 bg-slate-50 z-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {db.buku.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-bold text-slate-400 whitespace-nowrap">{b.no}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-700 min-w-[200px]">{b.judul}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.jenis}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.edisi}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.isbn_issn}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.penerbit}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.tahun}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.kolasi}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.judul_seri}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.nomor_panggil}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.bahasa_buku}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.kota_terbit}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.nomor_kelas}</td>
                      <td className="px-3 py-2.5 text-slate-500 min-w-[150px]">{b.catatan}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.penanggung_jawab}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.pengarang}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.subjek}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{b.kode_eksemplar}</td>
                      <td className="px-3 py-2.5 text-center sticky right-0 bg-white shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] group-hover:bg-slate-50">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEditBook(b)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={16} /></button>
                          <button onClick={() => deleteItem('buku', b.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ... Similar blocks for Guru, Mapel, Jam (shortened for brevity but functionality remains) ... */}
        {['guru', 'mapel', 'jam'].includes(activeSection) && (
          <div className="space-y-4">
             <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 capitalize">Master Data {activeSection}</h3>
              <div className="flex gap-2">
                {activeSection !== 'jam' && (
                  <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow">
                    <Upload size={14} /> IMPORT
                    <input type="file" className="hidden" onChange={(e) => e.target.files && handleImport(activeSection as any, e.target.files[0])} />
                  </label>
                )}
                <button 
                  onClick={() => {
                    Swal.fire({
                      title: `Tambah ${activeSection}`,
                      input: 'text',
                      inputPlaceholder: 'Masukkan label/nama',
                      showCancelButton: true
                    }).then(res => {
                      if (res.isConfirmed && res.value) {
                        setDb(prev => ({ 
                          ...prev, 
                          [activeSection]: [...(prev[activeSection as keyof AppState] as any[]), { id: `${activeSection}-${Date.now()}`, nama: res.value, label: res.value }] 
                        }));
                      }
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow"
                >
                  <Plus size={14} /> TAMBAH
                </button>
              </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
               <table className="w-full text-sm text-left">
                  <tbody className="divide-y">
                    {(db[activeSection as keyof AppState] as any[]).map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-medium text-slate-700">{item.nama || item.label}</td>
                        <td className="px-3 py-2.5 text-center">
                          <button onClick={() => deleteItem(activeSection as any, item.id)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterData;
