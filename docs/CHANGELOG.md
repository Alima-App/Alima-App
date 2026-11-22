# Changelog — Alima App

Format: tanggal — perubahan — status verifikasi.

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
