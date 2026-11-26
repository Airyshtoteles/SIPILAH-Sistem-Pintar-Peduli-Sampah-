-- ===================================================================================
-- PROYEK MATA KULIAH REKAYASA PERANGKAT LUNAK (TINFCW243408)
-- Judul Proyek  : Game Edukasi Pemilahan Sampah Interaktif Berbasis Web untuk Siswa SD
-- Pengembang    : Kelompok 05 - SANY
--                 1. Salwa Hamdunah
--                 2. Novelia Audy Wijaya
--                 3. Yeyen Ai Nurhidayati
--                 4. Arie Muhammad Syahrial
-- Program Studi : S1 Teknik Informatika, Fakultas Ilmu Komputer, Universitas Kuningan (UNIKU)
-- Mitra Nyata   : 1. SDN 1 Ciawilor (Bapak Agung Febriyana, S.Pd. - Program SEMUTLIS)
--                 2. SDN 2 Ciawilor (Bapak Tris Mulyo Purnomo, S.Pd. - Pembiasaan Disiplin Kelas 1-3)
-- File          : database/db_pilah_sampah.sql
-- ===================================================================================

CREATE DATABASE IF NOT EXISTS `db_pilah_sampah`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_pilah_sampah`;

-- -----------------------------------------------------------------------------
-- 1. Tabel: tb_guru
-- Deskripsi: Menyimpan akun guru wali kelas / narahubung sekolah mitra
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `tb_log_pemilahan`;
DROP TABLE IF EXISTS `tb_hasil_bermain`;
DROP TABLE IF EXISTS `tb_item_sampah`;
DROP TABLE IF EXISTS `tb_kategori_sampah`;
DROP TABLE IF EXISTS `tb_sesi_kelas`;
DROP TABLE IF EXISTS `tb_guru`;

CREATE TABLE `tb_guru` (
  `id_guru` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_guru` VARCHAR(100) NOT NULL,
  `asal_sekolah` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Tabel: tb_sesi_kelas
