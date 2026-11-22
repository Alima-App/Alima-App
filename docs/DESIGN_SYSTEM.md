# Design System — Alima App

Dokumen ini merekam token dan kelas CSS yang disebut dalam dokumentasi pengembangan. Ini bukan pengganti pemeriksaan visual terhadap stylesheet aktual.

## 1. Token warna dan bentuk

```css
:root {
  --white: #FFFFFF;
  --bg: #F0F4F8;
  --green: #2D7A4F;
  --green-dark: #1F5938;
  --navy: #1E3A5F;
  --muted: #5A7184;
  --border: #D6E4ED;
  --radius: 8px;
}
```

## 2. Kelas CSS yang tercatat

| Kelas | Tujuan |
|---|---|
| `.page-wrap` | Kontainer utama; max-width 900px, padding 2rem 5% |
| `.card` | Kartu putih dengan border dan radius |
| `.skeleton` | Animasi shimmer saat loading |
| `.spinner` | Spinner hijau untuk splash/loading |
| `.error-msg` | Pesan error |
| `.modal-overlay` | Lapisan modal |
| `.btn-primary` | Tombol utama |
| `.btn-secondary` | Tombol sekunder |
| `.btn-ghost` | Tombol ghost |
| `.btn-danger` | Tombol tindakan destruktif |
| `.btn-sm` | Tombol ukuran kecil |
| `.materi-tipe-badge` | Badge jenis materi |
| `.tipe-teks`, `.tipe-pdf`, `.tipe-mp3`, `.tipe-link` | Variasi badge tipe materi |

## 3. Prinsip konsistensi

- Gunakan token CSS yang sudah ada sebelum menambah warna baru.
- Pertahankan pola tombol dan kartu ant halaman.
- Pastikan kontras teks dan kontrol dapat dibaca di layar ponsel.
- Form harus memiliki label, pesan validasi, dan state loading.
- Tombol aksi destruktif harus dibedakan dengan jelas.
- Gunakan loading, empty, success, dan error state secara konsisten.

## 4. Perlu diverifikasi

Font, ukuran tipografi, spacing scale lengkap, breakpoint, fokus keyboard, dan standar aksesibilitas belum dijelaskan secara lengkap di dokumen sumber. Jangan mengarang nilai tersebut sebagai standar yang sudah disepakati.
