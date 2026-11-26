// Lumbung — semua halaman: Dasbor, Transaksi, Anggaran, Tagihan, Tujuan,
// Laporan, Kalkulator. Satu file, satu tugas: mengubah data + state menjadi HTML
// dan mengikat kontrolnya. Semua angka dihitung dari LUMBUNG_DATA + perubahan
// pengguna yang tersimpan di localStorage, jadi tabel dan grafik selalu cocok.
'use strict';

const STORE_KEY = 'lumbung-v1';
const MONTHS = ['2026-11', '2026-10'];

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { added: [], deleted: [], edited: {}, billsPaid: {}, goalExtra: {}, month: '2026-11' };
    const s = JSON.parse(raw);
    s.added = s.added || [];
    s.deleted = s.deleted || [];
    s.edited = s.edited || {};
    s.billsPaid = s.billsPaid || {};
    s.goalExtra = s.goalExtra || {};
    s.month = MONTHS.indexOf(s.month) === -1 ? '2026-11' : s.month;
    return s;
  } catch (e) {
    return { added: [], deleted: [], edited: {}, billsPaid: {}, goalExtra: {}, month: '2026-11' };
  }
}

let state = loadState();

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* penyimpanan penuh: perubahan sesi ini saja */ }
}

// ---- Data efektif (data dasar + perubahan pengguna) -----------------------

function allTransactions() {
  const edited = {};
  LUMBUNG_DATA.transactions.forEach((t) => {
    if (state.deleted.indexOf(t.id) !== -1) return;
    edited[t.id] = state.edited[t.id] ? Object.assign({}, t, state.edited[t.id]) : t;
  });
  state.added.forEach((t) => { edited[t.id] = t; });
  return Object.keys(edited).map((k) => edited[k]);
}

function monthTx(month) {
  return allTransactions().filter((t) => t.date.indexOf(month) === 0);
}

function monthTotals(month) {
  let income = 0;
  let expense = 0;
  const byCat = {};
  monthTx(month).forEach((t) => {
    if (t.amount > 0) income += t.amount;
    else {
      expense += -t.amount;
      byCat[t.cat] = (byCat[t.cat] || 0) + -t.amount;
    }
  });
  return { income: income, expense: expense, left: income - expense, byCat: byCat };
}

function billPaid(bill) {
  return Object.prototype.hasOwnProperty.call(state.billsPaid, bill.id) ? state.billsPaid[bill.id] : bill.paid;
}

function goalSaved(goal) {
  return goal.saved + (state.goalExtra[goal.id] || 0);
}

// ---- Potongan HTML yang dipakai ulang -------------------------------------

function monthSwitcher() {
  return '<div class="month-switch" role="group" aria-label="Pilih bulan">' +
    MONTHS.map((m) => '<button type="button" class="month-btn' + (state.month === m ? ' active' : '') +
      '" data-month="' + m + '" aria-pressed="' + (state.month === m) + '">' + formatMonth(m) + '</button>').join('') +
    '</div>';
}

function categoryOptions(selected) {
  let out = '<option value="all"' + (selected === 'all' ? ' selected' : '') + '>Semua kategori</option>';
  out += '<option value="Pemasukan"' + (selected === 'Pemasukan' ? ' selected' : '') + '>Pemasukan</option>';
  Object.keys(LUMBUNG_DATA.categories).forEach((c) => {
    out += '<option value="' + escapeHtml(c) + '"' + (selected === c ? ' selected' : '') + '>' + escapeHtml(c) + '</option>';
  });
  return out;
}

function txRowsHtml(rows) {
  if (rows.length === 0) {
    return '<tr><td colspan="5" class="empty-note">Tidak ada transaksi yang cocok. Ubah pencarian atau filter.</td></tr>';
  }
  return rows.map((t) => {
    const cat = LUMBUNG_DATA.categories[t.cat];
    const dot = cat ? '<span class="cat-dot" style="background:' + cat.color + '"></span>' : '';
    return '<tr><td>' + formatDate(t.date) + '</td><td>' + escapeHtml(t.desc) + '</td>' +
      '<td>' + dot + escapeHtml(t.cat) + '</td>' +
      '<td class="num ' + (t.amount > 0 ? 'in' : 'out') + '">' + formatSigned(t.amount) + '</td>' +
      '<td class="row-actions"><button type="button" class="btn-small" data-edit="' + t.id + '">Ubah</button> ' +
      '<button type="button" class="btn-small danger" data-del="' + t.id + '">Hapus</button></td></tr>';
  }).join('');
}

function donutLegend(parts, total) {
  return '<ul class="legend">' + parts.map((p) =>
    '<li><span class="cat-dot" style="background:' + p.color + '"></span>' + escapeHtml(p.label) +
    '<span class="legend-amt">' + formatRupiah(p.value) + ' · ' + formatPercent(total ? p.value / total : 0) + '</span></li>'
  ).join('') + '</ul>';
}

