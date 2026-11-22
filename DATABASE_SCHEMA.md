# Database Schema — Alima App

> Ringkasan ini mengikuti dokumentasi pengembangan. Tipe data, nullability, foreign key, constraint, indeks, dan definisi policy lengkap perlu dicocokkan dengan SQL aktual di Supabase sebelum migrasi atau perubahan.

## 1. Tabel

| Tabel | Kolom yang tercatat | Keterangan |
|---|---|---|
| `profiles` | `id` (FK `auth.users`), `nama`, `peran`, `email` | Dibuat otomatis saat sign-up |
| `kelas` | `id`, `nama`, `kode`, `pengajar_id` | `kode` unik, 6 karakter |
| `anggota_kelas` | `kelas_id`, `mahasiswa_id`, `joined_at` | Unik per pasangan kelas/mahasiswa |
| `kelompok` | `id`, `kelas_id`, `nama` | Kelompok di dalam kelas |
| `anggota_kelompok` | `kelompok_id`, `mahasiswa_id` | Unik per pasangan kelompok/mahasiswa |
| `materi` | `id`, `kelas_id`, `judul`, `tipe`, `isi_teks`, `file_key`, `url_eksternal`, `urutan` | Tipe: teks/PDF/MP3/link |
| `tugas` | `id`, `kelas_id`, `judul`, `deskripsi`, `tipe`, `batas_waktu` | Tipe: pilihan ganda/esai |
| `soal` | `id`, `tugas_id`, `pertanyaan`, `pilihan` (JSONB), `kunci`, `urutan` | Kunci tidak boleh terbaca mahasiswa |
| `jawaban` | `id`, `soal_id`, `mahasiswa_id`, `isi_jawaban`, `nilai`, `submitted_at` | Unik per soal/mahasiswa |

## 2. Fungsi dan trigger yang tercatat

| Nama | Jenis | Fungsi |
|---|---|---|
| `handle_new_user()` | Trigger function | Membuat profil setelah user baru |
| `on_auth_user_created` | Trigger | Memanggil fungsi di atas setelah insert `auth.users` |
| `hitung_nilai_pg(tugas_id, mahasiswa_id)` | RPC | Menghitung nilai pilihan ganda di server |
| `cari_kelas_by_kode(kode)` | RPC | Mencari kelas berdasarkan kode; tercatat hanya mengembalikan id dan nama |
| `insert_dummy_profile(id, nama, peran, email)` | Helper | Membuat profil dummy untuk pengujian |

## 3. Index yang tercatat

```sql
create index idx_profiles_id on profiles(id);
create index idx_profiles_peran on profiles(peran);
create index idx_kelas_pengajar on kelas(pengajar_id);
create index idx_anggota_kelas_mahasiswa on anggota_kelas(mahasiswa_id);
create index idx_anggota_kelas_kelas on anggota_kelas(kelas_id);
```

Jangan menjalankan ulang perintah tanpa memeriksa apakah index sudah ada dan apakah definisi aktual sama.

## 4. Storage

- Bucket: `materi-files`
- Akses: private
- Pola akses: signed URL melalui `createSignedUrl()`
- Masa berlaku yang tercatat: 300 detik
- `materi.file_key`: path file di Supabase Storage

## 5. Prinsip integritas dan keamanan

- RLS aktif pada tabel sebagaimana dicatat dalam sumber.
- `pengajar_id` digunakan untuk pemisahan data antardosen.
- Mahasiswa tidak boleh membaca `soal.kunci`.
- Penilaian PG dilakukan di server.
- Constraint unik pada keanggotaan mencegah duplikasi pasangan keanggotaan.

## 6. Pemeriksaan sebelum migrasi

- Ekspor schema aktual dari Supabase.
- Verifikasi seluruh foreign key dan cascade behavior.
- Verifikasi policy `SELECT`, `INSERT`, `UPDATE`, `DELETE` per tabel.
- Verifikasi hak akses function/RPC dan penggunaan `SECURITY DEFINER` bila ada.
- Periksa apakah `search_path` function aman.
- Uji akses lintas kelas dan lintas dosen.
- Buat backup sebelum perubahan destruktif.

## 7. Catatan SQL debugging

Dokumentasi sumber mencatat query untuk melihat profil, kelas beserta jumlah anggota, dan jawaban beserta nilai. Query yang menampilkan `soal.kunci` hanya boleh dijalankan oleh pihak berwenang di lingkungan administrasi, bukan melalui frontend mahasiswa.
