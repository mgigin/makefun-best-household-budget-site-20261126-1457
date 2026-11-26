// Lumbung — grafik SVG buatan tangan (donat kategori + batang tren).
// Tanpa pustaka luar: semua titik dihitung di sini dari data yang sama
// dengan yang ditampilkan tabel, jadi grafik dan angka tidak pernah beda.
'use strict';

// Donat: parts = [{label, value, color}]. Mengembalikan string SVG.
function donutSVG(parts, size, holeLabel, holeValue) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const stroke = 34;
  let offset = 25; // mulai dari atas (12 o'clock)
  let arcs = '';
  for (const p of parts) {
    if (p.value <= 0 || total <= 0) continue;
    const frac = p.value / total;
    const len = frac * 100;
    arcs += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.color +
      '" stroke-width="' + stroke + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (100 - len).toFixed(2) +
      '" stroke-dashoffset="' + offset.toFixed(2) + '" pathLength="100"/>';
    offset -= len;
  }
  const center = holeLabel
    ? '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" class="donut-center-label">' + escapeHtml(holeLabel) + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 20) + '" text-anchor="middle" class="donut-center-value">' + escapeHtml(holeValue) + '</text>'
    : '';
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size +
    '" role="img" aria-label="Grafik donat ' + escapeHtml(holeLabel || 'kategori') + '">' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#eee7d8" stroke-width="' + stroke + '"/>' +
    arcs + center + '</svg>';
}

// Batang vertikal: series = [{label, income, expense}]. Nilai dalam rupiah.
function trendBarsSVG(series, width, height) {
  const max = Math.max.apply(null, series.map((s) => Math.max(s.income, s.expense))) || 1;
  const padBottom = 26;
  const padTop = 8;
  const chartH = height - padTop - padBottom;
  const slot = width / series.length;
  const barW = Math.min(26, slot * 0.28);
  let out = '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" height="' + height +
    '" role="img" aria-label="Grafik batang pemasukan dan pengeluaran enam bulan terakhir" preserveAspectRatio="xMidYMid meet">';
  series.forEach((s, i) => {
    const x = i * slot + slot / 2;
    const ih = (s.income / max) * chartH;
    const eh = (s.expense / max) * chartH;
    out += '<rect x="' + (x - barW - 3).toFixed(1) + '" y="' + (padTop + chartH - ih).toFixed(1) +
      '" width="' + barW + '" height="' + ih.toFixed(1) + '" rx="3" fill="#2e7d32"><title>' + escapeHtml(s.label) +
      ' pemasukan ' + formatRupiah(s.income) + '</title></rect>';
    out += '<rect x="' + (x + 3).toFixed(1) + '" y="' + (padTop + chartH - eh).toFixed(1) +
      '" width="' + barW + '" height="' + eh.toFixed(1) + '" rx="3" fill="#c2410c"><title>' + escapeHtml(s.label) +
      ' pengeluaran ' + formatRupiah(s.expense) + '</title></rect>';
    out += '<text x="' + x.toFixed(1) + '" y="' + (height - 8) + '" text-anchor="middle" class="bar-label">' +
      escapeHtml(s.label) + '</text>';
  });
  out += '</svg>';
  return out;
}

// Batang horizontal sederhana untuk perbandingan dua angka (Okt vs Nov).
function compareBarSVG(value, max, color) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return '<span class="compare-bar" role="img" aria-label="' + formatRupiah(value) + '"><span class="compare-fill" style="width:' +
    pct.toFixed(1) + '%;background:' + color + '"></span></span>';
}