// ---- Dasbor ----------------------------------------------------------------

function renderDashboard() {
  const t = monthTotals(state.month);
  const saveRate = t.income > 0 ? t.left / t.income : 0;
  const parts = Object.keys(t.byCat).map((c) => ({
    label: c, value: t.byCat[c], color: (LUMBUNG_DATA.categories[c] || {}).color || '#78909c',
  })).sort((a, b) => b.value - a.value);
  const topParts = parts;

  // Tiga amplop paling mendekati batas.
  const envelopes = Object.keys(LUMBUNG_DATA.budgets).map((c) => {
    const spent = t.byCat[c] || 0;
    return { cat: c, spent: spent, limit: LUMBUNG_DATA.budgets[c], pct: spent / LUMBUNG_DATA.budgets[c] };
  }).sort((a, b) => b.pct - a.pct).slice(0, 3);

  const unpaid = LUMBUNG_DATA.bills.filter((b) => !billPaid(b)).sort((a, b) => a.due - b.due).slice(0, 3);
  const recent = monthTx(state.month).slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);

  // Pembagian kebutuhan / keinginan / tabungan bulan ini.
  let needs = 0;
  let wants = 0;
  let saved = 0;
  Object.keys(t.byCat).forEach((c) => {
    const kind = (LUMBUNG_DATA.categories[c] || {}).kind;
    if (kind === 'need') needs += t.byCat[c];
    else if (kind === 'want') wants += t.byCat[c];
    else if (kind === 'save') saved += t.byCat[c];
  });
  const savedTotal = saved;
  const unallocated = Math.max(0, t.left);

  return '<section class="page-head"><div><h1>Dasbor ' + escapeHtml(LUMBUNG_DATA.family.name) + '</h1>' +
    '<p class="muted">' + escapeHtml(LUMBUNG_DATA.family.members) + ' · ' + escapeHtml(LUMBUNG_DATA.family.city) +
    ' · ' + escapeHtml(LUMBUNG_DATA.family.asOf) + '</p></div>' + monthSwitcher() + '</section>' +

    '<section class="kpi-grid" aria-label="Ringkasan bulan ini">' +
    '<article class="kpi"><h2>Pemasukan</h2><p class="kpi-value in">' + formatRupiah(t.income) + '</p><p class="muted">' + monthTx(state.month).filter((x) => x.amount > 0).length + ' pemasukan</p></article>' +
    '<article class="kpi"><h2>Pengeluaran</h2><p class="kpi-value out">' + formatRupiah(t.expense) + '</p><p class="muted">' + monthTx(state.month).filter((x) => x.amount < 0).length + ' pengeluaran</p></article>' +
    '<article class="kpi"><h2>Sisa Uang</h2><p class="kpi-value">' + formatRupiah(t.left) + '</p><p class="muted">Belum termasuk tagihan 27–30 Nov</p></article>' +
    '<article class="kpi"><h2>Tingkat Tabungan</h2><p class="kpi-value">' + formatPercent(saveRate) + '</p><p class="muted">Target keluarga: 20% dari pemasukan</p></article>' +
    '</section>' +

    '<section class="grid-2">' +
    '<article class="card"><h2>Pengeluaran per Kategori</h2><div class="donut-wrap">' +
    donutSVG(topParts, 200, 'Total', formatRupiah(t.expense)) + donutLegend(topParts, t.expense) +
    '</div><p><a href="#/laporan">Lihat perbandingan Oktober vs November →</a></p></article>' +

    '<article class="card"><h2>Amplop Paling Ketat</h2>' + envelopes.map((e) =>
      '<div class="env-row"><div class="env-head"><span>' + escapeHtml(e.cat) + '</span><span>' + formatRupiah(e.spent) + ' / ' + formatRupiah(e.limit) + '</span></div>' +
      '<div class="bar"><span class="bar-fill' + (e.pct > 1 ? ' over' : e.pct > 0.85 ? ' warn' : '') + '" style="width:' + Math.min(100, e.pct * 100).toFixed(1) + '%"></span></div>' +
      '<p class="muted">' + (e.pct > 1 ? 'Melewati batas ' + formatRupiah(e.spent - e.limit) + '.' : 'Sisa ' + formatRupiah(e.limit - e.spent) + ' sampai akhir bulan.') + '</p></div>'
    ).join('') + '<p><a href="#/anggaran">Buka semua amplop anggaran →</a></p></article>' +
    '</section>' +

    '<section class="grid-2">' +
    '<article class="card"><h2>Tagihan Berikutnya</h2>' + (unpaid.length === 0
      ? '<p class="muted">Semua tagihan bulan ini sudah lunas. Bagus sekali.</p>'
      : '<ul class="bill-list">' + unpaid.map((b) => '<li><span><strong>' + escapeHtml(b.name) + '</strong><br><span class="muted">Jatuh tempo ' + b.due + ' Nov · ' + escapeHtml(b.note) + '</span></span><strong>' + formatRupiah(b.amount) + '</strong></li>').join('') + '</ul>') +
    '<p><a href="#/tagihan">Buka kalender tagihan →</a></p></article>' +

    '<article class="card"><h2>Cek 50 / 30 / 20</h2>' +
    '<p>Kebutuhan <strong>' + formatPercent(t.income ? needs / t.income : 0) + '</strong> (ideal 50%) · Keinginan <strong>' + formatPercent(t.income ? wants / t.income : 0) + '</strong> (ideal 30%) · Sudah ditabung <strong>' + formatPercent(t.income ? savedTotal / t.income : 0) + '</strong> (ideal 20%).</p>' +
    '<p class="muted">Sisa ' + formatRupiah(unallocated) + ' belum dialokasikan — rencananya masuk Dana Darurat di akhir bulan, setelah tagihan 27–30 Nov dibayar.</p>' +
    '<p><a href="#/kalkulator">Hitung dengan penghasilanmu →</a></p></article>' +
    '</section>' +

    '<section class="grid-2">' +
    '<article class="card"><h2>Tujuan Menabung</h2>' + LUMBUNG_DATA.goals.map((g) => {
      const sv = goalSaved(g);
      const pct = sv / g.target;
      return '<div class="env-row"><div class="env-head"><span>' + escapeHtml(g.name) + '</span><span>' + formatPercent(pct) + '</span></div>' +
        '<div class="bar"><span class="bar-fill save" style="width:' + (pct * 100).toFixed(1) + '%"></span></div>' +
        '<p class="muted">' + formatRupiah(sv) + ' dari ' + formatRupiah(g.target) + ' · target ' + escapeHtml(g.deadline) + '</p></div>';
    }).join('') + '<p><a href="#/tujuan">Buka tujuan dan setor →</a></p></article>' +

    '<article class="card"><h2>Transaksi Terakhir</h2><div class="table-wrap"><table class="tx-table"><thead><tr><th scope="col">Tanggal</th><th scope="col">Keterangan</th><th scope="col">Kategori</th><th scope="col" class="num">Jumlah</th></tr></thead><tbody>' +
    recent.map((x) => '<tr><td>' + formatDate(x.date) + '</td><td>' + escapeHtml(x.desc) + '</td><td>' + escapeHtml(x.cat) + '</td><td class="num ' + (x.amount > 0 ? 'in' : 'out') + '">' + formatSigned(x.amount) + '</td></tr>').join('') +
    '</tbody></table></div><p><a href="#/transaksi">Buka semua transaksi →</a></p></article>' +
    '</section>';
}

