# AI / Developer Context — Alima App

> Baca dokumen ini sebelum mengubah kode. Dokumen ini menetapkan konteks proyek dan batas asumsi.

## Identitas dan tujuan

Alima App adalah LMS web untuk perkuliahan bahasa Arab. Aplikasi memiliki dua peran: dosen dan mahasiswa. Jangan mencampur proyek ini dengan proyek aplikasi lain.

## Stack yang harus dipertahankan

- HTML, CSS, JavaScript ES Modules.
- Tanpa framework dan tanpa build tool.
- GitHub Pages untuk hosting frontend.
- Supabase PostgreSQL, Auth email/password, RLS, dan Storage.
- supabase-js versi 2.49.4 melalui CDN jsDelivr.
- Hash routing (`#/...`).

Jangan migrasikan stack secara sepihak.

## Arsitektur singkat

Browser memuat aset statis dari GitHub Pages, lalu berkomunikasi langsung dengan Supabase menggunakan publishable key. Otorisasi data dilakukan di database melalui RLS. File disimpan pada bucket privat `materi-files` dan diakses menggunakan signed URL yang tercatat berlaku 300 detik.

## Struktur kode yang tercatat

```text
alima-app/
├── index.html
├── css/style.css
└── js/
    ├── supabase.js
    ├── auth.js
    ├── router.js
    ├── dummy-data.js
    └── pages/
        ├── login.js
        ├── dashboard-dosen.js
        ├── dashboard-mahasiswa.js
        ├── kelas.js
        └── materi.js
```

Setiap halaman dirender ke `#app`. Router memakai hash dan event `hashchange`. File JavaScript adalah ES Module.

## Aturan keamanan yang tidak boleh dilanggar

1. Jangan pernah menaruh secret/service-role key di frontend, GitHub Pages, atau repository.
2. Publishable key boleh berada di frontend hanya dengan RLS yang benar dan sudah diuji.
3. Jangan mengirim kolom `soal.kunci` kepada mahasiswa.
4. Penilaian pilihan ganda harus dilakukan melalui RPC server `hitung_nilai_pg`, bukan perhitungan di browser.
5. Bucket `materi-files` harus tetap privat.
6. Jangan memperluas akses Storage atau tabel hanya untuk mengatasi error tanpa memahami kebijakan RLS.
7. Jangan mengandalkan validasi JavaScript client-side untuk aturan keamanan, batas waktu, atau pencegahan manipulasi nilai.

## Konvensi pengembangan

- Gunakan pola ES Module yang sudah ada.
- Tambahkan import dan route pada `router.js` setiap kali halaman baru dibuat.
- Render halaman ke elemen `#app`.
- Tangkap error Supabase dan tampilkan pesan melalui pola `.error-msg` yang ada.
- Gunakan query yang kompatibel dengan RLS.
- Pertahankan kelas CSS dan variabel desain yang sudah ada jika tidak ada alasan kuat untuk mengubahnya.

## Status pengerjaan

- Tahap 0–4: tercatat selesai.
- Tahap 5: tugas dan soal — belum.
- Tahap 6: nilai dan ekspor — belum.
- Tahap 7: pengujian dan perapian — belum.
- Tahap 8: Cloudflare R2 — opsional.

## Prosedur sebelum mengedit

1. Clone/pull repository terbaru.
2. Periksa `js/supabase.js` tanpa menyalin atau membocorkan key.
3. Periksa `router.js`, `auth.js`, dan halaman terkait.
4. Cocokkan skema aktual dengan `DATABASE_SCHEMA.md`.
5. Periksa RLS di Supabase SQL Editor.
6. Buat perubahan kecil dan terisolasi.
7. Uji dengan akun dosen dan mahasiswa.
8. Perbarui dokumentasi dan catatan perubahan.

## Larangan asumsi

- Jangan menganggap seluruh skema atau policy yang dijelaskan dokumen telah diverifikasi ulang.
- Jangan menganggap workflow ping menjamin proyek Supabase gratis tidak akan pernah dijeda.
- Jangan menganggap `Math.random()` cukup untuk kode kelas yang memerlukan jaminan anti-kolisi atau keamanan tinggi.
- Jangan mengubah fungsi RPC, trigger, atau policy berdasarkan tebakan.
- Jika kode aktual berbeda dari dokumen, laporkan perbedaannya dan minta keputusan sebelum melakukan perubahan arsitektur.

## Keputusan deployment terbaru

Demo dan produksi adalah deployment terpisah, menggunakan dua repository target Pages dan GitHub Environments terpisah. Mode dibangkitkan saat CI/CD, bukan dipilih pengguna. Demo = dummy provider offline; produksi = Supabase Auth/database. Baca `docs/DEPLOYMENT_ENVIRONMENTS.md` sebelum mengubah alur autentikasi atau workflow. Jangan menambahkan fallback produksi ke dummy data.
