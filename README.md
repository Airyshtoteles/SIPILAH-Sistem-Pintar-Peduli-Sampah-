# 🌿 SIPILAH — Sistem Pintar Peduli Sampah
> **Game Edukasi Pemilahan Sampah 3D Interaktif Berbasis Web untuk Siswa Sekolah Dasar**  
> Proyek Rekayasa Perangkat Lunak (TINFCW243408) — Program Studi S1 Teknik Informatika, Fakultas Ilmu Komputer, Universitas Kuningan (UNIKU)  
> Bekerja sama dengan Mitra Sekolah: **SDN 1 Ciawilor** & **SDN 2 Ciawilor**, Kabupaten Kuningan.

---

## 📌 Latar Belakang & Masalah Riil

Pemilahan sampah sejak dini merupakan fondasi penting dalam membentuk karakter peduli lingkungan hidup. Berdasarkan hasil observasi dan wawancara lapangan kami di dua sekolah mitra:

1. **SDN 1 Ciawilor (Mitra Utama):** Memiliki program pembiasaan unggulan bernama **SEMUTLIS (Sepuluh Menit Peduli Lingkungan Sekitar)** yang dipandu oleh **Bapak Agung Febriyana, S.Pd.** Siswa rutin membersihkan ruang kelas dan halaman sebelum pelajaran dimulai, namun masih sering kesulitan membedakan sampah yang dapat membusuk (organik) dan sampah pabrik (anorganik).
2. **SDN 2 Ciawilor (Mitra Pendukung):** Dipandu oleh **Bapak Tris Mulyo Purnomo, S.Pd.**, yang berfokus pada pembiasaan disiplin mandiri untuk siswa fase awal (Kelas 1, 2, dan 3 SD; rentang usia 6–9 tahun).

### 💡 Tantangan Khusus & Solusi yang Kami Rancang:
* **Larangan HP bagi Siswa SD:** Siswa sekolah dasar dilarang membawa *smartphone* ke sekolah. Oleh karena itu, game ini **tidak dirancang untuk HP pribadi siswa**, melainkan dijalankan secara **estafet (*turn-based*) di satu laptop inventaris guru yang terhubung ke proyektor kelas**.
* **Perlindungan Privasi Anak:** Sesuai etika perlindungan data pribadi anak, permainan dirancang **tanpa formulir login siswa, tanpa pengumpulan nama lengkap, dan tanpa kamera/foto siswa**. Siswa bermain dengan gembira, dan rekapitulasi penilaian kelas tercatat otomatis bagi guru.
* **Perangkat Rendah Daya:** Komputer inventaris sekolah umumnya berspesifikasi standar (Intel Celeron / RAM 4GB tanpa VGA diskret). Kami memilih arsitektur **Three.js WebGL Ringan (~600 KB runtime)** daripada engine game berat seperti Godot WebAssembly (~40 MB) agar game dapat dimuat dalam waktu kurang dari 2 detik dan berjalan mulus 60 FPS.

---

## 🎮 Fitur Utama Permainan

### 1. Arena Pemilahan Sampah 3D Interaktif
* **2 Kategori Tong Bermain:** Siswa berfokus memilah ke dua kategori utama yang paling sering ditemui sehari-hari:
  * 🟢 **Tong Hijau (Organik):** Sisa buah apel, kulit pisang, daun kering, sisa roti.
  * 🟡 **Tong Kuning (Anorganik):** Botol plastik minuman, kaleng soda, bebek mainan, kemasan kardus, sedotan.
* **Animasi Fisika Parabola:** Objek sampah di atas meja terangkat saat diklik/disentuh, lalu meluncur masuk ke tong sampah dengan efek visual dan audio ramah anak.
* **Umpan Balik Edukasi Cerdas:** Jika siswa keliru memasukkan sampah, permainan tidak sekadar menyalahkan, melainkan memunculkan jendela dialog singkat yang menjelaskan alasan ilmiahnya (misal: *"Botol plastik butuh 450 tahun untuk terurai di tanah! Masukkan ke Tong Kuning"*).

### 2. Tiga Tingkat Kesulitan (Level Permainan)
* **Level 1: Pemula (Mudah):** Durasi santai 60 detik dengan jenis sampah harian paling mendasar (cocok untuk kelas 1 SD).
* **Level 2: Terampil (Sedang):** Durasi 45 detik dengan kombinasi sampah organik dan anorganik yang bervariasi (cocok untuk kelas 2 SD).
* **Level 3: Juara Lingkungan (Tantangan):** Durasi cepat 30 detik untuk melatih ketangkasan dan fokus memilah.

### 3. Kotak Keselamatan Khusus Sampah B3 (Panduan Guru)
Sampah kategori **B3 (Bahan Berbahaya dan Beracun)** seperti baterai bekas, pecahan bohlam, termometer raksa, dan sisa bahan kimia **sengaja tidak dimainkan di arena 3D** agar anak-anak tidak terbiasa menyentuh benda berbahaya di dunia nyata. Sebagai gantinya, modul B3 disajikan sebagai **Pesan Keselamatan Khusus Guru** di Layar Panduan untuk dipaparkan secara verbal di kelas.

