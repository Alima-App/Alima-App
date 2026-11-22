# Handover — Alima App

## Informasi proyek

- Repository: https://github.com/alima-app/Alima-App
- Live: https://alima-app.github.io/Alima-App/
- Supabase region yang tercatat: Southeast Asia — Singapore
- Akun repository dan Supabase berada di bawah akun email dosen; developer tercatat sebagai collaborator GitHub.

## Langkah memulai pekerjaan

1. Pastikan akses collaborator GitHub tersedia.
2. Clone repository dan checkout branch `main`.
3. Periksa status commit dan file kerja.
4. Buka `js/supabase.js`; pastikan URL dan publishable key valid tanpa menyalin key ke chat/dokumen.
5. Periksa konfigurasi Supabase Auth, tabel, RLS, RPC, dan Storage melalui dashboard.
6. Cocokkan hasil dengan dokumen master.
7. Buat backup sebelum perubahan database.
8. Kerjakan tahap 5 terlebih dahulu.

## File dan alat pendukung yang tercatat

- `alima-dummy-data.sql`: data dummy lokal.
- `js/dummy-data.js`: data dummy untuk pengembangan.
- `.github/workflows/ping.yml`: ping Supabase tiap enam jam.
- `debug-panel.html`: diagnosis koneksi dan tabel.
- `perf-panel.html`: pengukuran performa.

Pastikan file pendukung tidak berisi rahasia dan jangan mengunggah data dummy yang menyerupai data pribadi nyata.

## Batasan paket gratis yang tercatat dalam sumber

- Database 500 MB.
- Storage 1 GB.
- Egress 5 GB/bulan.
- Tidak ada backup otomatis pada paket gratis.
- Proyek dapat dijeda setelah periode tidak aktif; ping berkala tidak boleh dianggap sebagai jaminan pencegahan pause.

Kuota dan kebijakan layanan dapat berubah; verifikasi di dashboard/dokumentasi resmi sebelum mengambil keputusan kapasitas.

## Informasi yang jangan dikirim dalam handover publik

- Supabase secret/service-role key.
- Token akses, password, recovery code.
- Dump database berisi data pribadi.
- Signed URL aktif yang memberi akses file.
