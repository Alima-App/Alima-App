// ============================================================
// ALIMA APP — DUMMY DATA (JavaScript)
// Gunakan file ini saat development untuk skip request ke
// Supabase dan langsung tampilkan UI tanpa loading.
//
// CARA PAKAI:
// Di js/supabase.js, tambahkan:
//   import { USE_DUMMY, dummyDb } from './dummy-data.js';
// Lalu wrap setiap query dengan:
//   if (USE_DUMMY) return dummyDb.kelas.list();
// ============================================================

// Set true = pakai data dummy (offline), false = pakai Supabase
export const USE_DUMMY = true;

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const PROFILES = [
  { id: 'dosen-001', nama: 'Dr. Ahmad Fauzi, M.Pd',          peran: 'dosen',     email: 'ahmad.fauzi@alima.test' },
  { id: 'dosen-002', nama: 'Ustadzah Maryam Sholihah, Lc',   peran: 'dosen',     email: 'maryam.sholihah@alima.test' },
  { id: 'mhs-001',   nama: 'Budi Santoso',                   peran: 'mahasiswa', email: 'budi@alima.test' },
  { id: 'mhs-002',   nama: 'Siti Rahmah',                    peran: 'mahasiswa', email: 'siti@alima.test' },
  { id: 'mhs-003',   nama: 'Rizky Pratama',                  peran: 'mahasiswa', email: 'rizky@alima.test' },
  { id: 'mhs-004',   nama: 'Dewi Anggraini',                 peran: 'mahasiswa', email: 'dewi@alima.test' },
  { id: 'mhs-005',   nama: 'Fajar Nugroho',                  peran: 'mahasiswa', email: 'fajar@alima.test' },
  { id: 'mhs-006',   nama: 'Nurul Hidayah',                  peran: 'mahasiswa', email: 'nurul@alima.test' },
];

const KELAS = [
  { id: 'kelas-001', nama: 'Bahasa Arab Dasar A',  kode: 'ARAB1A', pengajar_id: 'dosen-001', created_at: '2026-08-01T07:00:00Z' },
  { id: 'kelas-002', nama: 'Bahasa Arab Dasar B',  kode: 'ARAB1B', pengajar_id: 'dosen-001', created_at: '2026-08-01T07:30:00Z' },
  { id: 'kelas-003', nama: 'Bahasa Arab Menengah', kode: 'ARAB2A', pengajar_id: 'dosen-002', created_at: '2026-08-02T08:00:00Z' },
];

const ANGGOTA_KELAS = [
  { kelas_id: 'kelas-001', mahasiswa_id: 'mhs-001', joined_at: '2026-08-03T08:00:00Z', profiles: { nama: 'Budi Santoso',   email: 'budi@alima.test' } },
  { kelas_id: 'kelas-001', mahasiswa_id: 'mhs-002', joined_at: '2026-08-03T08:10:00Z', profiles: { nama: 'Siti Rahmah',    email: 'siti@alima.test' } },
  { kelas_id: 'kelas-001', mahasiswa_id: 'mhs-003', joined_at: '2026-08-03T08:20:00Z', profiles: { nama: 'Rizky Pratama',  email: 'rizky@alima.test' } },
  { kelas_id: 'kelas-001', mahasiswa_id: 'mhs-004', joined_at: '2026-08-03T08:30:00Z', profiles: { nama: 'Dewi Anggraini', email: 'dewi@alima.test' } },
  { kelas_id: 'kelas-002', mahasiswa_id: 'mhs-005', joined_at: '2026-08-04T09:00:00Z', profiles: { nama: 'Fajar Nugroho',  email: 'fajar@alima.test' } },
  { kelas_id: 'kelas-002', mahasiswa_id: 'mhs-006', joined_at: '2026-08-04T09:10:00Z', profiles: { nama: 'Nurul Hidayah',  email: 'nurul@alima.test' } },
  { kelas_id: 'kelas-003', mahasiswa_id: 'mhs-001', joined_at: '2026-08-05T10:00:00Z', profiles: { nama: 'Budi Santoso',   email: 'budi@alima.test' } },
  { kelas_id: 'kelas-003', mahasiswa_id: 'mhs-003', joined_at: '2026-08-05T10:10:00Z', profiles: { nama: 'Rizky Pratama',  email: 'rizky@alima.test' } },
  { kelas_id: 'kelas-003', mahasiswa_id: 'mhs-005', joined_at: '2026-08-05T10:20:00Z', profiles: { nama: 'Fajar Nugroho',  email: 'fajar@alima.test' } },
];

