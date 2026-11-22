# Project Specification — Alima App

## 1. Identitas produk

- Nama: **Alima App**
- Makna nama: dari عَلِمَ, “mengetahui/memahami”.
- Jenis: Learning Management System (LMS) berbasis web.
- Fokus: kegiatan perkuliahan bahasa Arab.
- Pengguna: dosen dan mahasiswa.
- Target awal: 1 dosen dan sekitar 500 mahasiswa.
- Model pengelolaan: aplikasi diserahkan gratis kepada dosen; pengelolaan bulanan berbayar bersifat opsional.

## 2. Tujuan

Menyediakan ruang pembelajaran daring untuk mengelola kelas, anggota kelas, materi pembelajaran, tugas, soal, jawaban, dan nilai dalam satu aplikasi.

## 3. Peran pengguna

### Dosen
- Mendaftar, login, dan logout.
- Mengelola kelas.
- Melihat dan mengeluarkan anggota kelas.
- Mengunggah materi teks, tautan, PDF, dan MP3.
- Tahap berikutnya: membuat tugas/soal, memeriksa jawaban esai, melihat rekap nilai, dan mengekspor CSV.

### Mahasiswa
- Mendaftar, login, dan logout.
- Bergabung ke kelas menggunakan kode.
- Melihat kelas yang diikuti.
- Melihat materi dan mengunduh file melalui signed URL.
- Tahap berikutnya: mengerjakan tugas, mengirim jawaban, dan melihat nilai sendiri.

## 4. Ruang lingkup

### Sudah tercatat berjalan
- Autentikasi email/password dan pemisahan peran.
- Profil otomatis melalui trigger.
- Pembuatan kelas dan kode kelas.
- Bergabung kelas dengan kode.
- Pengelolaan anggota kelas.
- Materi teks, link, PDF, dan MP3.
- Unduh file melalui signed URL.
- Loading skeleton, splash screen, cache session.
- Index database dan workflow ping berkala.

### Belum dikerjakan
- Fitur tugas dan soal end-to-end.
- Penilaian dan rekap nilai.
- Ekspor CSV.
- Pengujian menyeluruh dan penyempurnaan.

### Di luar kebutuhan wajib saat ini
- Migrasi file ke Cloudflare R2. Hanya dipertimbangkan jika kapasitas Supabase Storage tidak mencukupi.

## 5. Kebutuhan fungsional

| ID | Kebutuhan | Peran | Status |
|---|---|---|---|
| FR-01 | Login/registrasi/logout | Semua | Tercatat selesai |
| FR-02 | Profil dan peran pengguna | Sistem | Tercatat selesai |
| FR-03 | Membuat dan menghapus kelas | Dosen | Tercatat selesai |
| FR-04 | Bergabung dengan kode kelas | Mahasiswa | Tercatat selesai |
| FR-05 | Melihat/mengelola anggota | Dosen | Tercatat selesai |
| FR-06 | Upload dan hapus materi | Dosen | Tercatat selesai |
| FR-07 | Melihat/mengunduh materi | Mahasiswa | Tercatat selesai |
| FR-08 | Membuat tugas dan soal | Dosen | Belum |
| FR-09 | Mengerjakan dan mengirim tugas | Mahasiswa | Belum |
| FR-10 | Penilaian otomatis pilihan ganda | Sistem | Belum terintegrasi pada fitur tugas |
| FR-11 | Penilaian esai | Dosen | Belum |
| FR-12 | Rekap dan ekspor nilai | Dosen | Belum |
| FR-13 | Melihat nilai pribadi | Mahasiswa | Belum |

## 6. Kebutuhan nonfungsional

- Antarmuka responsif, terutama untuk perangkat mobile.
- Semua akses data harus mengikuti RLS.
- Kunci jawaban tidak boleh dikirim ke browser mahasiswa.
- File materi disimpan pada bucket privat.
- Error ditangani dan disampaikan secara layak kepada pengguna.
- Navigasi menggunakan hash routing agar kompatibel dengan GitHub Pages.
- Kode tetap menggunakan JavaScript ES Modules tanpa framework/build tool, kecuali keputusan arsitektur diubah secara resmi.

## 7. Kriteria penerimaan utama

1. Dosen hanya dapat mengelola data yang menjadi kewenangannya.
2. Mahasiswa hanya dapat melihat kelas, materi, tugas, jawaban, dan nilai yang menjadi haknya.
3. Mahasiswa tidak dapat membaca kunci jawaban pilihan ganda.
4. Jawaban tidak dapat dikirim ganda jika aturan satu kali pengiriman diterapkan.
5. Batas waktu tugas ditegakkan oleh mekanisme yang tidak hanya bergantung pada validasi antarmuka.
6. Tampilan dapat digunakan pada ponsel.
7. Ekspor nilai menghasilkan data sesuai kelas dan kewenangan dosen.
