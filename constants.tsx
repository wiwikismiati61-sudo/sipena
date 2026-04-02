
import { AppState, BookType } from './types';

export const DEFAULT_STATE: AppState = {
  auth: { user: 'admin', pass: 'admin' },
  siswa: [],
  guru: [],
  mapel: [],
  jam: [],
  buku: [],
  transaksi: [],
  kunjungan: [],
  kunjunganSiswa: []
};