const KELOMPOK = [
  { id: 'klp-001', kelas_id: 'kelas-001', nama: 'Kelompok Al-Fath',     created_at: '2026-08-05T08:00:00Z' },
  { id: 'klp-002', kelas_id: 'kelas-001', nama: 'Kelompok Al-Baqarah',  created_at: '2026-08-05T08:05:00Z' },
  { id: 'klp-003', kelas_id: 'kelas-003', nama: 'Kelompok Al-Ikhlas',   created_at: '2026-08-06T09:00:00Z' },
];

const MATERI = [
  {
    id: 'mat-001', kelas_id: 'kelas-001', urutan: 1,
    judul: 'Pertemuan 1 — Pengenalan Huruf Hijaiyah',
    tipe: 'teks',
    isi_teks: 'Huruf Hijaiyah adalah huruf-huruf dalam aksara Arab yang berjumlah 28 huruf.\n\nBerikut beberapa huruf dasar:\n١. أ — Alif\n٢. ب — Ba\n٣. ت — Ta\n٤. ث — Tsa\n٥. ج — Jim\n...\n\nSetiap huruf memiliki bentuk yang berbeda tergantung posisinya dalam kata (awal, tengah, akhir, atau berdiri sendiri).',
    file_key: null, url_eksternal: null,
    created_at: '2026-08-10T07:00:00Z',
  },
  {
    id: 'mat-002', kelas_id: 'kelas-001', urutan: 2,
    judul: 'Pertemuan 2 — Harakat (Tanda Baca Arab)',
    tipe: 'teks',
    isi_teks: 'Harakat adalah tanda baca dalam bahasa Arab yang menentukan cara membaca huruf.\n\n1. Fathah ( َ ) — dibaca "a"\n2. Kasrah ( ِ ) — dibaca "i"\n3. Dhammah ( ُ ) — dibaca "u"\n4. Sukun ( ْ ) — huruf mati\n5. Tanwin — penambahan bunyi "n" di akhir kata\n6. Tasydid ( ّ ) — huruf dibaca double',
    file_key: null, url_eksternal: null,
    created_at: '2026-08-17T07:00:00Z',
  },
  {
    id: 'mat-003', kelas_id: 'kelas-001', urutan: 3,
    judul: 'Pertemuan 3 — Video: Pelafalan Huruf Arab',
    tipe: 'link',
    isi_teks: null, file_key: null,
    url_eksternal: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: '2026-08-24T07:00:00Z',
  },
  {
    id: 'mat-004', kelas_id: 'kelas-001', urutan: 4,
    judul: 'Pertemuan 4 — Mufrodat Dasar (Kosakata)',
    tipe: 'teks',
    isi_teks: 'Mufrodat (مُفْرَدَات) adalah kosakata dalam bahasa Arab.\n\nBenda:\n- كِتَابٌ = Buku\n- قَلَمٌ = Pena\n- مَدْرَسَةٌ = Sekolah\n- بَيْتٌ = Rumah\n\nKeluarga:\n- أَبٌ = Ayah\n- أُمٌّ = Ibu\n- أَخٌ = Saudara laki-laki\n- أُخْتٌ = Saudara perempuan\n\nKata kerja:\n- ذَهَبَ = Pergi\n- جَاءَ = Datang\n- أَكَلَ = Makan\n- قَرَأَ = Membaca',
    file_key: null, url_eksternal: null,
    created_at: '2026-08-31T07:00:00Z',
  },
  {
    id: 'mat-005', kelas_id: 'kelas-003', urutan: 1,
    judul: 'Pertemuan 1 — Jumlah Ismiyyah',
    tipe: 'teks',
    isi_teks: 'Jumlah Ismiyyah (جُمْلَةٌ اِسْمِيَّةٌ) adalah kalimat yang diawali isim (kata benda).\n\nStruktur: Mubtada\' + Khabar\n\nContoh:\n- هَذَا كِتَابٌ = Ini adalah buku\n- مُحَمَّدٌ طَالِبٌ = Muhammad adalah pelajar\n- الْبَيْتُ كَبِيرٌ = Rumah itu besar',
    file_key: null, url_eksternal: null,
    created_at: '2026-08-10T08:00:00Z',
  },
];

