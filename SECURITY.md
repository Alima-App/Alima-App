# Security — Alima App

## 1. Model keamanan

Frontend bersifat publik karena dihosting pada GitHub Pages. Karena itu, keamanan tidak boleh bergantung pada penyembunyian kode frontend. Otorisasi harus ditegakkan di Supabase, terutama melalui Row Level Security (RLS), hak akses fungsi, dan kebijakan Storage.

## 2. Pengelolaan key

- Supabase publishable/anon key dapat digunakan di frontend dengan RLS yang benar.
- Supabase secret/service-role key tidak boleh ada di browser, repository, file dokumentasi publik, issue, atau log.
- Jika secret pernah terpapar, rotasi segera melalui dashboard Supabase dan audit penggunaannya.
- Jangan menyalin nilai key ke dokumentasi master.

## 3. RLS

RLS wajib membatasi:
- Dosen pada kelas dan data yang menjadi kewenangannya.
- Mahasiswa pada kelas tempat ia terdaftar.
- Mahasiswa pada jawaban dan nilai miliknya sendiri.
- Hak tulis sesuai peran dan relasi ke kelas.

Dokumentasi sumber menyatakan RLS aktif, tetapi definisi policy lengkap belum disertakan dalam sumber ini. Karena itu, setiap policy harus diverifikasi langsung di Supabase.

## 4. Kunci jawaban dan penilaian

- Jangan mengirim `soal.kunci` kepada browser mahasiswa.
- Jangan menghitung nilai PG hanya di JavaScript frontend.
- Gunakan RPC server `hitung_nilai_pg`.
- Batasi hak execute RPC dan validasi bahwa pemanggil berhak mengakses tugas/jawaban terkait.
- Uji response API/Network agar kunci tidak bocor.

## 5. Storage

- Bucket `materi-files` harus privat.
- Akses file melalui signed URL berumur pendek (tercatat 300 detik).
- Policy upload, baca, dan hapus harus membatasi akses berdasarkan peran dan relasi kelas.
- Jangan menganggap signed URL dapat dicabut secara individual setelah dibagikan; perlakukan sebagai kredensial sementara.

## 6. Validasi input dan aturan bisnis

Validasi pada frontend berguna untuk pengalaman pengguna, tetapi aturan keamanan harus ditegakkan di database/server. Ini berlaku untuk:
- peran pengguna,
- keanggotaan kelas,
- pengiriman jawaban,
- batas waktu,
- nilai,
- kepemilikan kelas,
- penghapusan data.

## 7. Daftar uji keamanan sebelum rilis

- [ ] Akun mahasiswa A tidak dapat membaca kelas mahasiswa B yang tidak diikutinya.
- [ ] Dosen A tidak dapat mengubah kelas milik dosen B.
- [ ] Mahasiswa tidak dapat membaca `soal.kunci`.
- [ ] Mahasiswa tidak dapat mengubah nilai sendiri.
- [ ] Pengguna tidak dapat mengirim jawaban atas nama pengguna lain.
- [ ] Pengiriman ganda ditolak di database.
- [ ] Jawaban setelah deadline ditolak oleh mekanisme server/database.
- [ ] File privat tidak dapat diakses tanpa otorisasi.
- [ ] Storage policy tidak memberi akses publik yang tidak disengaja.
- [ ] Tidak ada secret/service-role key di repository atau bundle browser.
- [ ] RPC tidak dapat dipanggil untuk memanipulasi nilai pengguna lain.

## 8. Backup dan pemulihan

Paket Supabase gratis yang tercatat tidak menyediakan backup otomatis. Lakukan ekspor manual berkala, simpan secara aman, dan dokumentasikan prosedur restore. Jangan menyimpan dump database berisi data pribadi di repository publik.
