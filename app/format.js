// Lumbung — format angka dan tanggal (rupiah, persen, tanggal Indonesia).
'use strict';

// Rp 1.234.567 — tanpa desimal, sesuai kebiasaan penulisan rupiah.
function formatRupiah(n) {
  const v = Math.round(Math.abs(n));
  return 'Rp ' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Sama, dengan tanda + / − di depan.
function formatSigned(n) {
  if (n > 0) return '+ ' + formatRupiah(n);
  if (n < 0) return '− ' + formatRupiah(n);
  return formatRupiah(0);
}

// 12,5% — koma desimal Indonesia, satu angka di belakang koma.
function formatPercent(ratio) {
  return (ratio * 100).toFixed(1).replace('.', ',') + '%';
}

// '2026-11-05' -> '5 Nov 2026'.
function formatDate(iso) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const parts = iso.split('-');
  return Number(parts[2]) + ' ' + months[Number(parts[1]) - 1] + ' ' + parts[0];
}

// '2026-11' -> 'November 2026'.
function formatMonth(key) {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const parts = key.split('-');
  return months[Number(parts[1]) - 1] + ' ' + parts[0];
}

// Meloloskan teks pengguna sebelum dimasukkan ke innerHTML.
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}
