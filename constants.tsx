
import { AppState, BookType } from './types';

export const DEFAULT_STATE: AppState = {
  auth: { user: 'admin', pass: 'admin' },
  siswa: [
    { id: '1', nama: 'Budi Santoso', kelas: '7A' },
    { id: '2', nama: 'Siti Aminah', kelas: '8B' },
    { id: '3', nama: 'Rudi Hartono', kelas: '9C' }
  ],
  guru: [
    { id: '1', nama: 'NUR FADILAH, S.Pd' },
    { id: '2', nama: 'NUR ARINAH, S.Pd' }
  ],
  mapel: [
    { id: '1', nama: 'BAHASA INDONESIA' },
    { id: '2', nama: 'BAHASA INGGRIS' },
    { id: '3', nama: 'MATEMATIKA' },
    { id: '4', nama: 'IPA' }
  ],
  jam: [
    { id: '1', label: '1. (07.15 - 07.55)' },
    { id: '2', label: '2. (07.55 - 08.35)' },
    { id: '3', label: '3. (08.35 - 09.15)' },
    { id: '4', label: '4. (09.15 - 09.55)' },
    { id: '5', label: 'Istirahat (09.55 - 10.35)' },
    { id: '6', label: '5. (10.35 - 11.15)' },
    { id: '7', label: '6. (11.15 - 11.55)' },
    { id: '8', label: '7. (11.55 - 12.35)' },
    { id: '9', label: '8. (12.35 - 13.15)' }
  ],
  buku: [
    { id: 'B001', jenis: BookType.WAJIB, judul: 'Matematika', pengarang: 'Kemendikbud', penerbit: 'Pusat Kurikulum' },
    { id: 'B002', jenis: BookType.UMUM, judul: 'Laskar Pelangi', pengarang: 'Andrea Hirata', penerbit: 'Bentang Pustaka' }
  ],
  transaksi: [],
  kunjungan: [],
  kunjunganSiswa: []
};