const TUGAS = [
  {
    id: 'tgs-001', kelas_id: 'kelas-001',
    judul: 'Kuis 1 — Huruf Hijaiyah',
    deskripsi: 'Kuis pilihan ganda tentang huruf Hijaiyah dan harakat dasar.',
    tipe: 'pilihan_ganda',
    batas_waktu: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2026-09-01T07:00:00Z',
  },
  {
    id: 'tgs-002', kelas_id: 'kelas-001',
    judul: 'Latihan Essay — Mufrodat Dasar',
    deskripsi: 'Jawab pertanyaan dengan kalimat lengkap menggunakan bahasa Arab.',
    tipe: 'essay',
    batas_waktu: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2026-09-08T07:00:00Z',
  },
  {
    id: 'tgs-003', kelas_id: 'kelas-003',
    judul: 'UTS — Jumlah Ismiyyah',
    deskripsi: 'Ujian Tengah Semester materi Jumlah Ismiyyah.',
    tipe: 'pilihan_ganda',
    batas_waktu: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2026-09-15T07:00:00Z',
  },
];

const SOAL = [
  { id: 'soal-001', tugas_id: 'tgs-001', urutan: 1, kunci: 'b',
    pertanyaan: 'Huruf Hijaiyah dalam bahasa Arab berjumlah berapa?',
    pilihan: { a: '26 huruf', b: '28 huruf', c: '30 huruf', d: '32 huruf' } },
  { id: 'soal-002', tugas_id: 'tgs-001', urutan: 2, kunci: 'c',
    pertanyaan: 'Harakat yang dibaca "a" adalah...',
    pilihan: { a: 'Kasrah', b: 'Dhammah', c: 'Fathah', d: 'Sukun' } },
  { id: 'soal-003', tugas_id: 'tgs-001', urutan: 3, kunci: 'b',
    pertanyaan: 'Huruf Arab manakah yang berbunyi "mim"?',
    pilihan: { a: 'ن', b: 'م', c: 'و', d: 'ل' } },
  { id: 'soal-004', tugas_id: 'tgs-001', urutan: 4, kunci: 'c',
    pertanyaan: 'Sukun ( ْ ) pada sebuah huruf menandakan bahwa huruf tersebut...',
    pilihan: { a: 'Dibaca panjang', b: 'Dibaca double', c: 'Huruf mati (tidak berbunyi vokal)', d: 'Dibaca dengan bunyi n' } },
  { id: 'soal-005', tugas_id: 'tgs-001', urutan: 5, kunci: 'd',
    pertanyaan: 'Kata كِتَابٌ (Kitaabun) berarti...',
    pilihan: { a: 'Pena', b: 'Meja', c: 'Papan tulis', d: 'Buku' } },
  { id: 'soal-006', tugas_id: 'tgs-002', urutan: 1, kunci: null,
    pertanyaan: 'Sebutkan 5 mufrodat yang berhubungan dengan kegiatan belajar mengajar, lengkap dengan artinya!',
    pilihan: null },
  { id: 'soal-007', tugas_id: 'tgs-002', urutan: 2, kunci: null,
    pertanyaan: 'Buatlah 3 kalimat sederhana dalam bahasa Arab menggunakan mufrodat yang sudah dipelajari!',
    pilihan: null },
  { id: 'soal-008', tugas_id: 'tgs-003', urutan: 1, kunci: 'c',
    pertanyaan: 'Dalam Jumlah Ismiyyah, bagian kalimat yang berfungsi sebagai subjek disebut...',
    pilihan: { a: 'Khabar', b: 'Fi\'il', c: 'Mubtada\'', d: 'Fa\'il' } },
];