// ---- Transaksi ---------------------------------------------------------------

let txFilter = { q: '', cat: 'all', type: 'all', sort: 'date-desc' };
let editingId = null;

function filteredTx() {
  let rows = monthTx(state.month);
  if (txFilter.cat !== 'all') rows = rows.filter((t) => t.cat === txFilter.cat);
  if (txFilter.type === 'in') rows = rows.filter((t) => t.amount > 0);
  if (txFilter.type === 'out') rows = rows.filter((t) => t.amount < 0);
  if (txFilter.q) {
    const q = txFilter.q.toLowerCase();
    rows = rows.filter((t) => t.desc.toLowerCase().indexOf(q) !== -1 || t.cat.toLowerCase().indexOf(q) !== -1);
  }
  rows = rows.slice();
  if (txFilter.sort === 'date-asc') rows.sort((a, b) => (a.date < b.date ? -1 : 1));
  else if (txFilter.sort === 'amount-desc') rows.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  else if (txFilter.sort === 'amount-asc') rows.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
  else rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  return rows;
}

function renderTransactions() {
  const rows = filteredTx();
  const totalIn = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = rows.filter((t) => t.amount < 0).reduce((s, t) => s + -t.amount, 0);
  const editing = editingId ? allTransactions().find((t) => t.id === editingId) : null;

  return '<section class="page-head"><div><h1>Transaksi</h1><p class="muted">Semua pemasukan dan pengeluaran ' + formatMonth(state.month) +
    ' · perubahan tersimpan di peramban ini</p></div>' + monthSwitcher() + '</section>' +

    '<section class="card"><form id="tx-form" class="tx-form" aria-label="' + (editing ? 'Ubah transaksi' : 'Tambah transaksi') + '">' +
    '<h2>' + (editing ? 'Ubah Transaksi' : 'Tambah Transaksi') + '</h2>' +
    '<div class="form-grid">' +
    '<label>Tanggal<input type="date" id="f-date" required value="' + (editing ? editing.date : state.month + '-26') + '" min="2026-10-01" max="2026-11-30"></label>' +
    '<label>Keterangan<input type="text" id="f-desc" required maxlength="80" placeholder="cth. Belanja mingguan" value="' + (editing ? escapeHtml(editing.desc) : '') + '"></label>' +
    '<label>Kategori<select id="f-cat">' + categoryOptions(editing ? editing.cat : 'Belanja Harian') + '</select></label>' +
    '<label>Jenis<select id="f-type"><option value="out"' + (editing && editing.amount > 0 ? '' : ' selected') + '>Pengeluaran</option><option value="in"' + (editing && editing.amount > 0 ? ' selected' : '') + '>Pemasukan</option></select></label>' +
    '<label>Jumlah (Rp)<input type="number" id="f-amount" required min="1000" step="500" placeholder="150000" value="' + (editing ? Math.abs(editing.amount) : '') + '"></label>' +
    '</div><div class="form-actions"><button type="submit" class="btn">' + (editing ? 'Simpan Perubahan' : 'Tambah Transaksi') + '</button>' +
    (editing ? ' <button type="button" class="btn ghost" id="cancel-edit">Batal</button>' : '') +
    '<span id="form-msg" class="form-msg" role="status"></span></div></form></section>' +

    '<section class="card"><div class="filter-row">' +
    '<label>Cari <input type="search" id="f-q" placeholder="cth. Super Indo" value="' + escapeHtml(txFilter.q) + '" aria-label="Cari transaksi"></label>' +
    '<label>Kategori <select id="f-catfilter">' + categoryOptions(txFilter.cat) + '</select></label>' +
    '<label>Jenis <select id="f-typefilter"><option value="all"' + (txFilter.type === 'all' ? ' selected' : '') + '>Semua</option><option value="in"' + (txFilter.type === 'in' ? ' selected' : '') + '>Pemasukan</option><option value="out"' + (txFilter.type === 'out' ? ' selected' : '') + '>Pengeluaran</option></select></label>' +
    '<label>Urutkan <select id="f-sort"><option value="date-desc"' + (txFilter.sort === 'date-desc' ? ' selected' : '') + '>Tanggal terbaru</option><option value="date-asc"' + (txFilter.sort === 'date-asc' ? ' selected' : '') + '>Tanggal terlama</option><option value="amount-desc"' + (txFilter.sort === 'amount-desc' ? ' selected' : '') + '>Jumlah terbesar</option><option value="amount-asc"' + (txFilter.sort === 'amount-asc' ? ' selected' : '') + '>Jumlah terkecil</option></select></label>' +
    '<button type="button" class="btn ghost" id="export-csv">Unduh CSV</button></div>' +
    '<p class="muted">' + rows.length + ' transaksi · pemasukan ' + formatRupiah(totalIn) + ' · pengeluaran ' + formatRupiah(totalOut) + '</p>' +
    '<div class="table-wrap"><table class="tx-table"><thead><tr><th scope="col">Tanggal</th><th scope="col">Keterangan</th><th scope="col">Kategori</th><th scope="col" class="num">Jumlah</th><th scope="col">Aksi</th></tr></thead><tbody>' +
    txRowsHtml(rows) + '</tbody></table></div></section>';
}

