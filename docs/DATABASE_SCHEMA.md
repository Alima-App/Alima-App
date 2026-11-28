# Database Schema — Alima App

> Ringkasan ini mengikuti dokumentasi pengembangan dan lima migrasi di `supabase/migrations/` ditambah migrasi hardening 2026-11-26. Tipe data, nullability, foreign key, constraint, indeks, dan definisi policy lengkap perlu dicocokkan dengan SQL aktual di Supabase sebelum migrasi atau perubahan. Skema dasar (pembuatan tabel awal) belum tersimpan di repository.

## 1. Tabel

| Tabel | Kolom yang tercatat | Keterangan |
|---|---|---|
| `profiles` | `id` (FK `auth.users`), `nama`, `peran`, `email` | Dibuat otomatis saat sign-up; peran selalu `mahasiswa` untuk pendaftaran publik; client hanya boleh mengubah `nama` |
| `kelas` | `id`, `nama`, `kode`, `pengajar_id`, `created_at` | `kode` unik, 6 karakter `[A-Z0-9]` (index unik `kelas_kode_unique_idx`) |
| `anggota_kelas` | `kelas_id`, `mahasiswa_id`, `joined_at` | Unik per pasangan kelas/mahasiswa; mahasiswa bergabung lewat RPC |
| `kelompok` | `id`, `kelas_id`, `nama` | Kelompok di dalam kelas |
| `anggota_kelompok` | `kelompok_id`, `mahasiswa_id` | Unik per pasangan; mahasiswa harus anggota kelas yang sama |
| `materi` | `id`, `kelas_id`, `judul`, `tipe`, `isi_teks`, `file_key`, `url_eksternal`, `urutan` | Tipe: teks/pdf/mp3/link |
| `tugas` | `id`, `kelas_id`, `judul`, `deskripsi`, `tipe`, `batas_waktu` | Tipe: pilihan ganda/esai |
| `soal` | `id`, `tugas_id`, `pertanyaan`, `pilihan` (JSONB), `urutan` | Kunci **tidak** disimpan di sini |
| `soal_kunci` | `soal_id`, `kunci` | Kunci jawaban; client tidak memiliki hak langsung |
| `jawaban` | `id`, `soal_id`, `mahasiswa_id`, `isi_jawaban`, `nilai`, `submitted_at` | Unik per soal/mahasiswa; mahasiswa hanya dapat mengirim/mengubah sebelum `batas_waktu` dan selama `nilai` kosong |

## 2. Fungsi dan trigger yang tercatat

| Nama | Jenis | Fungsi |
|---|---|---|
| `handle_new_user()` | Trigger function | Membuat profil setelah user baru, selalu dengan peran `mahasiswa` |
| `on_auth_user_created` | Trigger | Memanggil fungsi di atas setelah insert `auth.users` |
| `gabung_kelas_by_kode(p_kode)` | RPC | Bergabung ke kelas dengan kode (menggantikan `cari_kelas_by_kode` dan INSERT langsung) |
| `hitung_nilai_pg(tugas_id, mahasiswa_id)` | RPC | Menghitung nilai PG di server; pembandingan kunci tidak sensitif huruf besar/kecil dan spasi tepi |
| `berikan_nilai_jawaban(jawaban_id, nilai)` | RPC | Dosen pengampu memberi nilai; nilai harus 0–100 |
| `mahasiswa_boleh_menjawab_soal(soal_id)` | Helper (SECURITY DEFINER) | Dipakai policy `jawaban`: anggota kelas, peran mahasiswa, `batas_waktu` belum lewat |
| `cari_kelas_by_kode(kode)` | RPC (lama) | EXECUTE dicabut dari client; gunakan `gabung_kelas_by_kode` |
| `insert_dummy_profile(id, nama, peran, email)` | Helper pengujian | EXECUTE dicabut dari client oleh migrasi 2026-11-26; pertimbangkan menghapusnya dari produksi |

Fungsi SECURITY DEFINER memakai `SET search_path = ''`.

## 3. Index yang tercatat

```sql
create index idx_profiles_id on profiles(id);
create index idx_profiles_peran on profiles(peran);
create index idx_kelas_pengajar on kelas(pengajar_id);
create index idx_anggota_kelas_mahasiswa on anggota_kelas(mahasiswa_id);
create index idx_anggota_kelas_kelas on anggota_kelas(kelas_id);
create unique index kelas_kode_unique_idx on kelas(kode);  -- migrasi 2026-11-26 (dilewati bila ada duplikat)
```

Jangan menjalankan ulang perintah tanpa memeriksa apakah index sudah ada dan apakah definisi aktual sama.

## 4. Storage

- Bucket: `materi-files`
- Akses: private; maksimum 50 MB per file; MIME `application/pdf` dan `audio/mpeg`
- Pola akses: signed URL melalui `createSignedUrl()`
- Masa berlaku yang tercatat: 300 detik
- `materi.file_key`: path file di Supabase Storage dengan pola `<kelas_id>/<timestamp>-<uuid>.<ext>`
- Policy restriktif untuk SELECT/INSERT/UPDATE/DELETE berdasarkan kelas pada segmen pertama path; role `anon` diblokir pada bucket ini

## 5. Prinsip integritas dan keamanan

- RLS aktif pada tabel sebagaimana dicatat dalam sumber.
- `pengajar_id` digunakan untuk pemisahan data antardosen.
- Mahasiswa tidak boleh membaca kunci jawaban (`soal_kunci`).
- Penilaian PG dilakukan di server.
- Constraint unik pada keanggotaan mencegah duplikasi pasangan keanggotaan.
- Jawaban terkunci setelah batas waktu atau setelah dinilai.

## 6. Pemeriksaan sebelum migrasi

- Ekspor schema aktual dari Supabase.
- Verifikasi seluruh foreign key dan cascade behavior.
- Verifikasi policy `SELECT`, `INSERT`, `UPDATE`, `DELETE` per tabel.
- Verifikasi hak akses function/RPC dan penggunaan `SECURITY DEFINER` bila ada.
- Periksa apakah `search_path` function aman.
- Uji akses lintas kelas dan lintas dosen.
- Buat backup sebelum perubahan destruktif.

## 7. Catatan SQL debugging

Dokumentasi sumber mencatat query untuk melihat profil, kelas beserta jumlah anggota, dan jawaban beserta nilai. Query yang menampilkan kunci jawaban hanya boleh dijalankan oleh pihak berwenang di lingkungan administrasi, bukan melalui frontend mahasiswa.

## 8. Catatan desain terbuka

- `hitung_nilai_pg` menulis nilai tugas yang sama ke setiap baris `jawaban` milik mahasiswa pada tugas itu. Pertimbangkan tabel nilai per tugas.
- Skema dasar belum ada di `supabase/migrations/`; ekspor dari Supabase dan simpan sebagai migrasi awal agar database dapat direproduksi.
