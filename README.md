# Alima App

**Learning Management System (LMS) berbasis web untuk perkuliahan bahasa Arab.**

Alima App dibangun menggunakan HTML, CSS, dan JavaScript ES Modules tanpa framework maupun build tool. Aplikasi dihosting melalui GitHub Pages dan menggunakan Supabase untuk autentikasi, PostgreSQL, Row Level Security (RLS), serta penyimpanan file privat.

- Repository: https://github.com/alima-app/Alima-App
- Aplikasi: https://alima-app.github.io/Alima-App/
- Dokumentasi master: folder `docs/`

## Status singkat

Tahap 0–4 tercatat selesai: persiapan, autentikasi/peran, tabel dan RLS, kelas/kelompok, serta materi. Tahap 5–7 belum selesai. Tahap 8 (Cloudflare R2) bersifat opsional.

Persentase penyelesaian tahap wajib 0–7: **5 dari 8 tahap (62,5%)**, berdasarkan dokumentasi pengembangan yang menjadi sumber paket ini. Angka ini bukan hasil audit repository secara langsung.

## Mulai membaca

1. [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) — ruang lingkup dan kebutuhan produk.
2. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arsitektur dan alur aplikasi.
3. [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) — struktur data yang tercatat.
4. [`docs/SECURITY.md`](docs/SECURITY.md) — prinsip keamanan wajib.
5. [`docs/FEATURE_MATRIX.md`](docs/FEATURE_MATRIX.md) — status fitur.
6. [`docs/ROADMAP.md`](docs/ROADMAP.md) — tahapan berikutnya.
7. [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md) — konteks wajib untuk AI/developer berikutnya.

## Aturan perubahan

- Jangan mengubah stack atau keputusan arsitektur tanpa alasan dan catatan ADR.
- Jangan menganggap fitur berstatus selesai hanya karena tercantum dalam rencana.
- Perubahan skema database harus disertai pembaruan `DATABASE_SCHEMA.md`.
- Perubahan kebijakan akses harus disertai pembaruan `SECURITY.md`.
- Jangan pernah memasukkan Supabase secret/service-role key ke frontend atau repository.
- Uji RLS menggunakan akun dan peran yang berbeda sebelum rilis.

## Sumber dan batas verifikasi

Paket ini disusun berdasarkan dokumen `Alima App — Dokumentasi Pengembangan.md` bertanggal 22 November 2026 yang diberikan pengguna. Repository, project Supabase, kebijakan RLS aktual, dan isi file kode belum diperiksa langsung dalam proses penyusunan paket ini. Detail yang belum tersedia ditandai sebagai **perlu diverifikasi**.
