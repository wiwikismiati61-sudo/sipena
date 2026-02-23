
export enum BookType {
  WAJIB = 'Wajib',
  UMUM = 'Umum'
}

export enum TransactionStatus {
  BORROWED = 'borrowed',
  RETURNED = 'returned'
}

export interface Student {
  id: string;
  nama: string;
  kelas: string;
}

export interface Teacher {
  id: string;
  nama: string;
}

export interface Subject {
  id: string;
  nama: string;
}

export interface LessonHour {
  id: string;
  label: string;
}

export interface Book {
  id: string;
  jenis: BookType;
  judul: string;
  pengarang: string;
  penerbit: string;
}

export interface Transaction {
  id: string;
  tglPinjam: string;
  jam: string;
  siswa: string;
  kelas: string;
  buku: string;
  jenis: BookType;
  pengarang: string;
  penerbit: string;
  tglKembali: string;
  status: TransactionStatus;
  tglDikembalikan: string;
}

export interface Visit {
  id: string;
  tgl: string;
  kelas: string;
  guru: string;
  mapel: string;
  jam: string;
}

export interface StudentVisit {
  id: string;
  tgl: string;
  jam: string;
  kelas: string;
  nama: string;
  keperluan: string;
}

export interface AppState {
  auth: { user: string; pass: string };
  siswa: Student[];
  guru: Teacher[];
  mapel: Subject[];
  jam: LessonHour[];
  buku: Book[];
  transaksi: Transaction[];
  kunjungan: Visit[];
  kunjunganSiswa: StudentVisit[];
}
