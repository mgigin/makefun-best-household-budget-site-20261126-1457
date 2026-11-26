// Lumbung — data keluarga Prasetyo, November 2026.
// Semua angka fiktif tapi realistis untuk rumah tangga 4 orang di Depok.
// Pemasukan dan pengeluaran dicatat per transaksi; bulan Oktober disertakan
// agar pemilih bulan dan halaman Laporan punya perbandingan yang nyata.
'use strict';

const LUMBUNG_DATA = {
  family: {
    name: 'Keluarga Prasetyo',
    members: 'Budi (ayah) · Sari (ibu) · Dimas (13) · Rani (9)',
    city: 'Depok, Jawa Barat',
    monthLabel: 'November 2026',
    asOf: 'Data sampai 26 November 2026',
  },

  // Kategori pengeluaran + warna yang dipakai di semua grafik.
  categories: {
    'Belanja Harian': { color: '#2e7d32', kind: 'need' },
    'Makanan & Minuman': { color: '#c2410c', kind: 'want' },
    Transportasi: { color: '#1565c0', kind: 'need' },
    'Rumah & Listrik': { color: '#6d4c41', kind: 'need' },
    Pendidikan: { color: '#7b1fa2', kind: 'need' },
    Kesehatan: { color: '#c62828', kind: 'need' },
    Hiburan: { color: '#ef6c00', kind: 'want' },
    Tabungan: { color: '#00838f', kind: 'save' },
    Lainnya: { color: '#78909c', kind: 'want' },
  },

  // Amplop anggaran bulanan (batas belanja per kategori).
  budgets: {
    'Belanja Harian': 3200000,
    'Makanan & Minuman': 900000,
    Transportasi: 1800000,
    'Rumah & Listrik': 1500000,
    Pendidikan: 2200000,
    Kesehatan: 800000,
    Hiburan: 500000,
  },

  // Target tabungan bulanan (bukan amplop belanja).
  savingsTarget: 2500000,

  // t: transaksi. amount > 0 = pemasukan, < 0 = pengeluaran (rupiah).
  transactions: [
    // ---- November 2026 ----
    { id: 'n01', date: '2026-11-01', desc: 'Belanja mingguan Super Indo', cat: 'Belanja Harian', amount: -486500 },
    { id: 'n02', date: '2026-11-01', desc: 'Token listrik PLN', cat: 'Rumah & Listrik', amount: -350000 },
    { id: 'n03', date: '2026-11-02', desc: 'Bensin Pertalite motor', cat: 'Transportasi', amount: -150000 },
    { id: 'n04', date: '2026-11-02', desc: 'Makan siang keluarga Warteg Bahari', cat: 'Makanan & Minuman', amount: -87000 },
    { id: 'n05', date: '2026-11-03', desc: 'SPP Dimas November', cat: 'Pendidikan', amount: -650000 },
    { id: 'n06', date: '2026-11-03', desc: 'SPP Rani November', cat: 'Pendidikan', amount: -450000 },
    { id: 'n07', date: '2026-11-03', desc: 'Laundry kiloan', cat: 'Rumah & Listrik', amount: -85000 },
    { id: 'n08', date: '2026-11-04', desc: 'Langganan internet IndiHome', cat: 'Rumah & Listrik', amount: -389000 },
    { id: 'n09', date: '2026-11-05', desc: 'Gaji Budi Prasetyo', cat: 'Pemasukan', amount: 12000000 },
    { id: 'n10', date: '2026-11-05', desc: 'Gaji Sari Prasetyo', cat: 'Pemasukan', amount: 5000000 },
    { id: 'n11', date: '2026-11-05', desc: 'BPJS Kesehatan keluarga', cat: 'Kesehatan', amount: -280000 },
    { id: 'n12', date: '2026-11-06', desc: 'Belanja pasar tradisional', cat: 'Belanja Harian', amount: -212000 },
    { id: 'n13', date: '2026-11-06', desc: 'Jajan anak sekolah', cat: 'Makanan & Minuman', amount: -40000 },
    { id: 'n14', date: '2026-11-07', desc: 'Ojek online ke kantor', cat: 'Transportasi', amount: -24000 },
    { id: 'n15', date: '2026-11-07', desc: 'Nonton bioskop keluarga', cat: 'Hiburan', amount: -180000 },
    { id: 'n16', date: '2026-11-08', desc: 'Belanja mingguan Super Indo', cat: 'Belanja Harian', amount: -512000 },
    { id: 'n17', date: '2026-11-09', desc: 'Buku pelajaran Dimas', cat: 'Pendidikan', amount: -185000 },
    { id: 'n18', date: '2026-11-10', desc: 'Servis motor di bengkel', cat: 'Transportasi', amount: -275000 },
    { id: 'n19', date: '2026-11-10', desc: 'Sayur dan buah pasar', cat: 'Belanja Harian', amount: -156000 },
    { id: 'n20', date: '2026-11-11', desc: 'Kopi dan sarapan', cat: 'Makanan & Minuman', amount: -63000 },
    { id: 'n21', date: '2026-11-12', desc: 'Tagihan air PDAM', cat: 'Rumah & Listrik', amount: -145000 },
    { id: 'n22', date: '2026-11-13', desc: 'Obat dan vitamin apotek', cat: 'Kesehatan', amount: -128000 },
    { id: 'n23', date: '2026-11-14', desc: 'Freelance desain logo', cat: 'Pemasukan', amount: 1500000 },
    { id: 'n24', date: '2026-11-14', desc: 'Makan malam Ayam Geprek', cat: 'Makanan & Minuman', amount: -96000 },
    { id: 'n25', date: '2026-11-15', desc: 'Belanja mingguan Super Indo', cat: 'Belanja Harian', amount: -498000 },
    { id: 'n26', date: '2026-11-15', desc: 'Cicilan motor Honda', cat: 'Transportasi', amount: -850000 },
    { id: 'n27', date: '2026-11-16', desc: 'Les piano Rani', cat: 'Pendidikan', amount: -300000 },
    { id: 'n28', date: '2026-11-17', desc: 'Parkir dan tol', cat: 'Transportasi', amount: -45000 },
    { id: 'n29', date: '2026-11-17', desc: 'Alat tulis sekolah', cat: 'Pendidikan', amount: -74000 },
    { id: 'n30', date: '2026-11-18', desc: 'Langganan Netflix', cat: 'Hiburan', amount: -186000 },
    { id: 'n31', date: '2026-11-19', desc: 'Belanja pasar tradisional', cat: 'Belanja Harian', amount: -198000 },
    { id: 'n32', date: '2026-11-20', desc: 'Sepatu sekolah Rani', cat: 'Pendidikan', amount: -320000 },
    { id: 'n33', date: '2026-11-20', desc: 'Es krim dan camilan', cat: 'Makanan & Minuman', amount: -58000 },
    { id: 'n34', date: '2026-11-21', desc: 'Makan siang kantor', cat: 'Makanan & Minuman', amount: -54000 },
    { id: 'n35', date: '2026-11-22', desc: 'Belanja mingguan Super Indo', cat: 'Belanja Harian', amount: -531000 },
    { id: 'n36', date: '2026-11-22', desc: 'Donasi masjid', cat: 'Lainnya', amount: -100000 },
    { id: 'n37', date: '2026-11-23', desc: 'Periksa gigi Dimas', cat: 'Kesehatan', amount: -250000 },
    { id: 'n38', date: '2026-11-24', desc: 'Bensin Pertalite motor', cat: 'Transportasi', amount: -150000 },
    { id: 'n39', date: '2026-11-24', desc: 'Top up e-money', cat: 'Transportasi', amount: -100000 },
    { id: 'n40', date: '2026-11-25', desc: 'Jual barang bekas', cat: 'Pemasukan', amount: 250000 },
    { id: 'n41', date: '2026-11-25', desc: 'Perlengkapan rumah tangga', cat: 'Rumah & Listrik', amount: -210000 },
    { id: 'n42', date: '2026-11-26', desc: 'Makan malam keluarga', cat: 'Makanan & Minuman', amount: -142000 },
    { id: 'n43', date: '2026-11-26', desc: 'Belanja harian warung', cat: 'Belanja Harian', amount: -92000 },
    { id: 'n44', date: '2026-11-26', desc: 'Transfer Dana Darurat', cat: 'Tabungan', amount: -1000000 },

    // ---- Oktober 2026 (untuk perbandingan) ----
    { id: 'o01', date: '2026-10-01', desc: 'Belanja mingguan Super Indo', cat: 'Belanja Harian', amount: -472000 },
    { id: 'o02', date: '2026-10-02', desc: 'Token listrik PLN', cat: 'Rumah & Listrik', amount: -340000 },
    { id: 'o03', date: '2026-10-03', desc: 'SPP Dimas Oktober', cat: 'Pendidikan', amount: -650000 },
    { id: 'o04', date: '2026-10-03', desc: 'SPP Rani Oktober', cat: 'Pendidikan', amount: -450000 },
    { id: 'o05', date: '2026-10-04', desc: 'Langganan internet IndiHome', cat: 'Rumah & Listrik', amount: -389000 },
    { id: 'o06', date: '2026-10-05', desc: 'Gaji Budi Prasetyo', cat: 'Pemasukan', amount: 12000000 },
    { id: 'o07', date: '2026-10-05', desc: 'Gaji Sari Prasetyo', cat: 'Pemasukan', amount: 5000000 },
    { id: 'o08', date: '2026-10-05', desc: 'BPJS Kesehatan keluarga', cat: 'Kesehatan', amount: -280000 },
    { id: 'o09', date: '2026-10-08', desc: 'Belanja mingguan Super Indo', cat: 'Belanja Harian', amount: -498000 },
    { id: 'o10', date: '2026-10-10', desc: 'Bensin Pertalite motor', cat: 'Transportasi', amount: -150000 },
    { id: 'o11', date: '2026-10-12', desc: 'Tagihan air PDAM', cat: 'Rumah & Listrik', amount: -138000 },
    { id: 'o12', date: '2026-10-15', desc: 'Belanja mingguan Super Indo', cat: 'Belanja Harian', amount: -505000 },
    { id: 'o13', date: '2026-10-15', desc: 'Cicilan motor Honda', cat: 'Transportasi', amount: -850000 },
    { id: 'o14', date: '2026-10-16', desc: 'Les piano Rani', cat: 'Pendidikan', amount: -300000 },
    { id: 'o15', date: '2026-10-18', desc: 'Freelance desain brosur', cat: 'Pemasukan', amount: 900000 },
    { id: 'o16', date: '2026-10-20', desc: 'Makan di luar (3 kali)', cat: 'Makanan & Minuman', amount: -310000 },
    { id: 'o17', date: '2026-10-22', desc: 'Belanja mingguan Super Indo', cat: 'Belanja Harian', amount: -461000 },
    { id: 'o18', date: '2026-10-24', desc: 'Nonton bioskop dan langganan', cat: 'Hiburan', amount: -220000 },
    { id: 'o19', date: '2026-10-26', desc: 'Bensin Pertalite motor', cat: 'Transportasi', amount: -150000 },
    { id: 'o20', date: '2026-10-28', desc: 'Obat dan vitamin apotek', cat: 'Kesehatan', amount: -190000 },
    { id: 'o21', date: '2026-10-29', desc: 'Belanja pasar tradisional', cat: 'Belanja Harian', amount: -187000 },
    { id: 'o22', date: '2026-10-30', desc: 'Transfer Dana Darurat', cat: 'Tabungan', amount: -1000000 },
  ],

  // Tagihan rutin bulanan. paid = sudah lunas bulan ini.
  bills: [
    { id: 'b01', name: 'Listrik PLN (token)', due: 1, amount: 350000, paid: true, note: 'Token prabayar' },
    { id: 'b02', name: 'SPP Dimas', due: 3, amount: 650000, paid: true, note: 'Sekolah Menengah Pertama' },
    { id: 'b03', name: 'SPP Rani', due: 3, amount: 450000, paid: true, note: 'Sekolah Dasar' },
    { id: 'b04', name: 'Internet IndiHome', due: 4, amount: 389000, paid: true, note: '50 Mbps' },
    { id: 'b05', name: 'BPJS Kesehatan', due: 5, amount: 280000, paid: true, note: '4 anggota keluarga' },
    { id: 'b06', name: 'Air PDAM', due: 12, amount: 145000, paid: true, note: 'Pemakaian Oktober' },
    { id: 'b07', name: 'Cicilan motor Honda', due: 15, amount: 850000, paid: true, note: 'Angsuran ke-14 dari 35' },
    { id: 'b08', name: 'Netflix', due: 18, amount: 186000, paid: true, note: 'Paket Premium' },
    { id: 'b09', name: 'Spotify Keluarga', due: 27, amount: 55000, paid: false, note: 'Paket Family' },
    { id: 'b10', name: 'Asuransi jiwa Budi', due: 28, amount: 425000, paid: false, note: 'Premi bulanan' },
    { id: 'b11', name: 'Galon air (langganan)', due: 29, amount: 60000, paid: false, note: '4 galon per minggu' },
    { id: 'b12', name: 'Iuran RT/RW', due: 30, amount: 75000, paid: false, note: 'Keamanan dan kebersihan' },
  ],

  // Tujuan menabung.
  goals: [
    { id: 'g01', name: 'Dana Darurat', desc: 'Cadangan 6 bulan pengeluaran pokok, disimpan di rekening terpisah.', target: 12000000, saved: 7250000, deadline: 'Juni 2027' },
    { id: 'g02', name: 'Liburan Keluarga ke Yogyakarta', desc: 'Tiket kereta, hotel 3 malam, dan wisata untuk 4 orang.', target: 8000000, saved: 3400000, deadline: 'Juni 2027' },
    { id: 'g03', name: 'Laptop Baru Dimas', desc: 'Laptop untuk belajar coding dan tugas sekolah Dimas.', target: 6500000, saved: 2150000, deadline: 'Maret 2027' },
  ],

  // Ringkasan Juni–Oktober (untuk grafik tren 6 bulan di Laporan).
  trend: [
    { month: 'Jun 2026', income: 17100000, expense: 14200000 },
    { month: 'Jul 2026', income: 17400000, expense: 15800000 },
    { month: 'Agu 2026', income: 17000000, expense: 13900000 },
    { month: 'Sep 2026', income: 18500000, expense: 15100000 },
    { month: 'Okt 2026', income: 17900000, expense: 0 }, // dihitung dari transaksi
    { month: 'Nov 2026', income: 18750000, expense: 0 }, // dihitung dari transaksi
  ],
};