const JAWABAN = [
  { soal_id: 'soal-001', mahasiswa_id: 'mhs-001', isi_jawaban: 'b', nilai: 100 },
  { soal_id: 'soal-002', mahasiswa_id: 'mhs-001', isi_jawaban: 'c', nilai: 100 },
  { soal_id: 'soal-003', mahasiswa_id: 'mhs-001', isi_jawaban: 'b', nilai: 100 },
  { soal_id: 'soal-004', mahasiswa_id: 'mhs-001', isi_jawaban: 'c', nilai: 100 },
  { soal_id: 'soal-005', mahasiswa_id: 'mhs-001', isi_jawaban: 'd', nilai: 100 },
  { soal_id: 'soal-001', mahasiswa_id: 'mhs-002', isi_jawaban: 'b', nilai: 60 },
  { soal_id: 'soal-002', mahasiswa_id: 'mhs-002', isi_jawaban: 'a', nilai: 60 },
  { soal_id: 'soal-003', mahasiswa_id: 'mhs-002', isi_jawaban: 'b', nilai: 60 },
  { soal_id: 'soal-004', mahasiswa_id: 'mhs-002', isi_jawaban: 'c', nilai: 60 },
  { soal_id: 'soal-005', mahasiswa_id: 'mhs-002', isi_jawaban: 'd', nilai: 60 },
  { soal_id: 'soal-006', mahasiswa_id: 'mhs-001', isi_jawaban: 'كِتَابٌ = Buku, قَلَمٌ = Pena, مَدْرَسَةٌ = Sekolah, طَالِبٌ = Murid, أُسْتَاذٌ = Guru', nilai: 85 },
  { soal_id: 'soal-007', mahasiswa_id: 'mhs-001', isi_jawaban: '1. أَنَا طَالِبٌ = Saya adalah murid. 2. هَذَا كِتَابٌ = Ini adalah buku. 3. الْأُسْتَاذُ فِي الْمَدْرَسَةِ = Guru ada di sekolah.', nilai: 90 },
  { soal_id: 'soal-006', mahasiswa_id: 'mhs-002', isi_jawaban: 'كِتَابٌ = Buku, قَلَمٌ = Pena, مَدْرَسَةٌ = Sekolah, طَالِبٌ = Murid, أُسْتَاذٌ = Ustadz', nilai: null },
];

// ─────────────────────────────────────────────────────────────
// SESI DUMMY
// Ganti id sesuai peran yang ingin ditest:
//   dosen-001 / dosen-002 untuk tampilan dosen
//   mhs-001 s.d. mhs-006 untuk tampilan mahasiswa
// ─────────────────────────────────────────────────────────────
let ACTIVE_USER_ID = localStorage.getItem('alima_demo_user') || null;

export const DEMO_PASSWORD = 'alima123';
export const DEMO_ACCOUNTS = PROFILES.map(profile => ({ ...profile, password: DEMO_PASSWORD }));

export function demoLogin(email, password) {
  const profile = PROFILES.find(item => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!profile || password !== DEMO_PASSWORD) return { data: null, error: { message: 'Email atau password demo tidak sesuai.' } };
  ACTIVE_USER_ID = profile.id;
  localStorage.setItem('alima_demo_user', profile.id);
  return { data: profile, error: null };
}

export function demoLogout() {
  ACTIVE_USER_ID = null;
  localStorage.removeItem('alima_demo_user');
}

export function getDemoProfile() {
  return PROFILES.find(profile => profile.id === ACTIVE_USER_ID) || null;
}

// ─────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────
function delay(ms = 0) {
  // Set ms > 0 untuk simulasi latensi (cth: 300 untuk 300ms)
  return new Promise(r => setTimeout(r, ms));
}

function ok(data) { return { data, error: null }; }
function err(msg) { return { data: null, error: { message: msg } }; }

