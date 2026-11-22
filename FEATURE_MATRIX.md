# Feature Matrix — Alima App

Status mengikuti dokumen pengembangan tanggal 22 November 2026 dan belum merupakan audit kode.

| Area | Fitur | Dosen | Mahasiswa | Status |
|---|---|---:|---:|---|
| Auth | Registrasi/login/logout | Ya | Ya | Tercatat selesai |
| Profil | Pembuatan profil otomatis | — | — | Tercatat selesai |
| Dashboard | Dashboard sesuai peran | Ya | Ya | Tercatat ada |
| Kelas | Membuat/menghapus kelas | Ya | — | Tercatat selesai |
| Kelas | Bergabung dengan kode | — | Ya | Tercatat selesai |
| Kelas | Melihat/mengeluarkan anggota | Ya | — | Tercatat selesai |
| Materi | Upload teks/link/PDF/MP3 | Ya | — | Tercatat selesai |
| Materi | Melihat dan mengunduh materi | — | Ya | Tercatat selesai |
| Tugas | Membuat tugas dan deadline | Ya | — | Belum |
| Soal | Membuat soal PG dan esai | Ya | — | Belum |
| Tugas | Mengerjakan dan mengirim | — | Ya | Belum |
| Nilai | Hitung otomatis PG via RPC | — | — | RPC tercatat tersedia; integrasi fitur belum |
| Nilai | Koreksi esai | Ya | — | Belum |
| Nilai | Rekap nilai kelas | Ya | — | Belum |
| Nilai | Melihat nilai sendiri | — | Ya | Belum |
| Ekspor | Ekspor CSV | Ya | — | Belum |
| QA | Uji RLS lintas akun | — | — | Belum |
| QA | Responsif dan penanganan error | — | — | Belum selesai menyeluruh |
| Storage | Migrasi Cloudflare R2 | — | — | Opsional |

## Definisi status

- **Tercatat selesai**: dinyatakan berjalan dalam dokumen sumber.
- **Belum**: belum dikerjakan menurut dokumen sumber.
- **Opsional**: tidak termasuk tahap wajib saat ini.
- **Perlu verifikasi**: perlu pemeriksaan langsung sebelum klaim rilis.