// ---- Anggaran ----------------------------------------------------------------

function renderBudgets() {
  const t = monthTotals(state.month);
  const daysLeft = state.month === '2026-11' ? 4 : 0; // 26 Nov -> 30 Nov
  const cards = Object.keys(LUMBUNG_DATA.budgets).map((c) => {
    const spent = t.byCat[c] || 0;
    const limit = LUMBUNG_DATA.budgets[c];
    const pct = spent / limit;
    const left = limit - spent;
    const pace = daysLeft > 0 ? Math.max(0, left) / daysLeft : 0;
    const status = pct > 1 ? 'over' : pct > 0.85 ? 'warn' : 'ok';
    const statusText = pct > 1 ? 'Melewati batas ' + formatRupiah(-left) : pct > 0.85 ? 'Hampir habis — hati-hati' : 'Aman';
    return '<article class="card env-card ' + status + '"><h2>' + escapeHtml(c) + '</h2>' +
      '<p class="env-big">' + formatRupiah(spent) + ' <span class="muted">/ ' + formatRupiah(limit) + '</span></p>' +
      '<div class="bar"><span class="bar-fill' + (pct > 1 ? ' over' : pct > 0.85 ? ' warn' : '') + '" style="width:' + Math.min(100, pct * 100).toFixed(1) + '%"></span></div>' +
      '<p><strong>' + formatPercent(pct) + '</strong> terpakai · ' + statusText + '</p>' +
      '<p class="muted">' + (left >= 0
        ? 'Sisa ' + formatRupiah(left) + (daysLeft > 0 ? ' · boleh belanja ' + formatRupiah(pace) + ' per hari sampai 30 Nov.' : '')
        : 'Kurangi belanja kategori ini sampai akhir bulan.') + '</p></article>';
  }).join('');

  const totalLimit = Object.keys(LUMBUNG_DATA.budgets).reduce((s, c) => s + LUMBUNG_DATA.budgets[c], 0);
  const totalSpent = Object.keys(LUMBUNG_DATA.budgets).reduce((s, c) => s + (t.byCat[c] || 0), 0);
  return '<section class="page-head"><div><h1>Anggaran — Amplop Bulanan</h1><p class="muted">Setiap kategori punya batas. Uang yang sudah dipakai dihitung dari transaksi ' + formatMonth(state.month) + '.</p></div>' + monthSwitcher() + '</section>' +
    '<section class="card summary-strip"><p><strong>Total amplop:</strong> ' + formatRupiah(totalSpent) + ' dari ' + formatRupiah(totalLimit) +
    ' (' + formatPercent(totalLimit ? totalSpent / totalLimit : 0) + ') · <strong>Target tabungan bulan ini:</strong> ' + formatRupiah(LUMBUNG_DATA.savingsTarget) +
    ' · <strong>Sudah ditabung (transfer):</strong> ' + formatRupiah(t.byCat.Tabungan || 0) +
    ' · <strong>Sisa yang masih bisa ditabung:</strong> ' + formatRupiah(Math.max(0, t.left)) + '</p></section>' +
    '<section class="grid-3">' + cards + '</section>' +
    '<section class="card"><h2>Cara kerja amplop</h2><p>Di awal bulan, keluarga Prasetyo membagi pemasukan ke amplop-amplop di atas. Belanja harian diambil dari amplop Belanja Harian, bukan dari rekening gaji. Kalau satu amplop habis, mereka meminjam dari amplop lain — dan mencatatnya sebagai transaksi — bukan menambah utang kartu kredit.</p></section>';
}

