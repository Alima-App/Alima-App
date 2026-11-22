# ADR-0001: Mempertahankan Stack Frontend Tanpa Framework

- Status: Accepted (keputusan yang tercatat dalam dokumentasi pengembangan)
- Tanggal: 2026-11-22

## Konteks
Alima App dikembangkan menggunakan perangkat dan alur kerja yang tidak memerlukan npm atau build tool.

## Keputusan
Mempertahankan HTML, CSS, dan JavaScript ES Modules tanpa framework/build tool, serta hosting frontend di GitHub Pages.

## Alternatif
Menggunakan framework frontend dan pipeline build. Tidak dipilih dalam keputusan awal.

## Konsekuensi
- Struktur sederhana dan deployment statis.
- Pengelolaan modul, state, dan routing dilakukan secara manual.
- Perubahan stack di masa depan memerlukan ADR baru dan rencana migrasi.

## Validasi
Pastikan seluruh halaman tetap dapat diakses melalui hash routing dan deployment GitHub Pages.
