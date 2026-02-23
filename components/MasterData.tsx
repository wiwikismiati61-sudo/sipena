
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

  const handleImport = (type: 'siswa' | 'guru' | 'mapel', file: File) => {
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
        Swal.fire('Import Berhasil', `${newData.length} siswa baru diimpor.`, 'success');
      } else if (type === 'guru') {
        const newData: Teacher[] = json.slice(1)
          .filter(row => row[0])
          .map((row, i) => ({ id: `G-${Date.now()}-${i}`, nama: String(row[0]) }));
        setDb(prev => ({ ...prev, guru: newData }));
        Swal.fire('Import Berhasil', `${newData.length} guru baru diimpor.`, 'success');
      } else if (type === 'mapel') {
        const newData: Subject[] = json.slice(1)
          .filter(row => row[0])
          .map((row, i) => ({ id: `M-${Date.now()}-${i}`, nama: String(row[0]) }));
        setDb(prev => ({ ...prev, mapel: newData }));
        Swal.fire('Import Berhasil', `${newData.length} mapel baru diimpor.`, 'success');
      }
    };
    reader.readAsArrayBuffer(file);
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
    if (!bukuForm.judul || !bukuForm.pengarang || !bukuForm.penerbit) return;
    
    if (editingBookId) {
      setDb(prev => ({
        ...prev,
        buku: prev.buku.map(b => b.id === editingBookId ? ({ ...b, ...bukuForm } as Book) : b)
      }));
      Swal.fire('Sukses', 'Buku berhasil diperbarui', 'success');
    } else {
      setDb(prev => ({
        ...prev,
        buku: [...prev.buku, { ...bukuForm, id: `B-${Date.now()}` } as Book]
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
      <div className="flex flex-wrap gap-2">
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

      <div className="bg-white rounded-xl shadow-sm border p-6">
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
            <div className="overflow-x-auto border rounded-lg max-h-[500px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 sticky top-0 text-slate-500 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="px-6 py-3">Nama Lengkap</th>
                    <th className="px-6 py-3">Kelas</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {db.siswa.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">{s.nama}</td>
                      <td className="px-6 py-3">{s.kelas}</td>
                      <td className="px-6 py-3 text-center">
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
            <form id="book-form-section" onSubmit={handleBukuSubmit} className="bg-slate-50 p-6 rounded-xl border">
              <h4 className="font-bold text-slate-800 mb-4 col-span-full">
                {editingBookId ? `Mengedit Buku: ${bukuForm.judul}` : 'Tambah Buku Baru'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenis Buku</label>
                  <select 
                    value={bukuForm.jenis}
                    onChange={(e) => setBukuForm({ ...bukuForm, jenis: e.target.value as BookType })}
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={BookType.UMUM}>Buku Umum/Fiksi</option>
                    <option value={BookType.WAJIB}>Buku Paket (Wajib)</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Judul / Mapel</label>
                  <input 
                    type="text" 
                    value={bukuForm.judul || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, judul: e.target.value })}
                    placeholder="Judul Buku"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
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
                    required
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
                    required
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

            <div className="overflow-x-auto border rounded-lg max-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 sticky top-0 text-slate-500 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="px-6 py-3">Jenis</th>
                    <th className="px-6 py-3">Judul</th>
                    <th className="px-6 py-3">Pengarang</th>
                    <th className="px-6 py-3">Penerbit</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {db.buku.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.jenis === BookType.WAJIB ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {b.jenis}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-700">{b.judul}</td>
                      <td className="px-6 py-3 text-slate-500">{b.pengarang}</td>
                      <td className="px-6 py-3 text-slate-500">{b.penerbit}</td>
                      <td className="px-6 py-3 text-center">
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
                        <td className="px-6 py-3 font-medium text-slate-700">{item.nama || item.label}</td>
                        <td className="px-6 py-3 text-center">
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