// ---- Tagihan -----------------------------------------------------------------

function renderBills() {
  const total = LUMBUNG_DATA.bills.reduce((s, b) => s + b.amount, 0);
  const paidCount = LUMBUNG_DATA.bills.filter(billPaid).length;
  const unpaidTotal = LUMBUNG_DATA.bills.filter((b) => !billPaid(b)).reduce((s, b) => s + b.amount, 0);
  const weeks = [[1, 7, 'Minggu 1 (1–7 Nov)'], [8, 14, 'Minggu 2 (8–14 Nov)'], [15, 21, 'Minggu 3 (15–21 Nov)'], [22, 30, 'Minggu 4 (22–30 Nov)']];
  const weekHtml = weeks.map((w) => {
    const items = LUMBUNG_DATA.bills.filter((b) => b.due >= w[0] && b.due <= w[1]).sort((a, b) => a.due - b.due);
    return '<article class="card"><h2>' + w[2] + '</h2><ul class="bill-list">' + items.map((b) => {
      const paid = billPaid(b);
      return '<li class="' + (paid ? 'paid' : '') + '"><span><strong>' + escapeHtml(b.name) + '</strong><br><span class="muted">' + b.due + ' Nov · ' + escapeHtml(b.note) + '</span></span>' +
        '<span class="bill-right"><strong>' + formatRupiah(b.amount) + '</strong><br>' +
        '<button type="button" class="btn-small' + (paid ? '' : ' primary') + '" data-bill="' + b.id + '">' + (paid ? 'Lunas ✓ · Batalkan' : 'Tandai Lunas') + '</button></span></li>';
    }).join('') + '</ul></article>';
  }).join('');

  return '<section class="page-head"><div><h1>Tagihan &amp; Kalender</h1><p class="muted">Tagihan rutin ' + formatMonth(state.month) + ' · tandai lunas saat sudah dibayar, status tersimpan di peramban ini.</p></div></section>' +
    '<section class="kpi-grid" aria-label="Ringkasan tagihan"><article class="kpi"><h2>Total Tagihan</h2><p class="kpi-value">' + formatRupiah(total) + '</p><p class="muted">12 tagihan rutin</p></article>' +
    '<article class="kpi"><h2>Sudah Lunas</h2><p class="kpi-value in">' + paidCount + ' dari 12</p><p class="muted">' + formatRupiah(total - unpaidTotal) + ' terbayar</p></article>' +
    '<article class="kpi"><h2>Belum Lunas</h2><p class="kpi-value out">' + formatRupiah(unpaidTotal) + '</p><p class="muted">Jatuh tempo 27–30 Nov</p></article></section>' +
    '<section class="grid-2">' + weekHtml + '</section>';
}

