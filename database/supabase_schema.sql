-- ===================================================================================
-- SKRIP BASIS DATA CLOUD SUPABASE / POSTGRESQL (HOSTING VERCEL INTEGRATION)
-- Mata Kuliah : Rekayasa Perangkat Lunak (TINFCW243408)
-- Proyek      : Game Edukasi Pemilahan Sampah Interaktif (SIPILAH)
-- Kelompok    : Kelompok 05 - SANY (Teknik Informatika UNIKU)
-- Mitra       : SDN 1 Ciawilor (Program SEMUTLIS) & SDN 2 Ciawilor
-- File        : database/supabase_schema.sql
-- ===================================================================================
-- PANDUAN EKSEKUSI DI SUPABASE:
-- 1. Buka dashboard Supabase -> Project Anda -> Menu 'SQL Editor' (ikon terminal di kiri)
-- 2. Klik '+ New query'
-- 3. Hapus seluruh teks lama, lalu PASTE SELURUH ISI FILE INI
-- 4. Klik tombol hijau 'Run' (atau tekan Ctrl + Enter)
-- ===================================================================================

-- -----------------------------------------------------------------------------
-- 0. BERSIHKAN TABEL LAMA JIKA ADA (DROP CASCADE)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS detail_jawaban CASCADE;
DROP TABLE IF EXISTS sesi_permainan CASCADE;
DROP TABLE IF EXISTS level_item CASCADE;
DROP TABLE IF EXISTS level_permainan CASCADE;
DROP TABLE IF EXISTS item_sampah CASCADE;
DROP TABLE IF EXISTS kategori_sampah CASCADE;

DROP TABLE IF EXISTS tb_log_pemilahan CASCADE;
DROP TABLE IF EXISTS tb_hasil_bermain CASCADE;
DROP TABLE IF EXISTS tb_item_sampah CASCADE;
DROP TABLE IF EXISTS tb_kategori_sampah CASCADE;
DROP TABLE IF EXISTS tb_sesi_kelas CASCADE;
DROP TABLE IF EXISTS tb_guru CASCADE;

-- =============================================================================
-- BAGIAN A: 6 TABEL UTAMA SESUAI DOKUMEN TUGAS REKAYASA PERANGKAT LUNAK (POSTGRESQL)
-- =============================================================================

-- 1. Tabel: kategori_sampah
CREATE TABLE kategori_sampah (
  id_kategori SERIAL PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL,
  warna_tong VARCHAR(30) NOT NULL,
  keterangan TEXT NOT NULL
);

-- 2. Tabel: item_sampah
CREATE TABLE item_sampah (
  id_item SERIAL PRIMARY KEY,
  id_kategori INT NOT NULL REFERENCES kategori_sampah(id_kategori) ON DELETE CASCADE,
  nama_item VARCHAR(100) NOT NULL,
  kode_aset VARCHAR(50) NOT NULL,
  pesan_edukasi TEXT NOT NULL
);

-- 3. Tabel: level_permainan
CREATE TABLE level_permainan (
  id_level SERIAL PRIMARY KEY,
  nama_level VARCHAR(50) NOT NULL,
  durasi_detik INT NOT NULL DEFAULT 60,
  target_skor INT NOT NULL DEFAULT 300,
  keterangan TEXT NOT NULL
);

-- 4. Tabel: level_item (Relasi N - M antara level_permainan dan item_sampah)
CREATE TABLE level_item (
  id_level_item SERIAL PRIMARY KEY,
  id_level INT NOT NULL REFERENCES level_permainan(id_level) ON DELETE CASCADE,
  id_item INT NOT NULL REFERENCES item_sampah(id_item) ON DELETE CASCADE,
  CONSTRAINT uk_level_item UNIQUE (id_level, id_item)
);

-- 5. Tabel: sesi_permainan (Rekapitulasi Sesi Kelas Tanpa Data Pribadi Siswa)
CREATE TABLE sesi_permainan (
  id_sesi SERIAL PRIMARY KEY,
  id_level INT NOT NULL REFERENCES level_permainan(id_level) ON DELETE CASCADE,
  tanggal_sesi TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  skor_akhir INT NOT NULL DEFAULT 0,
  jumlah_benar INT NOT NULL DEFAULT 0,
  jumlah_salah INT NOT NULL DEFAULT 0
);

