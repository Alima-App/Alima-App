# Lingkungan Demo dan Produksi

## Prinsip pemisahan

Alima App memiliki dua deployment terpisah. Mode dipilih saat CI/CD membangkitkan `js/deployment-config.js`; tidak ada switch mode pada UI. File konfigurasi yang terlacak di Git menggunakan default aman `demo` tanpa kredensial.

- **Demo**: provider lokal `js/providers/demo-auth.js`, dataset `dummy-data.js`, tanpa import SDK Supabase. Akun demo bukan akun produksi.
- **Produksi**: provider `js/providers/supabase-auth.js`, Supabase Auth dan tabel `profiles`; akses data ditentukan RLS. Tidak ada fallback otomatis ke dummy data jika Supabase gagal.
- **UI**: satu basis kode; halaman dashboard demo dan produksi dipisahkan agar dashboard produksi tidak menampilkan statistik dummy. Halaman kelas/materi produksi menggunakan integrasi Supabase yang telah ada.

## Konfigurasi GitHub wajib

Buat GitHub Environments bernama `demo` dan `production`. Siapkan secrets/variables berikut:

| Environment | Type | Name | Isi |
|---|---|---|---|
| demo | Variable | `DEMO_DEPLOY_REPOSITORY` | `owner/repo` khusus situs demo |
| production | Variable | `PRODUCTION_DEPLOY_REPOSITORY` | `owner/repo` khusus situs produksi |
| keduanya | Secret | `ALIMA_DEPLOY_TOKEN` | PAT dengan izin tulis ke masing-masing repository target |
| production | Variable | `SUPABASE_URL` | URL project Supabase produksi |
| production | Secret | `SUPABASE_ANON_KEY` | Publishable/anon key project produksi |

Repository target demo dan produksi harus berbeda dan masing-masing mengaktifkan GitHub Pages dari branch `gh-pages`. Gunakan token dengan cakupan minimum yang diperlukan. Jangan gunakan service-role/secret key di browser. Publishable/anon key memang dapat terlihat di frontend; keamanan wajib ditegakkan oleh RLS.

## Alur deployment

- Push ke `main` menjalankan `deploy-demo.yml` dan menerbitkan build demo ke repository demo.
- Push ke `release` menjalankan `deploy-production.yml` dan menerbitkan build produksi ke repository produksi.
- Keduanya juga dapat dijalankan manual melalui Actions → workflow → Run workflow.
- Branch `release` harus dilindungi (review wajib) dan environment `production` sebaiknya memakai required reviewers.

## Pengujian sebelum rilis

1. Buka situs demo, login dengan akun `@alima.test`, pastikan dashboard berlabel DEMO dan tidak ada request ke domain Supabase.
2. Buka situs produksi, login dengan akun Supabase, pastikan tidak ada akun demo atau data dummy.
3. Uji mahasiswa tidak dapat melihat/mengubah data kelas mahasiswa lain dan dosen hanya mengelola data yang diizinkan RLS.
4. Uji konfigurasi produksi kosong harus gagal tertutup dengan pesan konfigurasi, bukan beralih ke dummy.
5. Periksa Network tab: demo tidak memuat `supabase-js`; produksi hanya menggunakan URL project produksi.

## Batasan yang belum boleh diasumsikan

- File SQL dan kebijakan RLS aktual belum diaudit pada project Supabase.
- Halaman tugas/nilai masih belum diimplementasikan penuh.
- Deploy workflow memerlukan pengaturan GitHub Environments, PAT, dan dua repository target oleh pemilik repository.
- `ping.yml` lama dipertahankan; ping tidak menjamin project Supabase gratis tidak akan dijeda.
