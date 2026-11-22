# Roadmap — Alima App

## Status keseluruhan

Tahap wajib: 0–7. Berdasarkan dokumen sumber, tahap 0–4 selesai dan tahap 5–7 belum. Dengan demikian 5 dari 8 tahap wajib tercatat selesai (62,5%). Tahap 8 bersifat opsional dan tidak masuk hitungan tersebut.

## Tahap 5 — Tugas & Soal (prioritas berikutnya)

### Dosen
- Form judul, deskripsi, tipe tugas, dan batas waktu.
- Membuat soal pilihan ganda dengan empat opsi (a/b/c/d) dan kunci.
- Membuat soal esai tanpa pilihan dan kunci.

### Mahasiswa
- Melihat tugas aktif dan status pengerjaan.
- Mengerjakan pilihan ganda.
- Mengirim jawaban esai.
- Tidak dapat mengirim ganda atau melewati deadline.

### Sistem
- Setelah submit, panggil RPC `hitung_nilai_pg(tugas_id, mahasiswa_id)`.
- Jangan menghitung nilai PG di browser.
- Jangan pernah mengirim kunci jawaban kepada mahasiswa.

### Integrasi
Tambahkan halaman `js/pages/tugas.js` dan route `#/tugas` pada `router.js`. Pastikan pola impor sesuai kode aktual.

## Tahap 6 — Nilai & Ekspor

1. Rekap nilai per kelas dan per mahasiswa untuk dosen.
2. Dosen memberi nilai esai 0–100.
3. Mahasiswa hanya melihat nilai sendiri.
4. Ekspor CSV melalui Blob dan URL object.
5. Uji hak akses ekspor agar dosen tidak dapat mengekspor kelas yang bukan miliknya.

## Tahap 7 — Uji & Rapikan

1. Uji akun dosen dan mahasiswa di perangkat berbeda.
2. Uji isolasi data RLS antarkelas dan antardosen.
3. Periksa Network response untuk memastikan kunci tidak bocor.
4. Rapikan pesan error.
5. Pastikan tampilan responsif di ponsel.
6. Uji deadline pada sisi server/database.
7. Uji pengiriman ganda dan manipulasi request.
8. Lakukan backup sebelum rilis.

## Tahap 8 — Cloudflare R2 (opsional)

Dipertimbangkan jika kapasitas Supabase Storage tidak mencukupi:
1. Buat bucket privat R2.
2. Buat Supabase Edge Function untuk menghasilkan presigned URL.
3. Simpan kredensial R2 di Edge Function secrets.
4. Ubah alur upload/download pada `materi.js`.
5. Pertahankan `file_key` jika skema aktual mendukungnya.

## Definisi selesai (DoD)

Sebuah fitur baru dianggap selesai jika:
- alur dosen dan mahasiswa sesuai kebutuhan;
- aturan akses ditegakkan server-side/RLS;
- error, loading, dan empty state ditangani;
- diuji pada akun dengan peran berbeda;
- tidak membocorkan data atau rahasia;
- dokumentasi, skema, feature matrix, dan changelog diperbarui.
