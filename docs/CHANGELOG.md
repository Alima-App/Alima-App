# Changelog — Alima App

Format: tanggal — perubahan — status verifikasi.

## 2026-11-26 — Audit bug dan perbaikan

Rincian lengkap: `docs/BUG_AUDIT_2026-11-26.md`.

- Security: XSS tersimpan ditutup dengan `escapeHtml` di `kelas.js`, `materi.js`, `dashboard-production.js`, dan `router.js` (utilitas bersama di `js/utils.js`).
- Security: URL tautan materi hanya menerima `http:`/`https:` dan memakai `rel="noopener noreferrer"`.
- Security: pendaftaran tidak lagi menawarkan peran "Dosen" dan tidak mengirim `peran` dari klien.
- Security: cache profil kedaluwarsa 10 menit dan dicocokkan dengan `user.id`.
- Security: `ping.yml` memakai `permissions: contents: read` dan secret lewat `env`.
- Fixed: daftar kelas tidak refresh setelah buat/gabung/hapus kelas.
- Fixed: kode kelas dibuat dengan `crypto.getRandomValues`, selalu 6 karakter, dengan percobaan ulang saat bentrok.
- Fixed: router mengantrikan navigasi yang bentrok, bukan membuangnya.
- Fixed: tanggal "Bergabung" memakai `joined_at`.
- Fixed: urutan hapus materi/kelas (database dulu untuk materi; file Storage dulu untuk kelas), error tidak lagi diabaikan.
- Fixed: unggahan memakai ekstensi dan `contentType` sesuai tipe materi; file yatim dibersihkan bila insert gagal.
- Fixed: PDF/MP3 dibuka tanpa diblokir popup blocker.
- Changed: placeholder produksi tidak lagi menyebut dataset demonstrasi; kode mati `editData` dihapus.
- Database: migrasi `20261126090000_harden_answers_grading_storage.sql` (kunci jawaban setelah batas waktu/dinilai, validasi nilai 0–100, pembandingan kunci tidak sensitif huruf/spasi, validasi anggota kelompok, pencabutan EXECUTE `insert_dummy_profile`, index unik `kelas.kode`, pengetatan bucket dan policy Storage).
- Verification: **belum**. Perubahan dibuat dari pembacaan kode; belum dijalankan di browser dan migrasi belum diterapkan. Gunakan checklist uji di `BUG_AUDIT_2026-11-26.md`.

## 2026-11-22

- Master documentation disusun dari `Alima App — Dokumentasi Pengembangan.md`.
- Dicatat bahwa tahap 0–4 selesai, tahap 5–7 belum, tahap 8 opsional.
- Ditambahkan dokumen spesifikasi, arsitektur, skema database, keamanan, matriks fitur, design system, roadmap, dan konteks AI/developer.
- Status isi mengikuti sumber; belum dilakukan audit langsung terhadap repository atau project Supabase.

## Template entri

```text
## YYYY-MM-DD
- Added: ...
- Changed: ...
- Fixed: ...
- Security: ...
- Database: ...
- Verification: belum / sudah (jelaskan cara uji)
```

## 2026-11-22 — Demo UI login dan dashboard
- Menambahkan mode demonstrasi offline berbasis `dummy-data.js`.
- Login demo mendukung pemilihan akun dosen/mahasiswa dan password demo bersama.
- Dashboard dosen dan mahasiswa menampilkan ringkasan dinamis dari dataset dummy.
- Router demo tidak mengimpor Supabase atau modul halaman yang masih bergantung pada Supabase.
- Halaman kelas/materi/tugas/nilai yang belum memiliki implementasi demo ditampilkan sebagai placeholder yang jelas.
- Catatan: autentikasi demo hanya untuk preview, bukan mekanisme keamanan produksi.

## 2026-11-22 — Isolasi deployment demo dan produksi

- Menambahkan konfigurasi deployment yang dihasilkan CI/CD.
- Memisahkan provider autentikasi demo dan Supabase.
- Menambahkan workflow demo (branch `main`) dan produksi (branch `release`) dengan repository Pages terpisah.
- Menambahkan dokumentasi operasional lingkungan.
- Produksi menggunakan dashboard tanpa data dummy; integrasi tugas/nilai masih dalam roadmap.
