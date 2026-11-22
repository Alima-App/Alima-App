# Lingkungan Demo dan Produksi

## Keputusan deployment

Alima App menggunakan **satu repository sumber**: `Alima-App/Alima-App`.

| Lingkungan | Branch sumber | Hosting | Backend |
|---|---|---|---|
| Demo | `main` | GitHub Pages | Data simulasi lokal |
| Produksi | `release` | BiznetGio NEO Web Hosting | Supabase produksi |

Alamat demo saat ini: https://alima-app.github.io/Alima-App/

Produksi menggunakan hosting BiznetGio. Domain khusus tidak menjadi kebutuhan saat ini; gunakan alamat bawaan hosting jika tersedia. Ketersediaan dan format alamat bawaan perlu dikonfirmasi di panel/dukungan BiznetGio sebelum rilis.

## Prinsip pemisahan

- **Demo** menggunakan provider lokal `js/providers/demo-auth.js` dan `dummy-data.js`. Jalur aktif demo tidak boleh mengimpor atau menginisialisasi Supabase SDK.
- **Produksi** menggunakan `js/providers/supabase-auth.js`, Supabase Auth, database, RLS, dan Storage. Tidak boleh fallback ke data dummy saat Supabase gagal.
- Mode dipilih ketika deployment membangkitkan `js/deployment-config.js`; tidak ada switch mode pada UI.
- File konfigurasi yang dilacak di Git harus tetap aman dengan default `demo` tanpa kredensial.
- Jangan pernah menaruh Supabase service-role/secret key pada frontend. Hanya publishable/anon key yang boleh digunakan di browser, dengan RLS yang benar.

## Alur branch

1. Pengembangan dan demo berjalan dari `main`.
2. Setiap perubahan yang akan dirilis ke pengguna nyata dipromosikan secara terkontrol ke branch `release`.
3. Branch `release` menjadi sumber deployment produksi ke BiznetGio.
4. Jangan menggabungkan perubahan ke produksi sebelum pemeriksaan fungsional, keamanan, dan konfigurasi selesai.

Branch `release` belum dianggap tersedia sampai benar-benar dibuat di GitHub. Workflow deployment juga belum dianggap aktif sebelum file workflow ditambahkan, secrets dikonfigurasi, dan eksekusi berhasil.

## Konfigurasi yang diperlukan

### Demo — GitHub Pages

- Aktifkan GitHub Pages untuk repository ini.
- Gunakan GitHub Actions atau konfigurasi Pages yang konsisten untuk menerbitkan isi branch `main`.
- Build demo harus menghasilkan `js/deployment-config.js` dengan mode `demo` dan kredensial Supabase kosong.
- Pastikan URL demo tetap sesuai konfigurasi GitHub Pages repository.

### Produksi — BiznetGio

Sebelum workflow FTPS/SFTP dibuat dan dijalankan, konfirmasi metode deployment yang didukung paket hosting dan siapkan GitHub Environment bernama `production`.

Secrets/variables yang dibutuhkan workflow (nama final mengikuti metode upload yang didukung BiznetGio):

| Nama | Jenis | Keterangan |
|---|---|---|
| `SUPABASE_URL` | Variable | URL project Supabase produksi |
| `SUPABASE_ANON_KEY` | Secret | Publishable/anon key, bukan service-role |
| `FTP_HOST` | Secret | Host FTP/FTPS dari BiznetGio |
| `FTP_USERNAME` | Secret | Username deployment |
| `FTP_PASSWORD` | Secret | Password deployment |
| `FTP_TARGET_DIR` | Variable | Direktori web root yang ditetapkan BiznetGio |

Jangan menambahkan nilai secrets ke repository, issue, dokumentasi publik, atau log. Gunakan FTPS jika tersedia; jangan mengirim kredensial melalui koneksi FTP tanpa enkripsi.

### Konfigurasi produksi saat build

File `js/deployment-config.js` untuk build produksi harus berisi mode `production`, `SUPABASE_URL`, dan `SUPABASE_ANON_KEY`. Gunakan script build/deployment yang tervalidasi; jangan mengubah file konfigurasi tracked secara permanen menjadi mode produksi.

## Kondisi implementasi saat ini

- Provider demo dan Supabase sudah dipisahkan melalui dynamic import pada `js/auth.js`.
- Klien Supabase menolak inisialisasi jika mode bukan `production` atau konfigurasi kosong.
- `js/deployment-config.js` yang ada di branch `main` saat ini menggunakan mode `demo`.
- Repository saat ini baru memiliki workflow `.github/workflows/ping.yml`; workflow deploy demo dan produksi belum tersedia.
- Branch yang terverifikasi saat pemeriksaan terakhir hanya `main`. Branch `release` belum dibuat.
- Deployment produksi ke BiznetGio belum dijalankan dan belum diverifikasi.

## Pengujian sebelum rilis

1. Demo dapat dibuka dan login dengan akun demo; data demo tidak menyentuh Supabase.
2. Network tab demo tidak menunjukkan request ke project Supabase dan tidak memuat SDK Supabase.
3. Produksi hanya memakai project Supabase produksi dan tidak menggunakan akun/data demo.
4. Konfigurasi produksi kosong harus gagal tertutup, bukan beralih ke dummy.
5. Dosen hanya dapat mengelola data sesuai kewenangannya.
6. Mahasiswa hanya dapat membaca kelas, materi, tugas, jawaban, dan nilai yang menjadi haknya.
7. Kunci jawaban tidak pernah dikirim ke browser mahasiswa.
8. Uji tampilan pada ponsel dan desktop.
9. Pastikan secret/service-role key tidak muncul di bundle, repository, atau log.

## Catatan kapasitas dan biaya

Hosting BiznetGio digunakan untuk menyajikan frontend statis; database, autentikasi, dan penyimpanan file tetap ditangani Supabase. Kelayakan untuk sekitar 500 mahasiswa tetap perlu diuji melalui skenario akses bersamaan dan pemantauan kuota Supabase. Keberhasilan hosting statis saja tidak membuktikan kapasitas keseluruhan aplikasi.