### 4. Dashboard Penilaian Guru & Bank Sampah (CRUD)
* Guru dapat melihat rekapitulasi ronde permainan kelas, rata-rata skor, akurasi pemilahan, dan log detail jawaban.
* Guru dapat menambah item sampah baru, mengganti model 3D, menyesuaikan pesan edukasi, serta mengatur pada level berapa saja item tersebut muncul.
* Dilengkapi tombol pembersih data riwayat sesi agar memori penyimpanan tetap ringan.

---

## 🛠️ Arsitektur Teknologi

SIPILAH dibangun dengan mengutamakan performa, kemudahan aksesibilitas, dan tanpa ketergantungan instalasi yang rumit:

```
[ Antarmuka Browser ]  <--->  [ Three.js r128 Engine ]  <--->  [ Assets 3D (.glb) ]
        |
        v
[ Client Relational Store ]  <--->  [ REST API / Vercel ]  <--->  [ Supabase Cloud (PostgreSQL 15) ]
 (LocalStorage Fallback)
```

* **Core Frontend:** Vanilla HTML5 Semantic, Modern CSS3 (CSS Variables, Flexbox, CSS Grid), JavaScript ES6+ Modular.
* **3D Graphics Engine:** [Three.js r128](https://threejs.org/) (WebGL) dengan format model standar industri glTF/GLB yang telah kami kompresi secara optimal.
* **Basis Data Relasional & Cloud:**
  * **Offline/Lokal:** In-memory relational store berbasis LocalStorage (memenuhi kaidah 3NF) agar game tetap berfungsi saat jaringan sekolah padam.
  * **Online/Cloud:** [Supabase](https://supabase.com/) berbasis PostgreSQL 15, dilengkapi *Row Level Security (RLS)* terpusat.
* **Hosting & Serverless:** [Vercel](https://vercel.com/) (dengan serverless endpoint `/api/config` untuk menjembatani Environment Variables) dan mirror di [GitHub Pages](https://pages.github.com/).

---

## 🚀 Akses & Uji Coba Langsung (Live Demo)

Aplikasi telah terpasang dan siap digunakan langsung melalui peramban:

* 🌐 **Tautan Live Web App (Vercel):**  
  👉 [https://sany-sipilah.vercel.app](https://sany-sipilah.vercel.app) *(atau https://sipilah.vercel.app)*
* 📂 **Mirror GitHub Pages:**  
  👉 [https://novelaudy10-del.github.io/SIPILAH-Sistem-Pintar-Peduli-Sampah-/](https://novelaudy10-del.github.io/SIPILAH-Sistem-Pintar-Peduli-Sampah-/)

### Menjalankan di Komputer Lokal / Offline di Sekolah:
1. Unduh atau *clone* repositori ini:
   ```bash
   git clone https://github.com/novelaudy10-del/SIPILAH-Sistem-Pintar-Peduli-Sampah-.git
   ```
2. Masuk ke direktori proyek dan buka game:
   * **Pengguna Windows:** Cukup klik ganda berkas `Buka_Game.bat`.
   * **Semua OS:** Buka berkas `index.html` langsung menggunakan browser apa pun (Google Chrome, Microsoft Edge, Mozilla Firefox).

---

## 📁 Struktur Berkas Repositori

```text
├── assets/                  # Berkas aset 3D (model .glb sampah & tong), tekstur, dan ikon
├── css/
│   └── style.css            # Gaya visual responsif bertema ramah anak sekolah dasar
├── js/
│   ├── app.js               # Inisialisasi utama aplikasi & pengatur alur layar (SPA)
│   ├── dbStore.js           # Mesin relasional lokal 3NF (6 tabel baku sistem)
│   ├── cloudDB.js           # Konektor sinkronisasi real-time ke Supabase PostgreSQL
│   ├── teacherDashboard.js  # Antarmuka pengelolaan item sampah & rekap sesi kelas
│   ├── audio.js             # Pengelola efek suara & audio feedback
│   └── three/
│       ├── scene.js         # Pengaturan kamera, pencahayaan, dan renderer WebGL
│       ├── models.js        # Pemuat aset 3D & representasi tong Organik/Anorganik
│       └── gameLogic3D.js   # Fisika lempar parabola, deteksi tabrakan tong, & skor
├── database/
│   ├── sipilah_sampah.sql   # Skrip DDL & Seed Data standar MySQL 3NF (Kebutuhan Laporan)
│   └── supabase_schema.sql  # Skrip DDL PostgreSQL + RLS Policy (Kebutuhan Hosting Cloud)
├── docs/                    # Berkas dokumentasi akademik & visual perancangan
│   ├── DOCS_TUGAS_ARIE_BAB2_BAB3.md  # Bab 2 Use Case & Bab 3 Basis Data Relasional
│   ├── DOCS_TUGAS_YEYEN_BAB4.md       # Bab 4 Alur Menu, Matriks Akses & Wireframes
│   ├── Laporan_Tahap1_Kelompok05_SANY.docx  # Berkas laporan resmi format Microsoft Word
│   ├── wireframes/          # 6 Sketsa rancangan arsitektur antarmuka (Low-Fidelity)
│   └── screenshots/         # 6 Tangkapan layar antarmuka produksi (High-Fidelity)
├── api/
│   ├── config.js            # Serverless bridge untuk membaca Vercel Environment Variables
│   └── status.js            # Endpoint pengecekan kesehatan server cloud
├── index.html               # Halaman utama game (Single Page Application)
├── Buka_Game.bat            # Pintasan 1-klik untuk bapak/ibu guru di sekolah
├── vercel.json              # Konfigurasi deployment & rewrite routing Vercel
├── manifest.json            # Web App Manifest untuk dukungan Progressive Web App (PWA)
├── sw.js                    # Service Worker untuk caching aset & penggunaan luring (offline)
└── README.md                # Dokumentasi utama proyek
```

---

## 📚 Dokumentasi Akademik (Laporan Tahap 1)

Rincian perancangan sistem Rekayasa Perangkat Lunak dapat dipelajari melalui berkas-berkas di folder [`docs/`](docs/):

* 📑 **[Laporan Tugas Arie Muhammad Syahrial (Bab 2 & 3)](docs/DOCS_TUGAS_ARIE_BAB2_BAB3.md):**
  * **Bab 2.6 :** Diagram Use Case Sistem (Mermaid) memetakan aktor Siswa & Guru pada 12 Kebutuhan Fungsional (`KF-01` s.d. `KF-12`).
  * **Bab 2.7 :** Deskripsi Use Case Utama (*Memainkan Pemilahan Sampah 3D*).
  * **Bab 3.1 :** *Entity Relationship Diagram (ERD)* 6 entitas baku dengan normalisasi relasi N-M.
  * **Bab 3.2 :** Proses Normalisasi Data Bertahap (UNF &rarr; 1NF &rarr; 2NF &rarr; 3NF) berdasarkan form rekapitulasi riil program SEMUTLIS.
  * **Bab 3.3 :** Kamus Data Sistem (*Data Dictionary*) lengkap dengan tipe data dan aturan validasi.
  * **Bab 3.4 :** Komparasi Teknis Arsitektur: Evaluasi Godot Engine WebGL vs Three.js Ringan.
* 🎨 **[Laporan Tugas Yeyen Ai Nurhidayati (Bab 4)](docs/DOCS_TUGAS_YEYEN_BAB4.md):**
  * **Bab 4.1 :** Bagan Struktur Menu & Alur Navigasi (*Screen Navigation Flowchart*).
  * **Bab 4.2 :** Matriks Hak Akses Pengguna (*Access Control Matrix* Siswa vs Guru).
  * **Bab 4.3 :** Tabel Pemetaan 6 Layar Utama terhadap 6 Tabel Basis Data (Operasi CRUD).
  * **Bab 4.4 :** Dokumentasi Sketsa *Low-Fidelity Wireframes* dan Mockup *High-Fidelity*.
* 📄 **[Berkas Laporan Tahap 1 Format Word (.docx)](docs/Laporan_Tahap1_Kelompok05_SANY.docx):** Naskah kompilasi utuh yang siap dicetak/dikumpulkan kepada dosen pengampu.

---

## 👥 Tim Pengembang (Kelompok 05 - SANY)

Proyek ini dirancang dan dikembangkan dengan penuh dedikasi oleh mahasiswa **Program Studi S1 Teknik Informatika, Fakultas Ilmu Komputer, Universitas Kuningan**:

| Nama Anggota | NIM | Peran Utama & Tanggung Jawab |
| :--- | :---: | :--- |
| **Salwa Hamdunah** | *(Ketua Tim)* | Analisis Kebutuhan Sistem, Koordinasi Mitra Lapangan, & Penyusunan Dokumen Bab 1 |
| **Novelia Audy Wijaya** | *(Anggota)* | Perancangan Visual UI/UX, Aset Grafis & Optimalisasi Responsivitas Antarmuka |
| **Yeyen Ai Nurhidayati** | *(Anggota)* | Perancangan Alur Antarmuka (Bab 4), Wireframe, Matriks Hak Akses & CRUD Mapping |
| **Arie Muhammad Syahrial** | *(Anggota)* | Logika Game 3D Three.js, Arsitektur Basis Data Relasional 3NF & Full-Stack Integration |

---

## 🙏 Ucapan Terima Kasih

Kami menyampaikan rasa terima kasih dan penghargaan yang tulus kepada:
* **Bapak Agung Febriyana, S.Pd.** beserta keluarga besar **SDN 1 Ciawilor**, atas keterbukaan dan bimbingannya mengenai implementasi program SEMUTLIS.
* **Bapak Tris Mulyo Purnomo, S.Pd.** beserta bapak/ibu guru **SDN 2 Ciawilor**, atas masukan berharga mengenai karakteristik dan psikologi bermain siswa kelas rendah (fase A).
* Dosen Pengampu Mata Kuliah **Rekayasa Perangkat Lunak**, Fakultas Ilmu Komputer, Universitas Kuningan.

---
*Dibuat dengan semangat peduli lingkungan oleh Kelompok 05 - SANY © 2026.*