-- Deskripsi: Menyimpan sesi kelas interaktif yang dibuat guru untuk dimainkan
--            secara estafet/bergantian pada laptop guru dan proyektor kelas
-- -----------------------------------------------------------------------------
CREATE TABLE `tb_sesi_kelas` (
  `id_sesi` INT AUTO_INCREMENT PRIMARY KEY,
  `id_guru` INT NOT NULL,
  `kode_sesi` VARCHAR(20) NOT NULL UNIQUE,
  `nama_kelas` VARCHAR(100) NOT NULL,
  `tanggal_sesi` DATE NOT NULL,
  `status_sesi` ENUM('aktif', 'selesai') NOT NULL DEFAULT 'aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_sesi_guru` FOREIGN KEY (`id_guru`)
    REFERENCES `tb_guru` (`id_guru`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_sesi_kode` (`kode_sesi`),
  INDEX `idx_sesi_guru` (`id_guru`),
  INDEX `idx_sesi_status` (`status_sesi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Tabel: tb_kategori_sampah
-- Deskripsi: Menyimpan 4 kategori tempat sampah sesuai standar edukasi lingkungan
-- -----------------------------------------------------------------------------
CREATE TABLE `tb_kategori_sampah` (
  `id_kategori` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_kategori` VARCHAR(50) NOT NULL,
  `warna_tong` VARCHAR(30) NOT NULL,
  `deskripsi_singkat` TEXT NOT NULL,
  INDEX `idx_kategori_nama` (`nama_kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Tabel: tb_item_sampah
-- Deskripsi: Bank item sampah 3D yang dapat muncul di meja permainan & narasinya
-- -----------------------------------------------------------------------------
CREATE TABLE `tb_item_sampah` (
  `id_item` INT AUTO_INCREMENT PRIMARY KEY,
  `id_kategori` INT NOT NULL,
  `nama_item` VARCHAR(100) NOT NULL,
  `kode_model_3d` VARCHAR(50) NOT NULL,
  `poin_dasar` INT NOT NULL DEFAULT 100,
  `pesan_edukasi_salah` TEXT NOT NULL,
  CONSTRAINT `fk_item_kategori` FOREIGN KEY (`id_kategori`)
    REFERENCES `tb_kategori_sampah` (`id_kategori`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_item_kategori` (`id_kategori`),
  INDEX `idx_item_model` (`kode_model_3d`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Tabel: tb_hasil_bermain
-- Deskripsi: Menyimpan nilai akhir per siswa per giliran bermain dalam sesi kelas
-- -----------------------------------------------------------------------------
CREATE TABLE `tb_hasil_bermain` (
  `id_hasil` INT AUTO_INCREMENT PRIMARY KEY,
  `id_sesi` INT NOT NULL,
  `nama_siswa` VARCHAR(100) NOT NULL,
  `skor_akhir` INT NOT NULL DEFAULT 0,
  `akurasi_persen` INT NOT NULL DEFAULT 0,
  `max_combo` INT NOT NULL DEFAULT 0,
  `status_sertifikat` ENUM('diklaim', 'belum_klaim') NOT NULL DEFAULT 'belum_klaim',
  `waktu_bermain` DATETIME NOT NULL,
  CONSTRAINT `fk_hasil_sesi` FOREIGN KEY (`id_sesi`)
    REFERENCES `tb_sesi_kelas` (`id_sesi`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_hasil_sesi` (`id_sesi`),
  INDEX `idx_hasil_skor` (`skor_akhir` DESC),
  INDEX `idx_hasil_siswa` (`nama_siswa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Tabel: tb_log_pemilahan
-- Deskripsi: Log per-aksi pilah sampah untuk analisis evaluasi pemahaman siswa
-- -----------------------------------------------------------------------------
CREATE TABLE `tb_log_pemilahan` (
  `id_log` INT AUTO_INCREMENT PRIMARY KEY,
  `id_hasil` INT NOT NULL,
  `id_item` INT NOT NULL,
  `id_kategori_dipilih` INT NOT NULL,
  `is_benar` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_log_hasil` FOREIGN KEY (`id_hasil`)
    REFERENCES `tb_hasil_bermain` (`id_hasil`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_log_item` FOREIGN KEY (`id_item`)
    REFERENCES `tb_item_sampah` (`id_item`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_log_kategori` FOREIGN KEY (`id_kategori_dipilih`)
    REFERENCES `tb_kategori_sampah` (`id_kategori`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_log_hasil` (`id_hasil`),
  INDEX `idx_log_item` (`id_item`),
  INDEX `idx_log_kategori` (`id_kategori_dipilih`),
  INDEX `idx_log_is_benar` (`is_benar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- SEED DATA AWAL (DEMO & TESTING PENILAIAN GURU MITRA)
-- =============================================================================

-- 1. Data Akun Guru Mitra
INSERT INTO `tb_guru` (`id_guru`, `nama_guru`, `asal_sekolah`, `username`, `password`) VALUES
(1, 'Agung Febriyana, S.Pd.', 'SDN 1 Ciawilor', 'agung_sdn1', 'guru123'),
(2, 'Tris Mulyo Purnomo, S.Pd.', 'SDN 2 Ciawilor', 'tris_sdn2', 'guru123');

-- 2. Data Sesi Kelas Awal
INSERT INTO `tb_sesi_kelas` (`id_sesi`, `id_guru`, `kode_sesi`, `nama_kelas`, `tanggal_sesi`, `status_sesi`) VALUES
(1, 1, 'CIAWI-2A', 'Kelas 2A - SEMUTLIS', '2026-11-20', 'aktif'),
(2, 2, 'CIAWI2-1B', 'Kelas 1B - Pembiasaan Disiplin', '2026-11-19', 'selesai');

-- 3. Data 4 Kategori Tempat Sampah 3D
INSERT INTO `tb_kategori_sampah` (`id_kategori`, `nama_kategori`, `warna_tong`, `deskripsi_singkat`) VALUES
(1, 'Organik', 'Hijau (#10b981)', 'Sisa makanan, daun, kulit buah yang dapat membusuk dan terurai alami menjadi pupuk kompos.'),
(2, 'Anorganik', 'Kuning (#f59e0b)', 'Plastik, kaleng, bungkus makanan, dan benda buatan pabrik yang tidak bisa membusuk secara alami.'),
(3, 'B3 Berbahaya', 'Merah (#ef4444)', 'Bahan berbahaya dan beracun seperti baterai bekas, lampu bohlam pecah, termometer raksa, dan sisa obat.'),
(4, 'Daur Ulang', 'Biru (#06b6d4)', 'Kardus, kertas buku tulis, koran bekas, dan karton kemasan yang dapat diolah kembali menjadi produk baru.');

-- 4. Data 16 Item Sampah 3D
INSERT INTO `tb_item_sampah` (`id_item`, `id_kategori`, `nama_item`, `kode_model_3d`, `poin_dasar`, `pesan_edukasi_salah`) VALUES
-- Organik (id_kategori: 1)
(1, 1, 'Kulit Pisang', 'gltf_banana', 100, 'Kulit pisang cepat membusuk alami dan kaya nutrisi untuk menyuburkan tanah.'),
(2, 1, 'Sisa Gigitan Apel', 'gltf_apple', 100, 'Sisa buah & makanan cepat membusuk menjadi pupuk kompos alami! Masukkan ke tong Hijau.'),
(3, 1, 'Daun Kering', 'gltf_leaf', 100, 'Daun gugur termasuk sampah organik halaman sekolah yang sangat mudah terurai.'),
(4, 1, 'Roti Kadaluarsa', 'gltf_bread', 100, 'Sisa roti dan bekal makanan termasuk sampah organik yang mudah membusuk.'),

-- Anorganik (id_kategori: 2)
(5, 2, 'Botol Air Minum Plastik', 'gltf_bottle', 100, 'Botol plastik butuh 450 tahun untuk hancur! Wajib dipilah ke tempat Anorganik (Kuning).'),
(6, 2, 'Kaleng Minuman Soda', 'gltf_can', 100, 'Kaleng alumunium bisa dilebur & didaur ulang berkali-kali. Masukkan ke tong Kuning.'),
(7, 2, 'Bebek Mainan Plastik', 'gltf_duck', 100, 'Mainan berbahan plastik sintetis tidak dapat membusuk alami. Masukkan ke tong Kuning.'),
(8, 2, 'Gelas Minuman & Sedotan', 'gltf_straw', 100, 'Sedotan & gelas plastik sekali pakai berbahaya bagi selokan sekolah dan hewan laut jika hanyut.'),

-- B3 Berbahaya (id_kategori: 3)
(9, 3, 'Baterai Bekas', 'gltf_battery', 100, 'Baterai bekas mengandung racun logam berat yang mencemari air tanah! Masukkan ke tong Merah.'),
(10, 3, 'Lampu Bohlam Bekas', 'gltf_bulb', 100, 'Pecahan kaca bohlam & serbuk gas merkuri di dalamnya sangat berbahaya bagi tangan siswa.'),
(11, 3, 'Botol Obat Kimia', 'gltf_medicine', 100, 'Sisa obat & botol sirup kimia mengandung zat aktif berbahaya bila tertelan sembarangan.'),
(12, 3, 'Termometer Raksa', 'gltf_thermometer', 100, 'Cairan raksa pada termometer sangat beracun bagi pernapasan dan kulit manusia!'),

-- Daur Ulang (id_kategori: 4)
(13, 4, 'Kardus Box', 'gltf_box', 100, 'Mendaur ulang kardus bisa menyelamatkan pohon di hutan dari penebangan liar! Masukkan ke tong Biru.'),
(14, 4, 'Kertas Buku Bekas', 'gltf_paper', 100, 'Kertas buku tulis bekas dipilah ke tong Biru agar dapat diolah kembali menjadi lembaran baru.'),
(15, 4, 'Koran Bekas', 'gltf_newspaper', 100, 'Koran bekas dapat diolah menjadi bubur kertas atau kerajinan tangan kreatif.'),
(16, 4, 'Karton Susu Kotak', 'gltf_carton', 100, 'Karton kemasan susu sekolah dipilah ke tempat sampah Daur Ulang (Biru).');

-- 5. Data Sampel Hasil Bermain Siswa (Sesi CIAWI-2A)
INSERT INTO `tb_hasil_bermain` (`id_hasil`, `id_sesi`, `nama_siswa`, `skor_akhir`, `akurasi_persen`, `max_combo`, `status_sertifikat`, `waktu_bermain`) VALUES
(1, 1, 'Aditya Pratama', 1420, 92, 7, 'diklaim', '2026-11-20 08:15:00'),
(2, 1, 'Siti Nur Aisyah', 1280, 85, 5, 'diklaim', '2026-11-20 08:22:00'),
(3, 1, 'Rian Hidayat', 940, 71, 3, 'belum_klaim', '2026-11-20 08:30:00'),
(4, 1, 'Zahra Amelia', 620, 50, 2, 'belum_klaim', '2026-11-20 08:38:00'),
(5, 1, 'Dimas Anggara', 1560, 95, 8, 'diklaim', '2026-11-20 08:45:00');

-- 6. Data Sampel Log Pemilahan Siswa
INSERT INTO `tb_log_pemilahan` (`id_log`, `id_hasil`, `id_item`, `id_kategori_dipilih`, `is_benar`) VALUES
-- Aditya Pratama (Hasil #1)
(1, 1, 1, 1, 1),
(2, 1, 5, 2, 1),
(3, 1, 9, 3, 1),
(4, 1, 13, 4, 1),
(5, 1, 2, 1, 1),
(6, 1, 6, 2, 1),
(7, 1, 10, 2, 0), -- Salah: Lampu bohlam dimasukkan ke Anorganik
-- Siti Nur Aisyah (Hasil #2)
(8, 2, 3, 1, 1),
(9, 2, 7, 2, 1),
(10, 2, 11, 3, 1),
(11, 2, 14, 4, 1),
(12, 2, 5, 4, 0), -- Salah: Botol plastik dimasukkan ke Daur Ulang
-- Zahra Amelia (Hasil #4 - Perlu Bimbingan)
(13, 4, 9, 2, 0),  -- Salah: Baterai dimasukkan ke Anorganik
(14, 4, 10, 2, 0), -- Salah: Lampu bohlam dimasukkan ke Anorganik
(15, 4, 1, 1, 1),
(16, 4, 13, 4, 1);
