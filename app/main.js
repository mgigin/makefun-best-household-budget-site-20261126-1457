// Lumbung — router hash dan pengikat kontrol.
// Rute: #/ (Dasbor), #/transaksi, #/anggaran, #/tagihan, #/tujuan,
// #/laporan, #/kalkulator. Setiap pergantian rute merender ulang halaman dari
// data + state, lalu mengikat kontrol halaman itu.
'use strict';

const ROUTES = {
  '/': { render: renderDashboard, title: 'Dasbor' },
  '/transaksi': { render: renderTransactions, title: 'Transaksi' },
  '/anggaran': { render: renderBudgets, title: 'Anggaran' },
  '/tagihan': { render: renderBills, title: 'Tagihan' },
  '/tujuan': { render: renderGoals, title: 'Tujuan' },
  '/laporan': { render: renderReports, title: 'Laporan' },
  '/kalkulator': { render: renderCalculators, title: 'Kalkulator' },
};

function currentRoute() {
  const hash = window.location.hash || '#/';
  const path = hash.slice(1) || '/';
  return ROUTES[path] ? path : '/';
}

function render() {
  const path = currentRoute();
  const view = document.getElementById('view');
  view.innerHTML = ROUTES[path].render();
  document.title = 'Lumbung — ' + ROUTES[path].title + ' | Anggaran Keluarga Prasetyo';
  document.querySelectorAll('.nav-link').forEach((a) => {
    const active = a.getAttribute('href') === '#' + path;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  bindPage(path);
  const focusTarget = document.querySelector('#view h1');
  if (focusTarget) focusTarget.setAttribute('tabindex', '-1');
}

function bindPage(path) {
  // Pemilih bulan (Dasbor, Transaksi, Anggaran).
  document.querySelectorAll('[data-month]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.month = btn.getAttribute('data-month');
      saveState();
      render();
    });
  });

  if (path === '/transaksi') bindTransactions();
  if (path === '/tagihan') bindBills();
  if (path === '/tujuan') bindGoals();
  if (path === '/kalkulator') bindCalculators();
}

function bindTransactions() {
  const form = document.getElementById('tx-form');
  const msg = document.getElementById('form-msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('f-date').value;
    const desc = document.getElementById('f-desc').value.trim();
    const cat = document.getElementById('f-cat').value;
    const type = document.getElementById('f-type').value;
    const amount = Math.round(Number(document.getElementById('f-amount').value));
    if (!date || !desc || !amount || amount <= 0) {
      msg.textContent = 'Isi tanggal, keterangan, dan jumlah yang benar.';
      return;
    }
    const value = type === 'in' ? amount : -amount;
    if (editingId) {
      state.edited[editingId] = { date: date, desc: desc, cat: cat, amount: value };
      const added = state.added.find((t) => t.id === editingId);
      if (added) { added.date = date; added.desc = desc; added.cat = cat; added.amount = value; }
      msg.textContent = 'Transaksi diubah.';
      editingId = null;
    } else {
      state.added.push({ id: 'u' + Date.now(), date: date, desc: desc, cat: cat, amount: value });
      msg.textContent = 'Transaksi ditambahkan.';
    }
    saveState();
    render();
    const after = document.getElementById('form-msg');
    if (after) after.textContent = msg.textContent;
  });

  const cancel = document.getElementById('cancel-edit');
  if (cancel) cancel.addEventListener('click', () => { editingId = null; render(); });

  document.getElementById('f-q').addEventListener('input', (e) => { txFilter.q = e.target.value; refreshTxTable(); });
  document.getElementById('f-catfilter').addEventListener('change', (e) => { txFilter.cat = e.target.value; render(); });
  document.getElementById('f-typefilter').addEventListener('change', (e) => { txFilter.type = e.target.value; render(); });
  document.getElementById('f-sort').addEventListener('change', (e) => { txFilter.sort = e.target.value; render(); });

  document.getElementById('export-csv').addEventListener('click', () => {
    const rows = filteredTx();
    const lines = ['Tanggal,Keterangan,Kategori,Jumlah (Rp)'];
    rows.forEach((t) => {
      lines.push([t.date, '"' + t.desc.replace(/"/g, '""') + '"', '"' + t.cat + '"', t.amount].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lumbung-transaksi-' + state.month + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  document.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => { editingId = btn.getAttribute('data-edit'); render(); window.scrollTo(0, 0); });
  });
  document.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del');
      const t = allTransactions().find((x) => x.id === id);
      if (!t) return;
      if (!window.confirm('Hapus transaksi "' + t.desc + '" (' + formatRupiah(Math.abs(t.amount)) + ')?')) return;
      if (state.added.some((x) => x.id === id)) state.added = state.added.filter((x) => x.id !== id);
      else state.deleted.push(id);
      delete state.edited[id];
      if (editingId === id) editingId = null;
      saveState();
      render();
    });
  });
}

// Perbarui hanya tabel + ringkasan saat mengetik di kotak cari (tanpa
// menggerakkan fokus dari kotak pencari).
function refreshTxTable() {
  const rows = filteredTx();
  const tbody = document.querySelector('.tx-table tbody');
  if (tbody) tbody.innerHTML = txRowsHtml(rows);
  const summary = document.querySelector('.filter-row + p');
  if (summary) {
    const totalIn = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalOut = rows.filter((t) => t.amount < 0).reduce((s, t) => s + -t.amount, 0);
    summary.textContent = rows.length + ' transaksi · pemasukan ' + formatRupiah(totalIn) + ' · pengeluaran ' + formatRupiah(totalOut);
  }
}

function bindBills() {
  document.querySelectorAll('[data-bill]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-bill');
      const bill = LUMBUNG_DATA.bills.find((b) => b.id === id);
      state.billsPaid[id] = !billPaid(bill);
      saveState();
      render();
    });
  });
}

function bindGoals() {
  document.querySelectorAll('[data-goal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-goal');
      const amount = Number(btn.getAttribute('data-amount'));
      state.goalExtra[id] = (state.goalExtra[id] || 0) + amount;
      saveState();
      render();
    });
  });
  document.querySelectorAll('[data-goal-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = form.getAttribute('data-goal-form');
      const amount = Math.round(Number(form.querySelector('input').value));
      if (!amount || amount <= 0) return;
      state.goalExtra[id] = (state.goalExtra[id] || 0) + amount;
      saveState();
      render();
    });
  });
}

function bindCalculators() {
  document.getElementById('form-503020').addEventListener('submit', (e) => {
    e.preventDefault();
    const income = Math.round(Number(document.getElementById('calc-income').value));
    if (!income || income <= 0) return;
    document.getElementById('result-503020').innerHTML = calc503020(income);
  });
  document.getElementById('form-debt').addEventListener('submit', (e) => {
    e.preventDefault();
    const principal = Math.round(Number(document.getElementById('debt-principal').value));
    const rate = Number(document.getElementById('debt-rate').value);
    const pay = Math.round(Number(document.getElementById('debt-pay').value));
    document.getElementById('result-debt').innerHTML = calcDebt(principal, rate, pay);
  });
}

window.addEventListener('hashchange', render);
document.addEventListener('DOMContentLoaded', render);
