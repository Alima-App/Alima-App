// Utilitas bersama Alima App.
//
// ATURAN: setiap data dari database/pengguna yang dimasukkan ke innerHTML
// WAJIB melewati escapeHtml(). URL eksternal WAJIB melewati safeHttpUrl().
// Lihat docs/SECURITY.md bagian "Aturan frontend".

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]);
}

// Mengembalikan URL http/https yang valid (sudah dinormalisasi),
// atau string kosong jika skemanya tidak aman (mis. javascript:, data:).
export function safeHttpUrl(value) {
  try {
    const url = new URL(String(value ?? '').trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

// Kode kelas: tepat 6 karakter [A-Z0-9], sesuai validasi RPC gabung_kelas_by_kode.
// Memakai crypto.getRandomValues (bukan Math.random) dan selalu menghasilkan panjang penuh.
const KODE_ALFABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function buatKodeKelas(panjang = 6) {
  const nilai = new Uint32Array(panjang);
  crypto.getRandomValues(nilai);
  return Array.from(nilai, n => KODE_ALFABET[n % KODE_ALFABET.length]).join('');
}

export function formatTanggal(iso) {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return '-';
  return tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Inisial dihitung dari teks mentah (sebelum di-escape), lalu di-escape saat dirender.
export function getInitials(nama) {
  return String(nama || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(bagian => Array.from(bagian)[0] || '')
    .join('')
    .toUpperCase();
}
