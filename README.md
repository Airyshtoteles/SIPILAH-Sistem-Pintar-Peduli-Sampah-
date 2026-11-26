# 🌿 SIPILAH (Sistem Pintar Peduli Sampah)
> **Game Edukasi Pemilahan Sampah Interaktif Berbasis Web untuk Siswa SD**  
> Proyek Rekayasa Perangkat Lunak (TINFCW243408) — S1 Teknik Informatika, Universitas Kuningan (UNIKU)

---

## 👥 Tim Pengembang (Kelompok 05 - SANY)
1. **Salwa Hamdunah** (Ketua / System Analyst)
2. **Novelia Audy Wijaya** (UI/UX Designer & Frontend Developer)
3. **Yeyen Ai Nurhidayati** (Database Administrator & Data Analyst)
4. **Arie Muhammad Syahrial** (Full-Stack & Game Logic Engineer)

---

## 🏫 Mitra Sekolah Nyata
1. **SDN 1 Ciawilor**  
   *Narahubung:* **Bapak Agung Febriyana, S.Pd.**  
   *Fokus:* Mendukung pembiasaan unggulan sekolah **SEMUTLIS (Sepuluh Menit Peduli Lingkungan Sekitar)**.
2. **SDN 2 Ciawilor**  
   *Narahubung:* **Bapak Tris Mulyo Purnomo, S.Pd.**  
   *Fokus:* Penguatan pembiasaan disiplin membuang & memilah sampah mandiri sejak kelas 1–3 SD (usia 6–8 tahun).

---

## 🚀 Fitur Unggulan Sistem

### 1. Mode Sesi Kelas Estafet ("Main Bareng")
- **Solusi Kendala HP Siswa SD:** Siswa SD dilarang membawa HP ke sekolah. Game dijalankan di laptop guru yang tersambung ke proyektor kelas.
- Siswa maju bergantian (turn-based) bermain selama 60 detik.
- Nilai siswa (skor, akurasi, dan log pemilahan per-sampah) otomatis terdata di sesi kelas yang sedang aktif.

### 2. Gameplay Edukasi 3D Interaktif (Three.js)
- 4 Kategori Tempat Sampah:
  - 🌿 **Organik (Hijau):** Sisa makanan, daun, kulit buah.
  - 🥤 **Anorganik (Kuning):** Plastik, kaleng, bungkus makanan.
  - ⚡ **B3 Berbahaya (Merah):** Baterai bekas, lampu bohlam, termometer raksa, botol obat.
  - 📦 **Daur Ulang (Biru):** Kardus box, kertas buku bekas, koran, karton susu.
- Papan panduan visual 4 kolom di bagian atas layar ramah anak.
- Animasi lempar parabolik 3D dengan visual feedback langsung.

### 3. Dashboard Penilaian Guru
- **Quick Demo Login:** Tombol 1-klik untuk login sebagai Pak Agung (SDN 1) atau Pak Tris (SDN 2).
- **Tab 1 — Sesi Kelas:** Membuat sesi baru (misal: `Kelas 2A - SEMUTLIS`), mengatur sesi aktif, dan mengakhiri sesi.
- **Tab 2 — Rapor Pemahaman Siswa:**
  - Kartu KPI: Total Siswa, Rata-rata Skor, Rata-rata Akurasi (%), dan Sampah Paling Sering Salah Dipilah.
  - Rekap nilai per siswa dengan predikat (*Sangat Paham* / *Cukup Paham* / *Perlu Bimbingan*).
  - Modal Rincian Log Jawaban Siswa per butir sampah.
  - **Ekspor Rapor ke CSV** untuk dokumentasi penilaian guru.
- **Tab 3 — Manajemen Bank Sampah (CRUD):** Tambah, edit, dan hapus 16 item sampah 3D beserta narasi edukasi.

### 4. Sertifikat Digital Otomatis (Canvas 2D)
- Menghasilkan sertifikat penghargaan beresolusi tinggi dengan:
  - Pengesahan resmi Kemitraan SDN 1 & SDN 2 Ciawilor didukung Kelompok 05 - SANY (UNIKU).
  - Foto muka siswa (via webcam kamera laptop guru atau unggah file).
  - Stempel emas resmi SEMUTLIS dan tanda tangan ganda kedua narahubung sekolah mitra.
  - Unduh langsung dalam format PNG.

---

## 🌐 Akses & Hosting (Live Testing)

Aplikasi dibangun murni menggunakan **Vanilla HTML5, CSS3, JavaScript, dan Three.js r128** tanpa memerlukan kompilasi rumit, sehingga dapat diakses langsung melalui:

### 1. GitHub Pages (Otomatis via GitHub Actions)
Aplikasi dapat diakses publik di:
🔗 **`https://novelaudy10-del.github.io/SIPILAH-Sistem-Pintar-Peduli-Sampah-/`**

> **Cara mengaktifkan di GitHub:**
> 1. Buka repositori di GitHub ➡ Masuk ke tab **Settings**.
> 2. Di menu samping kiri, klik **Pages**.
> 3. Pada bagian **Build and deployment > Source**, pilih **GitHub Actions**.
> 4. Website akan otomatis online dalam 1–2 menit!

### 2. Vercel (1-Click Deployment)
Aplikasi sudah dilengkapi file konfigurasi [vercel.json](vercel.json).
Cukup hubungkan repositori ini ke akun Vercel untuk mendapatkan domain cepat seperti:
🔗 **`https://sipilah.vercel.app`**

### 3. Penggunaan Offline / Lokal di Kelas
Guru dapat menjalankan game langsung tanpa internet:
- Klik ganda file `Buka_Game.bat`, atau
- Buka file `index.html` langsung di peramban Chrome/Edge/Firefox.

---

## 🗄️ Dokumentasi Basis Data & RPL

Skema basis data telah dinormalisasi hingga tahap **3NF (Third Normal Form)**:
- **File Skrip SQL MySQL:** [`database/db_pilah_sampah.sql`](database/db_pilah_sampah.sql)
- **Dokumen Perancangan Lengkap (ERD, Normalisasi, Kamus Data, CRUD Matrix):** [`DOCS_PERANCANGAN_TAHAP1.md`](DOCS_PERANCANGAN_TAHAP1.md)

---

## 📄 Lisensi
Dikembangkan oleh **Kelompok 05 - SANY** untuk Program Studi S1 Teknik Informatika, Fakultas Ilmu Komputer, Universitas Kuningan (UNIKU) dalam rangka kemitraan Pengabdian & Rekayasa Perangkat Lunak bersama SDN 1 Ciawilor & SDN 2 Ciawilor.
