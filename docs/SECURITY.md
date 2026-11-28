# Security — Alima App

## 1. Model keamanan

Frontend bersifat publik karena dihosting pada GitHub Pages. Karena itu, keamanan tidak boleh bergantung pada penyembunyian kode frontend. Otorisasi harus ditegakkan di Supabase, terutama melalui Row Level Security (RLS), hak akses fungsi, dan kebijakan Storage.

## 2. Pengelolaan key

- Supabase publishable/anon key dapat digunakan di frontend dengan RLS yang benar.
- Supabase secret/service-role key tidak boleh ada di browser, repository, file dokumentasi publik, issue, atau log.
- Secret `SUPABASE_KEY` pada workflow `ping.yml` harus berisi publishable/anon key, bukan service-role key.
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

- Kunci jawaban disimpan di tabel `soal_kunci`, bukan di `soal`. Client tidak memiliki hak langsung atas tabel ini.
- Jangan mengirim kunci kepada browser mahasiswa.
- Jangan menghitung nilai PG hanya di JavaScript frontend.
- Gunakan RPC server `hitung_nilai_pg` dan `berikan_nilai_jawaban`; keduanya memeriksa kepemilikan kelas, dan `berikan_nilai_jawaban` menolak nilai di luar 0–100.
- Mahasiswa hanya dapat mengirim/mengubah jawaban sebelum `tugas.batas_waktu` dan selama jawaban belum bernilai (migrasi `20261126090000`).
- Uji response API/Network agar kunci tidak bocor.

## 5. Storage

- Bucket `materi-files` harus privat, dibatasi 50 MB dan MIME `application/pdf`/`audio/mpeg`.
- Akses file melalui signed URL berumur pendek (tercatat 300 detik).
- Policy upload, baca, ubah, dan hapus membatasi akses berdasarkan peran dan relasi kelas; role `anon` diblokir eksplisit pada bucket ini.
- Hapus file Storage kelas **sebelum** menghapus baris `kelas`, karena policy memeriksa kelas pemilik file.
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

## 7. Aturan frontend (anti-XSS)

- Setiap data dari database atau pengguna yang dimasukkan ke `innerHTML` wajib melewati `escapeHtml()` dari `js/utils.js`. Ini termasuk nama, email, judul, isi teks, nama kelas, kode kelas, dan nilai atribut `data-*`.
- Nama profil dapat diubah oleh mahasiswa sendiri dan ditampilkan ke dosen, jadi dianggap tidak tepercaya.
- URL eksternal wajib melewati `safeHttpUrl()` (hanya `http:`/`https:`) dan tautan `target="_blank"` memakai `rel="noopener noreferrer"`.
- Peran tidak dikirim dari klien saat pendaftaran; database selalu membuat akun baru sebagai `mahasiswa`. Akun dosen dibuat/diubah administrator.
- Cache profil di `localStorage` hanya untuk tampilan UI dan kedaluwarsa 10 menit; jangan dipakai untuk keputusan keamanan.
- Berkas alat bantu (`debug-panel.html`, `performance-panel.html`) tidak boleh ikut di-deploy ke produksi.

## 8. Daftar uji keamanan sebelum rilis

- [ ] Akun mahasiswa A tidak dapat membaca kelas mahasiswa B yang tidak diikutinya.
- [ ] Dosen A tidak dapat mengubah kelas milik dosen B.
- [ ] Mahasiswa tidak dapat membaca kunci jawaban (`soal_kunci`).
- [ ] Mahasiswa tidak dapat mengubah nilai sendiri.
- [ ] Pengguna tidak dapat mengirim jawaban atas nama pengguna lain.
- [ ] Pengiriman ganda ditolak di database.
- [ ] Jawaban setelah deadline ditolak oleh mekanisme server/database.
- [ ] Jawaban yang sudah bernilai tidak dapat diubah mahasiswa.
- [ ] File privat tidak dapat diakses tanpa otorisasi.
- [ ] Storage policy tidak memberi akses publik yang tidak disengaja.
- [ ] Tidak ada secret/service-role key di repository atau bundle browser.
- [ ] RPC tidak dapat dipanggil untuk memanipulasi nilai pengguna lain.
- [ ] RPC `insert_dummy_profile` (bila ada) tidak dapat dipanggil dari client.
- [ ] Nama profil berisi tag HTML tampil sebagai teks biasa di halaman dosen.
- [ ] Tautan materi dengan skema `javascript:` ditolak.

## 9. Backup dan pemulihan

Paket Supabase gratis yang tercatat tidak menyediakan backup otomatis. Lakukan ekspor manual berkala, simpan secara aman, dan dokumentasikan prosedur restore. Jangan menyimpan dump database berisi data pribadi di repository publik.

## Isolasi lingkungan

Demo tidak boleh mengakses project Supabase. Produksi tidak boleh memuat `dummy-data.js` sebagai fallback autentikasi/data. Tidak ada pemilih mode di UI. URL dan publishable/anon key produksi disuntikkan oleh workflow; service-role key dilarang di frontend. Kebijakan RLS tetap menjadi batas keamanan utama dan harus diuji dengan akun berbeda. Pastikan akun demo (`@alima.test`) tidak ada di project Supabase produksi.
