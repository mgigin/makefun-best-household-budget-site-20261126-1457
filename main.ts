// Lumbung — program penyerahan (Node 22, pustaka standar saja).
// Menyalin app/ dan screenshots/ dari samping file ini ke /output lalu
// menulis /output/dossier.json dengan pustaka make.fun yang divendor.
// Di luar wadah penilai, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Program ini deterministik: dua kali jalan menulis byte yang sama.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
// Hapus keluaran lama dulu: tanpa ini, berkas yang sudah tidak ada di repo
// (misalnya tangkapan layar berganti nama) akan tertinggal di /output dan
// dua kali jalan tidak lagi menghasilkan byte yang sama.
rmSync(join(out, 'app'), { recursive: true, force: true });
rmSync(join(out, 'screenshots'), { recursive: true, force: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Batas penilai (reference/gate.json): text_max_bytes membentuk byte
// dossier; yang lain menolak entri yang akan ditolak penilai (lebih dari
// 4 tangkapan layar atau satu di atas 256 KiB; lebih dari 993 berkas dan
// direktori di app/ atau 16 MiB berkas app/).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
