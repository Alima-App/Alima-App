# Architecture — Alima App

## 1. Gambaran sistem

```text
Pengguna (Dosen / Mahasiswa)
          |
          v
Browser: HTML + CSS + JavaScript ES Modules
          |
          +---- GitHub Pages (file statis)
          |
          +---- supabase-js 2.49.4
                    |
                    +---- Supabase Auth
                    +---- PostgreSQL + RLS
                    +---- Supabase Storage (private)
```

Frontend dihosting statis. Browser berkomunikasi langsung dengan Supabase. Tidak ada server aplikasi khusus yang tercatat dalam arsitektur saat ini.

## 2. Komponen

| Komponen | Tanggung jawab |
|---|---|
| `index.html` | Entry point aplikasi |
| `css/style.css` | Gaya global dan komponen |
| `js/supabase.js` | Inisialisasi Supabase client |
| `js/auth.js` | Session, profil, logout, cache |
| `js/router.js` | Hash routing, loading state, render halaman |
| `js/pages/*` | Antarmuka dan interaksi per halaman |
| Supabase Auth | Identitas dan autentikasi |
| PostgreSQL | Data aplikasi |
| RLS | Pembatasan akses baris |
| Supabase Storage | File materi privat |
| GitHub Pages | Hosting frontend |
| GitHub Actions | Ping berkala sebagaimana tercatat |

## 3. Navigasi

Menggunakan hash routing, misalnya `#/kelas` dan `#/materi`. Router dipanggil saat aplikasi dimuat dan merespons event `hashchange`. Halaman baru harus diimpor dan didaftarkan pada router.

## 4. Alur autentikasi

1. Pengguna mendaftar atau login melalui Supabase Auth.
2. Trigger `on_auth_user_created` memanggil `handle_new_user()`.
3. Profil disimpan pada tabel `profiles`.
4. Aplikasi membaca profil dan peran (`dosen` atau `mahasiswa`).
5. Router/dashboard mengarahkan pengguna sesuai peran.

Detail implementasi aktual perlu diverifikasi terhadap source code dan konfigurasi Supabase.

## 5. Alur materi

1. Dosen mengunggah materi melalui browser ke bucket `materi-files`.
2. Metadata materi disimpan pada tabel `materi`.
3. Mahasiswa yang berhak meminta akses.
4. Aplikasi membuat signed URL untuk file.
5. Signed URL tercatat berlaku 300 detik.

## 6. Alur penilaian pilihan ganda yang direncanakan

1. Mahasiswa mengirim jawaban.
2. Jawaban disimpan di database.
3. Aplikasi memanggil RPC `hitung_nilai_pg(tugas_id, mahasiswa_id)`.
4. Fungsi server membandingkan jawaban dengan kunci.
5. Nilai diperbarui pada database.

Kunci jawaban tidak boleh dikirim ke browser mahasiswa. Rancangan RPC aktual harus diperiksa sebelum integrasi.

## 7. Cache dan performa

Dokumentasi sumber mencatat cache session di memori dan localStorage. Navigasi ant halaman dilaporkan sekitar 3 ms. Pengukuran login flow yang dilaporkan sekitar 711 ms. Angka tersebut adalah hasil pengukuran terdokumentasi, bukan jaminan performa.

## 8. Batas sistem

- GitHub Pages hanya menyajikan aset statis.
- Otorisasi data harus dilakukan oleh Supabase RLS.
- Signed URL adalah akses sementara; siapa pun yang memiliki URL selama masa berlaku dapat menggunakannya sesuai karakteristik URL bertanda tangan.
- Workflow ping tidak boleh dianggap sebagai jaminan SLA atau jaminan bahwa proyek gratis tidak akan dijeda.

## Pemisahan deployment demo/produksi

Konfigurasi dipilih pada waktu deployment melalui `js/deployment-config.js`. Provider autentikasi dimuat secara dinamis: demo hanya memuat provider lokal, sedangkan produksi memuat provider Supabase. Kedua lingkungan diterbitkan ke repository GitHub Pages yang berbeda. Detail operasional: [`DEPLOYMENT_ENVIRONMENTS.md`](DEPLOYMENT_ENVIRONMENTS.md).