-- 6. Tabel: detail_jawaban (Log Pemilahan Setiap Objek)
CREATE TABLE detail_jawaban (
  id_detail SERIAL PRIMARY KEY,
  id_sesi INT NOT NULL REFERENCES sesi_permainan(id_sesi) ON DELETE CASCADE,
  id_item INT NOT NULL REFERENCES item_sampah(id_item) ON DELETE CASCADE,
  id_kategori_dipilih INT NOT NULL REFERENCES kategori_sampah(id_kategori) ON DELETE CASCADE,
  is_benar SMALLINT NOT NULL DEFAULT 0
);

-- =============================================================================
-- BAGIAN B: TABEL MANAJEMEN KELAS & GURU MITRA (DIGUNAKAN OLEH CLOUD CONNECTOR)
-- =============================================================================

-- 7. Tabel: tb_guru
CREATE TABLE tb_guru (
  id_guru SERIAL PRIMARY KEY,
  nama_guru VARCHAR(100) NOT NULL,
  asal_sekolah VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel: tb_sesi_kelas
CREATE TABLE tb_sesi_kelas (
  id_sesi SERIAL PRIMARY KEY,
  id_guru INT NOT NULL REFERENCES tb_guru(id_guru) ON DELETE CASCADE,
  kode_sesi VARCHAR(20) NOT NULL UNIQUE,
  nama_kelas VARCHAR(100) NOT NULL,
  tanggal_sesi DATE NOT NULL,
  status_sesi VARCHAR(20) NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabel: tb_kategori_sampah
CREATE TABLE tb_kategori_sampah (
  id_kategori SERIAL PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL,
  warna_tong VARCHAR(30) NOT NULL,
  deskripsi_singkat TEXT NOT NULL
);

-- 10. Tabel: tb_item_sampah
CREATE TABLE tb_item_sampah (
  id_item SERIAL PRIMARY KEY,
  id_kategori INT NOT NULL REFERENCES tb_kategori_sampah(id_kategori) ON DELETE CASCADE,
  nama_item VARCHAR(100) NOT NULL,
  kode_model_3d VARCHAR(50) NOT NULL,
  poin_dasar INT NOT NULL DEFAULT 100,
  pesan_edukasi_salah TEXT NOT NULL
);

-- 11. Tabel: tb_hasil_bermain
CREATE TABLE tb_hasil_bermain (
  id_hasil SERIAL PRIMARY KEY,
  id_sesi INT NOT NULL REFERENCES tb_sesi_kelas(id_sesi) ON DELETE CASCADE,
  nama_siswa VARCHAR(100) NOT NULL,
  skor_akhir INT NOT NULL DEFAULT 0,
  akurasi_persen INT NOT NULL DEFAULT 0,
  max_combo INT NOT NULL DEFAULT 0,
  status_sertifikat VARCHAR(20) NOT NULL DEFAULT 'belum_klaim',
  waktu_bermain TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tabel: tb_log_pemilahan
CREATE TABLE tb_log_pemilahan (
  id_log SERIAL PRIMARY KEY,
  id_hasil INT NOT NULL REFERENCES tb_hasil_bermain(id_hasil) ON DELETE CASCADE,
  id_item INT NOT NULL REFERENCES tb_item_sampah(id_item) ON DELETE CASCADE,
  id_kategori_dipilih INT NOT NULL REFERENCES tb_kategori_sampah(id_kategori) ON DELETE CASCADE,
  is_benar SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BAGIAN C: PENGATURAN ROW LEVEL SECURITY (RLS) AGAR VERCEL / WEB DAPAT AKSES
-- =============================================================================
ALTER TABLE kategori_sampah ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_sampah ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_permainan ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesi_permainan ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_jawaban ENABLE ROW LEVEL SECURITY;

ALTER TABLE tb_guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_sesi_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_kategori_sampah ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_item_sampah ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_hasil_bermain ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_log_pemilahan ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Penuh (SELECT, INSERT, UPDATE, DELETE) untuk Web App via anon/authenticated key
CREATE POLICY "Akses Penuh kategori_sampah" ON kategori_sampah FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh item_sampah" ON item_sampah FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh level_permainan" ON level_permainan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh level_item" ON level_item FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh sesi_permainan" ON sesi_permainan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh detail_jawaban" ON detail_jawaban FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Akses Penuh tb_guru" ON tb_guru FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh tb_sesi_kelas" ON tb_sesi_kelas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh tb_kategori_sampah" ON tb_kategori_sampah FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh tb_item_sampah" ON tb_item_sampah FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh tb_hasil_bermain" ON tb_hasil_bermain FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh tb_log_pemilahan" ON tb_log_pemilahan FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- BAGIAN D: SEED DATA AWAL (DEMO PRAKTIK SDN 1 & SDN 2 CIAWILOR)
-- =============================================================================

-- 1. Kategori Sampah (Organik & Anorganik)
INSERT INTO kategori_sampah (id_kategori, nama_kategori, warna_tong, keterangan) VALUES
(1, 'Organik', 'Hijau (#10b981)', 'Sampah sisa makhluk hidup yang mudah membusuk alami menjadi kompos (kulit pisang, sisa apel, daun kering, sisa roti).'),
(2, 'Anorganik', 'Kuning (#f59e0b)', 'Sampah buatan pabrik yang tidak bisa membusuk alami dan harus didaur ulang (botol plastik, kaleng soda, kardus, kertas).')
ON CONFLICT (id_kategori) DO NOTHING;

-- 2. Level Permainan
INSERT INTO level_permainan (id_level, nama_level, durasi_detik, target_skor, keterangan) VALUES
(1, 'Level 1: Pemula (Mudah)', 60, 300, 'Cocok untuk siswa kelas 1 SD. Durasi santai 60 detik dengan jenis sampah harian mendasar.'),
(2, 'Level 2: Terampil (Sedang)', 45, 500, 'Cocok untuk siswa kelas 2 SD. Durasi 45 detik dengan kombinasi sampah variatif.'),
(3, 'Level 3: Juara Lingkungan (Tantangan)', 30, 800, 'Cocok untuk siswa kelas 3 SD. Durasi 30 detik untuk melatih ketangkasan pemilahan cepat.')
ON CONFLICT (id_level) DO NOTHING;

-- 3. Item Sampah 3D
INSERT INTO item_sampah (id_item, id_kategori, nama_item, kode_aset, pesan_edukasi) VALUES
(1, 1, 'Kulit Pisang', 'gltf_banana', 'Kulit pisang cepat membusuk alami dan kaya nutrisi untuk menyuburkan tanah (Tong Hijau).'),
(2, 1, 'Sisa Gigitan Apel', 'gltf_apple', 'Sisa buah dan makanan cepat membusuk menjadi pupuk kompos alami! Masukkan ke Tong Organik.'),
(3, 1, 'Daun Kering', 'gltf_leaf', 'Daun gugur pepohonan sekolah dapat dijadikan kompos tanaman (Tong Hijau).'),
(4, 1, 'Roti Kadaluarsa', 'gltf_bread', 'Sisa roti dan remah makanan mudah terurai alami di dalam tanah (Tong Organik).'),
(5, 2, 'Botol Plastik Minuman', 'gltf_bottle', 'Botol plastik butuh 450 tahun untuk hancur! Wajib dipilah ke Tong Anorganik (Kuning).'),
(6, 2, 'Kaleng Minuman Soda', 'gltf_can', 'Kaleng aluminium pabrik tidak bisa membusuk, namun bisa dilebur kembali (Tong Kuning).'),
(7, 2, 'Bebek Mainan Plastik', 'gltf_duck', 'Mainan berbahan plastik sintetis keras termasuk sampah anorganik (Tong Kuning).'),
(8, 2, 'Gelas Plastik & Sedotan', 'gltf_straw', 'Sedotan dan gelas plastik sekali pakai berbahaya jika hanyut ke sungai (Tong Kuning).'),
(9, 2, 'Kardus Box Makanan', 'gltf_box', 'Kardus kemasan kertas tebal harus dipilah kering agar dapat didaur ulang (Tong Kuning).'),
(10, 2, 'Kertas Buku Bekas', 'gltf_paper', 'Kertas buku tulis termasuk sampah anorganik kering yang siap didaur ulang menjadi kertas baru.'),
(11, 2, 'Koran Bekas', 'gltf_newspaper', 'Kertas koran bekas tidak boleh dibakar karena berasap pekat, masukkan ke Tong Anorganik.'),
(12, 2, 'Karton Kotak Susu', 'gltf_carton', 'Karton kemasan susu memiliki lapisan kedap air, buang ke Tong Anorganik agar didaur ulang.')
ON CONFLICT (id_item) DO NOTHING;

-- 4. Level Item Relasi
INSERT INTO level_item (id_level, id_item) VALUES
(1, 1), (1, 2), (1, 3), (1, 5), (1, 6), (1, 9),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10), (3, 11), (3, 12)
ON CONFLICT (id_level, id_item) DO NOTHING;

-- 5. Data Sesi Permainan Awal (Bebas Data Pribadi Siswa)
INSERT INTO sesi_permainan (id_sesi, id_level, tanggal_sesi, skor_akhir, jumlah_benar, jumlah_salah) VALUES
(1, 1, '2026-11-20 08:30:00+07', 600, 6, 0),
(2, 2, '2026-11-20 08:45:00+07', 800, 8, 1),
(3, 3, '2026-11-20 09:00:00+07', 1000, 10, 2)
ON CONFLICT (id_sesi) DO NOTHING;

-- 6. Data Detail Jawaban Awal
INSERT INTO detail_jawaban (id_sesi, id_item, id_kategori_dipilih, is_benar) VALUES
(1, 1, 1, 1),
(1, 5, 2, 1),
(1, 2, 1, 1),
(2, 6, 2, 1),
(2, 3, 2, 0),
(2, 4, 1, 1);

-- 7. Data Guru Mitra
INSERT INTO tb_guru (id_guru, nama_guru, asal_sekolah, username, password) VALUES
(1, 'Agung Febriyana, S.Pd.', 'SDN 1 Ciawilor', 'agung_sdn1', 'guru123'),
(2, 'Tris Mulyo Purnomo, S.Pd.', 'SDN 2 Ciawilor', 'tris_sdn2', 'guru123')
ON CONFLICT (id_guru) DO NOTHING;

-- 8. Data Sesi Kelas
INSERT INTO tb_sesi_kelas (id_sesi, id_guru, kode_sesi, nama_kelas, tanggal_sesi, status_sesi) VALUES
(1, 1, 'CIAWI-2A', 'Kelas 2A - SEMUTLIS', '2026-11-20', 'aktif'),
(2, 2, 'CIAWI2-1B', 'Kelas 1B - Pembiasaan Disiplin', '2026-11-19', 'selesai')
ON CONFLICT (id_sesi) DO NOTHING;

-- 9. Data Kategori Modul
INSERT INTO tb_kategori_sampah (id_kategori, nama_kategori, warna_tong, deskripsi_singkat) VALUES
(1, 'Organik', 'Hijau (#10b981)', 'Sisa makanan, daun, kulit buah yang dapat membusuk dan terurai alami menjadi kompos.'),
(2, 'Anorganik', 'Kuning (#f59e0b)', 'Plastik, kaleng, botol, dan benda pabrik yang tidak bisa membusuk alami.'),
(3, 'B3 Berbahaya', 'Merah (#ef4444)', 'Baterai bekas, lampu bohlam pecah, termometer raksa, dan sisa bahan kimia.'),
(4, 'Daur Ulang', 'Biru (#06b6d4)', 'Kardus, kertas buku tulis, koran, dan karton yang dapat diolah kembali.')
ON CONFLICT (id_kategori) DO NOTHING;

-- 10. Data Item Bank Modul
INSERT INTO tb_item_sampah (id_item, id_kategori, nama_item, kode_model_3d, poin_dasar, pesan_edukasi_salah) VALUES
(1, 1, 'Kulit Pisang', 'gltf_banana', 100, 'Kulit pisang cepat membusuk alami dan kaya nutrisi untuk menyuburkan tanah (Organik - Hijau).'),
(2, 1, 'Sisa Gigitan Apel', 'gltf_apple', 100, 'Sisa buah & makanan cepat membusuk menjadi pupuk kompos alami! Masukkan ke tong Hijau.'),
(3, 1, 'Daun Kering', 'gltf_leaf', 100, 'Daun gugur termasuk sampah organik halaman sekolah yang sangat mudah terurai (Organik - Hijau).'),
(4, 1, 'Roti Kadaluarsa', 'gltf_bread', 100, 'Sisa roti dan bekal makanan termasuk sampah organik yang mudah membusuk (Organik - Hijau).'),
(5, 2, 'Botol Air Minum Plastik', 'gltf_bottle', 100, 'Botol plastik butuh 450 tahun untuk hancur! Wajib dipilah ke tempat Anorganik (Kuning).'),
(6, 2, 'Kaleng Minuman Soda', 'gltf_can', 100, 'Kaleng alumunium bisa dilebur & didaur ulang berkali-kali. Masukkan ke tong Kuning (Anorganik).'),
(7, 2, 'Bebek Mainan Plastik', 'gltf_duck', 100, 'Mainan berbahan plastik sintetis tidak dapat membusuk alami. Masukkan ke tong Kuning (Anorganik).'),
(8, 2, 'Gelas Minuman & Sedotan', 'gltf_straw', 100, 'Sedotan & gelas plastik berbahaya bagi saluran air sekolah dan biota sungai/laut (Anorganik - Kuning).'),
(9, 3, 'Baterai Bekas', 'gltf_battery', 100, 'Baterai bekas mengandung racun logam berat yang mencemari air tanah! Masukkan ke tong Merah (B3).'),
(10, 3, 'Lampu Bohlam Bekas', 'gltf_bulb', 100, 'Pecahan kaca bohlam & serbuk gas merkuri di dalamnya sangat berbahaya bagi tangan siswa (B3 - Merah).'),
(11, 3, 'Botol Obat Kimia', 'gltf_medicine', 100, 'Sisa obat & botol kimia mengandung zat aktif berbahaya bila tertelan sembarangan (B3 - Merah).'),
(12, 3, 'Termometer Raksa', 'gltf_thermometer', 100, 'Cairan raksa pada termometer sangat beracun bagi pernapasan dan kulit manusia! (B3 - Merah).'),
(13, 4, 'Kardus Box', 'gltf_box', 100, 'Mendaur ulang kardus menyelamatkan pohon hutan dari penebangan liar! Masukkan ke tong Biru (Daur Ulang).'),
(14, 4, 'Kertas Buku Bekas', 'gltf_paper', 100, 'Kertas buku tulis bekas dipilah ke tong Biru agar dapat diolah kembali menjadi lembaran baru.'),
(15, 4, 'Koran Bekas', 'gltf_newspaper', 100, 'Koran bekas dapat diolah menjadi bubur kertas atau kerajinan kreatif (Daur Ulang - Biru).'),
(16, 4, 'Karton Susu Kotak', 'gltf_carton', 100, 'Karton kemasan susu sekolah dipilah ke tempat sampah Daur Ulang (Biru).')
ON CONFLICT (id_item) DO NOTHING;

-- 11. Data Hasil Bermain Demo
INSERT INTO tb_hasil_bermain (id_hasil, id_sesi, nama_siswa, skor_akhir, akurasi_persen, max_combo, status_sertifikat, waktu_bermain) VALUES
(1, 1, 'Aditya Pratama', 1420, 92, 7, 'diklaim', NOW() - INTERVAL '2 hours'),
(2, 1, 'Siti Nur Aisyah', 1280, 85, 5, 'diklaim', NOW() - INTERVAL '1 hours'),
(3, 1, 'Rian Hidayat', 940, 71, 3, 'belum_klaim', NOW() - INTERVAL '40 minutes')
ON CONFLICT (id_hasil) DO NOTHING;

-- Update sequence auto increment PostgreSQL agar insert data baru tidak bentrok dengan ID awal
SELECT setval(pg_get_serial_sequence('kategori_sampah', 'id_kategori'), (SELECT COALESCE(MAX(id_kategori), 1) FROM kategori_sampah));
SELECT setval(pg_get_serial_sequence('level_permainan', 'id_level'), (SELECT COALESCE(MAX(id_level), 1) FROM level_permainan));
SELECT setval(pg_get_serial_sequence('item_sampah', 'id_item'), (SELECT COALESCE(MAX(id_item), 1) FROM item_sampah));
SELECT setval(pg_get_serial_sequence('sesi_permainan', 'id_sesi'), (SELECT COALESCE(MAX(id_sesi), 1) FROM sesi_permainan));
SELECT setval(pg_get_serial_sequence('detail_jawaban', 'id_detail'), (SELECT COALESCE(MAX(id_detail), 1) FROM detail_jawaban));

SELECT setval(pg_get_serial_sequence('tb_guru', 'id_guru'), (SELECT COALESCE(MAX(id_guru), 1) FROM tb_guru));
SELECT setval(pg_get_serial_sequence('tb_sesi_kelas', 'id_sesi'), (SELECT COALESCE(MAX(id_sesi), 1) FROM tb_sesi_kelas));
SELECT setval(pg_get_serial_sequence('tb_kategori_sampah', 'id_kategori'), (SELECT COALESCE(MAX(id_kategori), 1) FROM tb_kategori_sampah));
SELECT setval(pg_get_serial_sequence('tb_item_sampah', 'id_item'), (SELECT COALESCE(MAX(id_item), 1) FROM tb_item_sampah));
SELECT setval(pg_get_serial_sequence('tb_hasil_bermain', 'id_hasil'), (SELECT COALESCE(MAX(id_hasil), 1) FROM tb_hasil_bermain));