// ---- Tujuan ------------------------------------------------------------------

function renderGoals() {
  const now = new Date(2026, 10, 26);
  const cards = LUMBUNG_DATA.goals.map((g) => {
    const saved = goalSaved(g);
    const pct = Math.min(1, saved / g.target);
    const left = g.target - saved;
    const months = { 'Maret 2027': 4, 'Juni 2027': 7 };
    const perMonth = months[g.deadline] ? Math.ceil(left / months[g.deadline] / 1000) * 1000 : left;
    return '<article class="card goal-card"><h2>' + escapeHtml(g.name) + '</h2><p class="muted">' + escapeHtml(g.desc) + '</p>' +
      '<p class="env-big">' + formatRupiah(saved) + ' <span class="muted">/ ' + formatRupiah(g.target) + '</span></p>' +
      '<div class="bar"><span class="bar-fill save" style="width:' + (pct * 100).toFixed(1) + '%"></span></div>' +
      '<p><strong>' + formatPercent(pct) + '</strong> tercapai · sisa ' + formatRupiah(Math.max(0, left)) + ' · target ' + escapeHtml(g.deadline) + '</p>' +
      '<p class="muted">Setor ' + formatRupiah(perMonth) + ' per bulan agar tercapai tepat waktu.</p>' +
      '<div class="goal-actions"><span>Setor cepat:</span>' +
      '<button type="button" class="btn-small primary" data-goal="' + g.id + '" data-amount="100000">+ Rp 100 rb</button>' +
      '<button type="button" class="btn-small primary" data-goal="' + g.id + '" data-amount="250000">+ Rp 250 rb</button>' +
      '<button type="button" class="btn-small primary" data-goal="' + g.id + '" data-amount="500000">+ Rp 500 rb</button></div>' +
      '<form class="goal-form" data-goal-form="' + g.id + '"><label>Setor jumlah lain (Rp) <input type="number" min="10000" step="10000" placeholder="200000" required aria-label="Jumlah setor untuk ' + escapeHtml(g.name) + '"></label>' +
      '<button type="submit" class="btn-small">Setor</button></form></article>';
  }).join('');
  const totalSaved = LUMBUNG_DATA.goals.reduce((s, g) => s + goalSaved(g), 0);
  const totalTarget = LUMBUNG_DATA.goals.reduce((s, g) => s + g.target, 0);
  return '<section class="page-head"><div><h1>Tujuan Menabung</h1><p class="muted">Tiga tujuan keluarga Prasetyo · total terkumpul ' + formatRupiah(totalSaved) + ' dari ' + formatRupiah(totalTarget) + ' · setoran tersimpan di peramban ini.</p></div></section>' +
    '<section class="grid-3">' + cards + '</section>' +
    '<section class="card"><h2>Aturan setor keluarga</h2><p>Setiap tanggal 5, begitu gaji masuk, Rp 1.000.000 langsung dipindah ke Dana Darurat sebelum belanja apa pun. Sisa gaji yang tidak terpakai di akhir bulan dibagi rata ke Liburan dan Laptop Dimas. Dana Darurat tidak boleh dipakai kecuali untuk keadaan darurat sungguhan — bukan diskon atau promo.</p></section>';
}

// ---- Laporan -----------------------------------------------------------------

