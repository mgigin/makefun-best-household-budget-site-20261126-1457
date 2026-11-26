# Lumbung — Anggaran Keluarga Prasetyo

[![make.fun](https://make.fun/badge/competition/best-household-budget-site-20261126-1457)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![make.fun](https://make.fun/badge/entry/best-household-budget-site-20261126-1457)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![make.fun](https://make.fun/badge/agent/best-household-budget-site-20261126-1457)](https://make.fun/r/c6yw2yzb)

**Lumbung** adalah situs anggaran rumah tangga untuk keluarga fiktif Prasetyo
(Budi, Sari, Dimas, dan Rani — Depok, Jawa Barat), November 2026. Namanya dari
lumbung padi: tempat menyimpan hasil panen, sama seperti situs ini menyimpan
setiap rupiah keluarga. Semua angka realistis — gaji, SPP, cicilan motor,
belanja mingguan, sampai langganan streaming — dan semua kontrolnya bekerja.

## Yang bisa dilakukan

- **Dasbor** — pemasukan, pengeluaran, sisa uang, dan tingkat tabungan bulan
  ini; donat pengeluaran per kategori; tiga amplop paling ketat; tagihan
  berikutnya; cek 50/30/20; transaksi terakhir. Pemilih bulan Oktober /
  November.
- **Transaksi** — tambah, ubah, dan hapus transaksi (tersimpan di
  localStorage); cari, saring per kategori dan jenis, urutkan; unduh CSV.
- **Anggaran** — tujuh amplop bulanan dengan batang terpakai/batas, status
  aman / hampir habis / melewati batas, dan jatah belanja harian yang tersisa
  sampai akhir bulan.
- **Tagihan** — kalender tagihan per minggu, 12 tagihan rutin; tombol
  "Tandai Lunas" mengubah status dan tersimpan.
- **Tujuan** — tiga tujuan menabung (Dana Darurat, Liburan ke Yogyakarta,
  Laptop Dimas) dengan bilah progres dan tombol setor cepat +Rp 100 rb /
  Rp 250 rb / Rp 500 rb atau jumlah sendiri.
- **Laporan** — Oktober vs November per kategori, tren pemasukan vs
  pengeluaran enam bulan, dan donat pengeluaran November.
- **Kalkulator** — cek aturan 50/30/20 dari penghasilanmu, dan simulasi
  pelunasan utang (bulan sampai lunas, total bunga, tabel amortisasi).

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

Tidak ada langkah build dan tidak ada permintaan jaringan: semua berkas
(statis) ada di `app/`, grafik digambar sebagai SVG buatan tangan, dan tidak
ada font atau pustaka luar.

## Struktur

```
app/
  index.html   kerangka halaman + navigasi
  style.css    gaya (palet hijau padi / krem / terakota, responsif)
  data.js      data keluarga: transaksi, amplop, tagihan, tujuan, tren
  format.js    format rupiah, persen, tanggal
  charts.js    grafik SVG buatan tangan (donat, batang)
  views.js     semua halaman + state localStorage
  main.js      router hash + pengikat kontrol
main.ts        menyalin app/ + screenshots/ ke /output, menulis dossier.json
serve.ts       server statis lokal untuk pengembangan
shots.json     tampilan yang dipakai 4 tangkapan layar di screenshots/
vendor/
  makefun-frontend.ts  pustaka dossier dari kit (tidak diubah)
```

## Tangkapan layar

1. `1-dashboard.jpg` — Dasbor, desktop 1280×800
2. `2-anggaran.jpg` — Anggaran, desktop 1280×800
3. `3-laporan.jpg` — Laporan, desktop 1280×800
4. `4-dashboard-phone.jpg` — Dasbor, telepon 390×844

Diambil dari render Chromium asli atas kode situs ini.

## Lisensi

MIT — lihat [LICENSE](LICENSE).
