-- ===================================================================================
-- SKRIP BASIS DATA DDL & SEED DATA MYSQL (RELASIONAL 3NF)
-- Mata Kuliah : Rekayasa Perangkat Lunak (TINFCW243408)
-- Proyek      : Game Edukasi Pemilahan Sampah Interaktif (SIPILAH)
-- Kelompok    : Kelompok 05 - SANY (Teknik Informatika UNIKU)
-- Anggota     : Salwa Hamdunah, Novelia Audy Wijaya, Yeyen Ai Nurhidayati, Arie Muhammad Syahrial
-- Mitra       : SDN 1 Ciawilor (Utama) & SDN 2 Ciawilor (Pendukung)
-- File        : database/sipilah_sampah.sql
-- ===================================================================================

CREATE DATABASE IF NOT EXISTS db_sipilah_sampah
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_sipilah_sampah;

-- Nonaktifkan pengecekan foreign key sementara untuk inisialisasi tabel bersih
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS detail_jawaban;
DROP TABLE IF EXISTS sesi_permainan;
DROP TABLE IF EXISTS level_item;
DROP TABLE IF EXISTS level_permainan;
DROP TABLE IF EXISTS item_sampah;
DROP TABLE IF EXISTS kategori_sampah;

SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================================
-- 1. TABEL: kategori_sampah
-- Menyimpan 2 kategori utama yang dimainkan di arena 3D: Organik & Anorganik
-- ===================================================================================
CREATE TABLE kategori_sampah (
  id_kategori INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL,
  warna_tong VARCHAR(30) NOT NULL,
  keterangan TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================================
-- 2. TABEL: item_sampah
-- Menyimpan objek sampah 3D yang muncul di atas meja permainan
-- ===================================================================================
CREATE TABLE item_sampah (
  id_item INT AUTO_INCREMENT PRIMARY KEY,
  id_kategori INT NOT NULL,
  nama_item VARCHAR(100) NOT NULL,
  kode_aset VARCHAR(50) NOT NULL,
  pesan_edukasi TEXT NOT NULL,
  CONSTRAINT fk_item_kategori FOREIGN KEY (id_kategori)
    REFERENCES kategori_sampah(id_kategori)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_item_kategori (id_kategori)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================================
-- 3. TABEL: level_permainan
-- Menyimpan tingkatan tantangan permainan (Mudah, Sedang, Tantangan)
-- ===================================================================================
CREATE TABLE level_permainan (
  id_level INT AUTO_INCREMENT PRIMARY KEY,
  nama_level VARCHAR(50) NOT NULL,
  durasi_detik INT NOT NULL DEFAULT 60,
  target_skor INT NOT NULL DEFAULT 300,
  keterangan TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================================
-- 4. TABEL: level_item (Relasi N - M antara level_permainan dan item_sampah)
-- Menentukan daftar item sampah yang dapat muncul pada level tertentu
-- ===================================================================================
CREATE TABLE level_item (
  id_level_item INT AUTO_INCREMENT PRIMARY KEY,
  id_level INT NOT NULL,
  id_item INT NOT NULL,
  CONSTRAINT fk_levelitem_level FOREIGN KEY (id_level)
    REFERENCES level_permainan(id_level)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_levelitem_item FOREIGN KEY (id_item)
    REFERENCES item_sampah(id_item)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  UNIQUE KEY uk_level_item (id_level, id_item),
  INDEX idx_levelitem_level (id_level),
  INDEX idx_levelitem_item (id_item)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================================
-- 5. TABEL: sesi_permainan
-- Menyimpan rekapitulasi sesi permainan kelas (tanpa menyimpan data pribadi siswa)
-- ===================================================================================
CREATE TABLE sesi_permainan (
  id_sesi INT AUTO_INCREMENT PRIMARY KEY,
  id_level INT NOT NULL,
  tanggal_sesi DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  skor_akhir INT NOT NULL DEFAULT 0,
  jumlah_benar INT NOT NULL DEFAULT 0,
  jumlah_salah INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_sesi_level FOREIGN KEY (id_level)
    REFERENCES level_permainan(id_level)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_sesi_level (id_level),
  INDEX idx_sesi_tanggal (tanggal_sesi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================================
-- 6. TABEL: detail_jawaban
-- Menyimpan log setiap aksi siswa saat memilah objek sampah ke dalam tong
-- ===================================================================================
CREATE TABLE detail_jawaban (
  id_detail INT AUTO_INCREMENT PRIMARY KEY,
  id_sesi INT NOT NULL,
  id_item INT NOT NULL,
  id_kategori_dipilih INT NOT NULL,
  is_benar TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_detail_sesi FOREIGN KEY (id_sesi)
    REFERENCES sesi_permainan(id_sesi)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_detail_item FOREIGN KEY (id_item)
    REFERENCES item_sampah(id_item)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_detail_kategori_dipilih FOREIGN KEY (id_kategori_dipilih)
    REFERENCES kategori_sampah(id_kategori)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_detail_sesi (id_sesi),
  INDEX idx_detail_item (id_item),
  INDEX idx_detail_kategori (id_kategori_dipilih)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================================
-- SEED DATA AWAL (DEMO PRAKTIK PEMBELAJARAN SDN 1 & SDN 2 CIAWILOR)
-- ===================================================================================

-- 1. Insert Kategori Sampah (Hanya 2 Kategori Arena 3D: Organik & Anorganik)
INSERT INTO kategori_sampah (id_kategori, nama_kategori, warna_tong, keterangan) VALUES
(1, 'Organik', 'Hijau (#10b981)', 'Sampah yang berasal dari sisa makhluk hidup, mudah membusuk alami menjadi pupuk kompos (sisa buah, sayur, daun kering, roti).'),
(2, 'Anorganik', 'Kuning (#f59e0b)', 'Sampah kering hasil buatan pabrik yang tidak bisa membusuk alami dan harus didaur ulang (plastik, kaleng, botol, kertas, kardus).')
ON DUPLICATE KEY UPDATE nama_kategori = VALUES(nama_kategori);

-- 2. Insert Level Permainan (3 Tingkat Kesulitan untuk Siswa SD Kelas 1-3)
INSERT INTO level_permainan (id_level, nama_level, durasi_detik, target_skor, keterangan) VALUES
(1, 'Level 1: Pemula (Mudah)', 60, 300, 'Cocok untuk siswa kelas 1 SD. Durasi santai 60 detik dengan jenis sampah harian yang sangat sering dijumpai di kelas.'),
(2, 'Level 2: Terampil (Sedang)', 45, 500, 'Cocok untuk siswa kelas 2 SD. Durasi 45 detik dengan kombinasi sampah organik dan anorganik yang bervariasi.'),
(3, 'Level 3: Juara Lingkungan (Tantangan)', 30, 800, 'Cocok untuk siswa kelas 3 SD. Durasi cepat 30 detik untuk melatih refleks pemilahan sampah cepat dan tepat.')
ON DUPLICATE KEY UPDATE nama_level = VALUES(nama_level);

-- 3. Insert Item Sampah 3D
INSERT INTO item_sampah (id_item, id_kategori, nama_item, kode_aset, pesan_edukasi) VALUES
-- Kategori Organik (id_kategori = 1)
(1, 1, 'Kulit Pisang', 'gltf_banana', 'Kulit pisang cepat membusuk alami dan kaya nutrisi untuk menyuburkan tanah (Tong Hijau).'),
(2, 1, 'Sisa Gigitan Apel', 'gltf_apple', 'Sisa buah dan makanan cepat membusuk menjadi pupuk kompos alami! Masukkan ke Tong Organik.'),
(3, 1, 'Daun Kering', 'gltf_leaf', 'Daun gugur pepohonan sekolah dapat dijadikan kompos tanaman (Tong Hijau).'),
(4, 1, 'Roti Kadaluarsa', 'gltf_bread', 'Sisa roti dan remah makanan mudah terurai alami di dalam tanah (Tong Organik).'),

-- Kategori Anorganik (id_kategori = 2)
(5, 2, 'Botol Plastik Minuman', 'gltf_bottle', 'Botol plastik butuh 450 tahun untuk hancur! Wajib dipilah ke Tong Anorganik (Kuning).'),
(6, 2, 'Kaleng Minuman Soda', 'gltf_can', 'Kaleng aluminium pabrik tidak bisa membusuk, namun bisa dilebur kembali (Tong Kuning).'),
(7, 2, 'Bebek Mainan Plastik', 'gltf_duck', 'Mainan berbahan plastik sintetis keras termasuk sampah anorganik (Tong Kuning).'),
(8, 2, 'Gelas Plastik & Sedotan', 'gltf_straw', 'Sedotan dan gelas plastik sekali pakai berbahaya jika hanyut ke sungai (Tong Kuning).'),
(9, 2, 'Kardus Box Makanan', 'gltf_box', 'Kardus kemasan kertas tebal harus dipilah kering agar dapat didaur ulang (Tong Kuning).'),
(10, 2, 'Kertas Buku Bekas', 'gltf_paper', 'Kertas buku tulis termasuk sampah anorganik kering yang siap didaur ulang menjadi kertas baru.'),
(11, 2, 'Koran Bekas', 'gltf_newspaper', 'Kertas koran bekas tidak boleh dibakar karena berasap pekat, masukkan ke Tong Anorganik.'),
(12, 2, 'Karton Kotak Susu', 'gltf_carton', 'Karton kemasan susu memiliki lapisan kedap air, buang ke Tong Anorganik agar didaur ulang.')
ON DUPLICATE KEY UPDATE nama_item = VALUES(nama_item);

-- 4. Insert Relasi Level - Item (level_item)
-- Level 1: 6 Item Sampah Paling Mendasar
INSERT INTO level_item (id_level, id_item) VALUES
(1, 1), -- Pisang (Organik)
(1, 2), -- Apel (Organik)
(1, 3), -- Daun (Organik)
(1, 5), -- Botol (Anorganik)
(1, 6), -- Kaleng (Anorganik)
(1, 9)  -- Kardus (Anorganik)
ON DUPLICATE KEY UPDATE id_item = VALUES(id_item);

-- Level 2: 9 Item Sampah Variatif
INSERT INTO level_item (id_level, id_item) VALUES
(2, 1), (2, 2), (2, 3), (2, 4), -- 4 Organik
(2, 5), (2, 6), (2, 7), (2, 8), (2, 9) -- 5 Anorganik
ON DUPLICATE KEY UPDATE id_item = VALUES(id_item);

-- Level 3: Seluruh 12 Item Sampah Lengkap
INSERT INTO level_item (id_level, id_item) VALUES
(3, 1), (3, 2), (3, 3), (3, 4),
(3, 5), (3, 6), (3, 7), (3, 8),
(3, 9), (3, 10), (3, 11), (3, 12)
ON DUPLICATE KEY UPDATE id_item = VALUES(id_item);

-- 5. Insert Contoh Sesi Permainan (Rekapitulasi Kelas Tanpa Data Pribadi Siswa)
INSERT INTO sesi_permainan (id_sesi, id_level, tanggal_sesi, skor_akhir, jumlah_benar, jumlah_salah) VALUES
(1, 1, '2026-11-20 08:30:00', 600, 6, 0),
(2, 2, '2026-11-20 08:45:00', 800, 8, 1),
(3, 3, '2026-11-20 09:00:00', 1000, 10, 2)
ON DUPLICATE KEY UPDATE skor_akhir = VALUES(skor_akhir);

-- 6. Insert Contoh Detail Jawaban Pemilahan
INSERT INTO detail_jawaban (id_sesi, id_item, id_kategori_dipilih, is_benar) VALUES
(1, 1, 1, 1), -- Pisang -> Organik (Benar)
(1, 5, 2, 1), -- Botol -> Anorganik (Benar)
(1, 2, 1, 1), -- Apel -> Organik (Benar)
(2, 6, 2, 1), -- Kaleng -> Anorganik (Benar)
(2, 3, 2, 0), -- Daun -> Anorganik (Salah)
(2, 4, 1, 1); -- Roti -> Organik (Benar)