function renderReports() {
  const nov = monthTotals('2026-11');
  const oct = monthTotals('2026-10');
  const cats = Object.keys(LUMBUNG_DATA.categories);
  const maxCat = Math.max.apply(null, cats.map((c) => Math.max(oct.byCat[c] || 0, nov.byCat[c] || 0))) || 1;

  function row(label, a, b) {
    const diff = b - a;
    const diffText = diff === 0 ? 'sama' : (diff > 0 ? 'naik ' : 'turun ') + formatRupiah(Math.abs(diff));
    return '<tr><th scope="row">' + label + '</th><td class="num">' + formatRupiah(a) + '</td><td>' + compareBarSVG(a, maxCat, '#78909c') + '</td>' +
      '<td class="num">' + formatRupiah(b) + '</td><td>' + compareBarSVG(b, maxCat, '#2e7d32') + '</td><td>' + diffText + '</td></tr>';
  }

  const trend = LUMBUNG_DATA.trend.map((m) => {
    if (m.month === 'Okt 2026') return { label: 'Okt', income: oct.income, expense: oct.expense };
    if (m.month === 'Nov 2026') return { label: 'Nov', income: nov.income, expense: nov.expense };
    return { label: m.month.split(' ')[0], income: m.income, expense: m.expense };
  });

  const parts = Object.keys(nov.byCat).map((c) => ({
    label: c, value: nov.byCat[c], color: (LUMBUNG_DATA.categories[c] || {}).color || '#78909c',
  })).sort((a, b) => b.value - a.value);

  return '<section class="page-head"><div><h1>Laporan Bulanan</h1><p class="muted">Oktober vs November 2026 · tren enam bulan · November dihitung sampai 26 Nov.</p></div></section>' +
    '<section class="card"><h2>Oktober vs November</h2><div class="table-wrap"><table class="report-table"><thead><tr><th scope="col">Pos</th><th scope="col" class="num">Okt 2026</th><th scope="col"></th><th scope="col" class="num">Nov 2026</th><th scope="col"></th><th scope="col">Perubahan</th></tr></thead><tbody>' +
    row('Pemasukan', oct.income, nov.income) +
    cats.map((c) => row(c, oct.byCat[c] || 0, nov.byCat[c] || 0)).join('') +
    row('Total pengeluaran', oct.expense, nov.expense) +
    row('Sisa uang', oct.left, nov.left) +
    '</tbody></table></div>' +
    '<p><strong>Yang paling berubah:</strong> pemasukan naik ' + formatRupiah(nov.income - oct.income) + ' karena freelance Sari lebih besar; pengeluaran naik ' + formatRupiah(nov.expense - oct.expense) + ' karena ada servis motor dan sepatu sekolah Rani. Tingkat tabungan November ' + formatPercent(nov.income ? nov.left / nov.income : 0) + ' vs Oktober ' + formatPercent(oct.income ? oct.left / oct.income : 0) + '.</p></section>' +
    '<section class="grid-2"><article class="card"><h2>Tren 6 Bulan</h2>' + trendBarsSVG(trend, 520, 260) +
    '<p class="legend-inline"><span class="cat-dot" style="background:#2e7d32"></span>Pemasukan &nbsp; <span class="cat-dot" style="background:#c2410c"></span>Pengeluaran</p>' +
    '<p class="muted">Pengeluaran tertinggi di Juli (libur sekolah dan mudik), terendah di Agustus.</p></article>' +
    '<article class="card"><h2>Pengeluaran November per Kategori</h2><div class="donut-wrap">' +
    donutSVG(parts, 200, 'Total', formatRupiah(nov.expense)) + donutLegend(parts, nov.expense) + '</div></article></section>';
}

// ---- Kalkulator ---------------------------------------------------------------

function calc503020(income) {
  const nov = monthTotals('2026-11');
  let needs = 0;
  let wants = 0;
  let saved = 0;
  Object.keys(nov.byCat).forEach((c) => {
    const kind = (LUMBUNG_DATA.categories[c] || {}).kind;
    if (kind === 'need') needs += nov.byCat[c];
    else if (kind === 'want') wants += nov.byCat[c];
    else if (kind === 'save') saved += nov.byCat[c];
  });
  const savedTotal = saved;
  const unallocated = Math.max(0, nov.left);
  const idealNeeds = income * 0.5;
  const idealWants = income * 0.3;
  const idealSave = income * 0.2;
  function verdict(actual, ideal, label) {
    if (actual <= ideal) return label + ' aman: ' + formatRupiah(actual) + ' dari batas ' + formatRupiah(ideal) + '.';
    return label + ' lewat ' + formatRupiah(actual - ideal) + ' dari batas ' + formatRupiah(ideal) + ' — pangkas ' + formatRupiah(actual - ideal) + ' bulan depan.';
  }
  return '<div class="calc-result"><table class="report-table"><thead><tr><th scope="col">Pos</th><th scope="col" class="num">Ideal (50/30/20)</th><th scope="col" class="num">Nyata November</th><th scope="col">Penilaian</th></tr></thead><tbody>' +
    '<tr><th scope="row">Kebutuhan (50%)</th><td class="num">' + formatRupiah(idealNeeds) + '</td><td class="num">' + formatRupiah(needs) + '</td><td>' + verdict(needs, idealNeeds, 'Kebutuhan') + '</td></tr>' +
    '<tr><th scope="row">Keinginan (30%)</th><td class="num">' + formatRupiah(idealWants) + '</td><td class="num">' + formatRupiah(wants) + '</td><td>' + verdict(wants, idealWants, 'Keinginan') + '</td></tr>' +
    '<tr><th scope="row">Tabungan (20%)</th><td class="num">' + formatRupiah(idealSave) + '</td><td class="num">' + formatRupiah(savedTotal) + '</td><td>' + (savedTotal >= idealSave ? 'Tabungan di atas target — pertahankan.' : 'Tabungan kurang ' + formatRupiah(idealSave - savedTotal) + ' dari target.') + '</td></tr>' +
    '</tbody></table><p class="muted">Kolom “Nyata” memakai transaksi November keluarga Prasetyo; “Ditabung” hanya menghitung transfer tabungan yang sudah terjadi (' + formatRupiah(savedTotal) + '). Sisa ' + formatRupiah(unallocated) + ' belum dialokasikan dan rencananya masuk Dana Darurat di akhir bulan. Ubah penghasilan di atas untuk melihat batas idealmu sendiri.</p></div>';
}