// ─────────────────────────────────────────────────────────────
// DB DUMMY — meniru interface Supabase
// ─────────────────────────────────────────────────────────────
export const dummyDb = {

  // ── AUTH ──────────────────────────────────────────────────
  auth: {
    async getSession() {
      await delay();
      const user = PROFILES.find(p => p.id === ACTIVE_USER_ID);
      if (!user) return ok({ session: null });
      return ok({ session: { user: { id: user.id, email: user.email } } });
    },
    async getProfile() {
      return getDemoProfile();
    },
    async signOut() {
      await delay();
      return ok(null);
    },
  },

  // ── PROFILES ──────────────────────────────────────────────
  profiles: {
    getById(id) {
      return PROFILES.find(p => p.id === id) || null;
    },
    getAll() {
      return [...PROFILES];
    },
  },

  // ── KELAS ─────────────────────────────────────────────────
  kelas: {
    // Semua kelas milik dosen tertentu
    byDosen(dosenId) {
      return ok(KELAS.filter(k => k.pengajar_id === dosenId));
    },
    // Semua kelas yang diikuti mahasiswa
    byMahasiswa(mhsId) {
      const kelasIds = ANGGOTA_KELAS
        .filter(a => a.mahasiswa_id === mhsId)
        .map(a => a.kelas_id);
      return ok(KELAS.filter(k => kelasIds.includes(k.id)));
    },
    getById(id) {
      const k = KELAS.find(k => k.id === id);
      return k ? ok(k) : err('Kelas tidak ditemukan');
    },
    byKode(kode) {
      const k = KELAS.find(k => k.kode === kode.toUpperCase());
      return k ? ok([{ id: k.id, nama: k.nama }]) : ok([]);
    },
    insert(data) {
      const baru = { ...data, id: 'kelas-' + Date.now(), created_at: new Date().toISOString() };
      KELAS.push(baru);
      return ok(baru);
    },
    delete(id) {
      const idx = KELAS.findIndex(k => k.id === id);
      if (idx !== -1) KELAS.splice(idx, 1);
      return ok(null);
    },
  },

  // ── ANGGOTA KELAS ─────────────────────────────────────────
  anggotaKelas: {
    byKelas(kelasId) {
      return ok(ANGGOTA_KELAS.filter(a => a.kelas_id === kelasId));
    },
    insert(kelasId, mahasiswaId) {
      const sudahAda = ANGGOTA_KELAS.find(
        a => a.kelas_id === kelasId && a.mahasiswa_id === mahasiswaId
      );
      if (sudahAda) return err('Sudah terdaftar di kelas ini.');
      const profil = PROFILES.find(p => p.id === mahasiswaId);
      const baru = {
        kelas_id: kelasId, mahasiswa_id: mahasiswaId,
        joined_at: new Date().toISOString(),
        profiles: { nama: profil?.nama || '?', email: profil?.email || '?' }
      };
      ANGGOTA_KELAS.push(baru);
      return ok(baru);
    },
    delete(kelasId, mahasiswaId) {
      const idx = ANGGOTA_KELAS.findIndex(
        a => a.kelas_id === kelasId && a.mahasiswa_id === mahasiswaId
      );
      if (idx !== -1) ANGGOTA_KELAS.splice(idx, 1);
      return ok(null);
    },
  },

  // ── KELOMPOK ──────────────────────────────────────────────
  kelompok: {
    byKelas(kelasId) {
      return ok(KELOMPOK.filter(k => k.kelas_id === kelasId));
    },
  },

  // ── MATERI ────────────────────────────────────────────────
  materi: {
    byKelas(kelasId) {
      return ok(
        MATERI
          .filter(m => m.kelas_id === kelasId)
          .sort((a, b) => a.urutan - b.urutan)
      );
    },
    insert(data) {
      const baru = { ...data, id: 'mat-' + Date.now(), created_at: new Date().toISOString() };
      MATERI.push(baru);
      return ok(baru);
    },
    delete(id) {
      const idx = MATERI.findIndex(m => m.id === id);
      if (idx !== -1) MATERI.splice(idx, 1);
      return ok(null);
    },
    // Simulasi signed URL untuk file
    getSignedUrl(fileKey) {
      return ok({ signedUrl: '#dummy-file-url-' + fileKey });
    },
  },

  // ── TUGAS ─────────────────────────────────────────────────
  tugas: {
    byKelas(kelasId) {
      return ok(TUGAS.filter(t => t.kelas_id === kelasId));
    },
    getById(id) {
      const t = TUGAS.find(t => t.id === id);
      return t ? ok(t) : err('Tugas tidak ditemukan');
    },
    insert(data) {
      const baru = { ...data, id: 'tgs-' + Date.now(), created_at: new Date().toISOString() };
      TUGAS.push(baru);
      return ok(baru);
    },
    delete(id) {
      const idx = TUGAS.findIndex(t => t.id === id);
      if (idx !== -1) TUGAS.splice(idx, 1);
      return ok(null);
    },
  },

  // ── SOAL ──────────────────────────────────────────────────
  soal: {
    byTugas(tugasId, includKunci = false) {
      const list = SOAL
        .filter(s => s.tugas_id === tugasId)
        .sort((a, b) => a.urutan - b.urutan)
        .map(s => {
          // Mahasiswa tidak boleh melihat kunci
          if (!includKunci) {
            const { kunci, ...tanpaKunci } = s;
            return tanpaKunci;
          }
          return s;
        });
      return ok(list);
    },
    insert(data) {
      const baru = { ...data, id: 'soal-' + Date.now(), created_at: new Date().toISOString() };
      SOAL.push(baru);
      return ok(baru);
    },
    delete(id) {
      const idx = SOAL.findIndex(s => s.id === id);
      if (idx !== -1) SOAL.splice(idx, 1);
      return ok(null);
    },
  },

  // ── JAWABAN ───────────────────────────────────────────────
  jawaban: {
    byMahasiswaAndTugas(mahasiswaId, tugasId) {
      const soalIds = SOAL.filter(s => s.tugas_id === tugasId).map(s => s.id);
      return ok(JAWABAN.filter(j =>
        j.mahasiswa_id === mahasiswaId && soalIds.includes(j.soal_id)
      ));
    },
    byTugas(tugasId) {
      const soalIds = SOAL.filter(s => s.tugas_id === tugasId).map(s => s.id);
      return ok(JAWABAN.filter(j => soalIds.includes(j.soal_id)));
    },
    sudahDikerjakan(mahasiswaId, tugasId) {
      const soalIds = SOAL.filter(s => s.tugas_id === tugasId).map(s => s.id);
      const jawabanAda = JAWABAN.filter(j =>
        j.mahasiswa_id === mahasiswaId && soalIds.includes(j.soal_id)
      );
      return jawabanAda.length > 0;
    },
    insert(soalId, mahasiswaId, isiJawaban) {
      const sudah = JAWABAN.find(j => j.soal_id === soalId && j.mahasiswa_id === mahasiswaId);
      if (sudah) return err('Jawaban sudah ada.');
      const baru = { soal_id: soalId, mahasiswa_id: mahasiswaId, isi_jawaban: isiJawaban, nilai: null, submitted_at: new Date().toISOString() };
      JAWABAN.push(baru);
      return ok(baru);
    },
    updateNilai(soalId, mahasiswaId, nilai) {
      const j = JAWABAN.find(j => j.soal_id === soalId && j.mahasiswa_id === mahasiswaId);
      if (j) j.nilai = nilai;
      return ok(j);
    },
    // Hitung nilai PG otomatis (meniru RPC hitung_nilai_pg)
    hitungNilaiPG(tugasId, mahasiswaId) {
      const soalPG = SOAL.filter(s => s.tugas_id === tugasId);
      if (soalPG.length === 0) return 0;
      let benar = 0;
      soalPG.forEach(s => {
        const jawaban = JAWABAN.find(j => j.soal_id === s.id && j.mahasiswa_id === mahasiswaId);
        if (jawaban && jawaban.isi_jawaban === s.kunci) benar++;
      });
      const nilai = Math.round((benar / soalPG.length) * 100);
      // Update nilai di data
      soalPG.forEach(s => {
        const j = JAWABAN.find(j => j.soal_id === s.id && j.mahasiswa_id === mahasiswaId);
        if (j) j.nilai = nilai;
      });
      return nilai;
    },
  },

  // ── REKAP NILAI (untuk halaman nilai dosen) ───────────────
  rekapNilai: {
    byKelasAndTugas(kelasId, tugasId) {
      const anggota = ANGGOTA_KELAS.filter(a => a.kelas_id === kelasId);
      const soalList = SOAL.filter(s => s.tugas_id === tugasId);
      return ok(anggota.map(a => {
        const profil = PROFILES.find(p => p.id === a.mahasiswa_id);
        const jawabanMhs = JAWABAN.filter(j =>
          j.mahasiswa_id === a.mahasiswa_id &&
          soalList.some(s => s.id === j.soal_id)
        );
        const nilaiAkhir = jawabanMhs.length > 0 ? jawabanMhs[0].nilai : null;
        return {
          mahasiswa_id: a.mahasiswa_id,
          nama: profil?.nama || '?',
          email: profil?.email || '?',
          sudah_mengerjakan: jawabanMhs.length > 0,
          nilai: nilaiAkhir,
        };
      }));
    },
  },
};

// ─────────────────────────────────────────────────────────────
// CARA INTEGRASI KE auth.js
// ─────────────────────────────────────────────────────────────
/*
import { supabase } from './supabase.js';
import { USE_DUMMY, dummyDb } from './dummy-data.js';

export async function getSession() {
  if (USE_DUMMY) {
    const { data } = await dummyDb.auth.getSession();
    return data.session;
  }
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfile() {
  if (USE_DUMMY) return dummyDb.auth.getProfile();
  // ... kode Supabase biasa
}
*/

// ─────────────────────────────────────────────────────────────
// CARA INTEGRASI KE kelas.js (contoh)
// ─────────────────────────────────────────────────────────────
/*
import { USE_DUMMY, dummyDb } from '../dummy-data.js';

// Ganti setiap query Supabase dengan:
async function ambilKelas(dosenId) {
  if (USE_DUMMY) return dummyDb.kelas.byDosen(dosenId);
  return await supabase.from('kelas').select('*').eq('pengajar_id', dosenId);
}
*/
