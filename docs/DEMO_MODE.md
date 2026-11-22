# Alima App — Demo Mode

## Tujuan
Menampilkan panel login dan dashboard dosen/mahasiswa tanpa koneksi ke Supabase, menggunakan dataset lokal `dummy-data.js`.

## Alur modul
`index.html` → `js/router.js` → `js/auth.js` → `js/pages/login.js` / dashboard.

Jalur ini tidak mengimpor `js/supabase.js`, sehingga tidak melakukan request Supabase dan tidak membutuhkan URL/key.

## Akun demo
Password seluruh akun: `alima123`.

| Peran | Email |
|---|---|
| Dosen | ahmad.fauzi@alima.test |
| Dosen | maryam.sholihah@alima.test |
| Mahasiswa | budi@alima.test |
| Mahasiswa | siti@alima.test |
| Mahasiswa | rizky@alima.test |
| Mahasiswa | dewi@alima.test |
| Mahasiswa | fajar@alima.test |
| Mahasiswa | nurul@alima.test |

## Sesi
`demoLogin()` menyimpan ID profil aktif di `localStorage` (`alima_demo_user`). `demoLogout()` menghapusnya. Data ini hanya simulasi identitas dan dapat dimodifikasi pengguna; jangan gunakan untuk akses data sensitif atau produksi.

## Batasan saat ini
Dashboard membaca kelas, jumlah anggota, materi, dan tugas dari dummy database. Navigasi kelas/materi/tugas/nilai menampilkan placeholder karena halaman aslinya masih memakai Supabase. Integrasi fitur tersebut ke dummyDb adalah pekerjaan lanjutan.

## Kembali ke produksi
Mode demo ini menggantikan jalur autentikasi aktif. Sebelum kembali ke produksi, pulihkan integrasi Supabase dengan pengujian autentikasi, RLS, serta alur sesi. Jangan pernah menaruh service-role key di frontend.