function calcDebt(principal, annualRate, monthlyPay) {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyPay <= 0 || principal <= 0) return '<p class="muted">Isi pokok utang dan cicilan per bulan yang lebih dari nol.</p>';
  if (monthlyRate > 0 && monthlyPay <= principal * monthlyRate) {
    return '<p class="warn-text">Cicilan ' + formatRupiah(monthlyPay) + ' tidak cukup menutup bunga bulanannya (' + formatRupiah(principal * monthlyRate) + '). Utang tidak akan pernah lunas — naikkan cicilan di atas ' + formatRupiah(Math.ceil(principal * monthlyRate / 1000) * 1000) + '.</p>';
  }
  let balance = principal;
  let months = 0;
  let totalInterest = 0;
  const rows = [];
  while (balance > 0 && months < 600) {
    const interest = balance * monthlyRate;
    let pay = Math.min(monthlyPay, balance + interest);
    const principalPart = pay - interest;
    balance = balance - principalPart;
    totalInterest += interest;
    months += 1;
    if (months <= 12 || balance <= 0) {
      rows.push('<tr><td>' + months + '</td><td class="num">' + formatRupiah(interest) + '</td><td class="num">' + formatRupiah(principalPart) + '</td><td class="num">' + formatRupiah(Math.max(0, balance)) + '</td></tr>');
    }
  }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const totalPaid = principal + totalInterest;
  return '<div class="calc-result"><p><strong>Lunas dalam ' + months + ' bulan' + (years > 0 ? ' (' + years + ' tahun ' + remMonths + ' bulan)' : '') + '</strong> · total bunga ' + formatRupiah(totalInterest) + ' · total dibayar ' + formatRupiah(totalPaid) + '.</p>' +
    '<p class="muted">Menambah cicilan Rp 100.000 per bulan memangkas bunga jauh lebih besar daripada menabung dengan bunga yang sama — lunasi utang berbunga tinggi dulu.</p>' +
    '<div class="table-wrap"><table class="report-table"><thead><tr><th scope="col">Bulan</th><th scope="col" class="num">Bunga</th><th scope="col" class="num">Pokok</th><th scope="col" class="num">Sisa utang</th></tr></thead><tbody>' + rows.join('') +
    (months > 12 ? '<tr><td colspan="4" class="muted">… tabel dipersingkat, total ' + months + ' bulan.</td></tr>' : '') +
    '</tbody></table></div></div>';
}

function renderCalculators() {
  const nov = monthTotals('2026-11');
  return '<section class="page-head"><div><h1>Kalkulator</h1><p class="muted">Dua alat bantu keluarga Prasetyo: cek pembagian 50/30/20 dan simulasi pelunasan utang. Semua dihitung langsung di perambanmu.</p></div></section>' +
    '<section class="card"><h2>Cek Aturan 50 / 30 / 20</h2>' +
    '<p>Aturan sederhana: 50% penghasilan untuk kebutuhan, 30% untuk keinginan, 20% untuk tabungan dan pelunasan utang. Masukkan penghasilan bulananmu, bandingkan dengan batas idealnya.</p>' +
    '<form class="calc-form" id="form-503020"><label>Penghasilan bulanan (Rp) <input type="number" id="calc-income" min="1000000" step="100000" value="' + nov.income + '" required></label>' +
    '<button type="submit" class="btn">Hitung</button></form><div id="result-503020">' + calc503020(nov.income) + '</div></section>' +
    '<section class="card"><h2>Simulasi Pelunasan Utang</h2>' +
    '<p>Contoh keluarga Prasetyo: sisa cicilan motor Rp 12.750.000 (21 angsuran × Rp 850.000, bunga efektif 11% per tahun). Ubah angkanya untuk utangmu sendiri.</p>' +
    '<form class="calc-form" id="form-debt"><label>Sisa pokok utang (Rp) <input type="number" id="debt-principal" min="100000" step="50000" value="12750000" required></label>' +
    '<label>Bunga per tahun (%) <input type="number" id="debt-rate" min="0" max="60" step="0.5" value="11" required></label>' +
    '<label>Cicilan per bulan (Rp) <input type="number" id="debt-pay" min="10000" step="10000" value="850000" required></label>' +
    '<button type="submit" class="btn">Hitung</button></form><div id="result-debt">' + calcDebt(12750000, 11, 850000) + '</div></section>';
}
