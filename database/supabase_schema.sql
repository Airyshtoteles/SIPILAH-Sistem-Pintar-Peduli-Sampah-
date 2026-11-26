-- ===================================================================================
-- SKEMA BASIS DATA CLOUD SUPABASE / POSTGRESQL (HOSTING VERCEL INTEGRATION)
-- Proyek   : Game Edukasi Pemilahan Sampah Interaktif (SIPILAH)
-- Kelompok : Kelompok 05 - SANY (Teknik Informatika UNIKU)
-- Mitra    : SDN 1 Ciawilor & SDN 2 Ciawilor (Program SEMUTLIS)
-- File     : database/supabase_schema.sql
-- ===================================================================================

-- 1. Tabel: tb_guru
CREATE TABLE IF NOT EXISTS tb_guru (
  id_guru SERIAL PRIMARY KEY,
  nama_guru VARCHAR(100) NOT NULL,
  asal_sekolah VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel: tb_sesi_kelas
CREATE TABLE IF NOT EXISTS tb_sesi_kelas (
  id_sesi SERIAL PRIMARY KEY,
  id_guru INT NOT NULL REFERENCES tb_guru(id_guru) ON DELETE CASCADE,
  kode_sesi VARCHAR(20) NOT NULL UNIQUE,
  nama_kelas VARCHAR(100) NOT NULL,
  tanggal_sesi DATE NOT NULL,
  status_sesi VARCHAR(20) NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel: tb_kategori_sampah
CREATE TABLE IF NOT EXISTS tb_kategori_sampah (
  id_kategori SERIAL PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL,
  warna_tong VARCHAR(30) NOT NULL,
  deskripsi_singkat TEXT NOT NULL
);

-- 4. Tabel: tb_item_sampah
CREATE TABLE IF NOT EXISTS tb_item_sampah (
  id_item SERIAL PRIMARY KEY,
  id_kategori INT NOT NULL REFERENCES tb_kategori_sampah(id_kategori) ON DELETE CASCADE,
  nama_item VARCHAR(100) NOT NULL,
  kode_model_3d VARCHAR(50) NOT NULL,
  poin_dasar INT NOT NULL DEFAULT 100,
  pesan_edukasi_salah TEXT NOT NULL
);

-- 5. Tabel: tb_hasil_bermain
CREATE TABLE IF NOT EXISTS tb_hasil_bermain (
  id_hasil SERIAL PRIMARY KEY,
  id_sesi INT NOT NULL REFERENCES tb_sesi_kelas(id_sesi) ON DELETE CASCADE,
  nama_siswa VARCHAR(100) NOT NULL,
  skor_akhir INT NOT NULL DEFAULT 0,
  akurasi_persen INT NOT NULL DEFAULT 0,
  max_combo INT NOT NULL DEFAULT 0,
  status_sertifikat VARCHAR(20) NOT NULL DEFAULT 'belum_klaim',
  waktu_bermain TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel: tb_log_pemilahan
CREATE TABLE IF NOT EXISTS tb_log_pemilahan (
  id_log SERIAL PRIMARY KEY,
  id_hasil INT NOT NULL REFERENCES tb_hasil_bermain(id_hasil) ON DELETE CASCADE,
  id_item INT NOT NULL REFERENCES tb_item_sampah(id_item) ON DELETE CASCADE,
  id_kategori_dipilih INT NOT NULL REFERENCES tb_kategori_sampah(id_kategori) ON DELETE CASCADE,
  is_benar SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- KEBIJAKAN AKSES PUBLIK (ROW LEVEL SECURITY) AGAR BISA DIAKSES CLIENT WEB
-- =============================================================================
ALTER TABLE tb_guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_sesi_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_kategori_sampah ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_item_sampah ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_hasil_bermain ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_log_pemilahan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Akses Baca Guru" ON tb_guru FOR SELECT USING (true);
CREATE POLICY "Akses Penuh Sesi" ON tb_sesi_kelas FOR ALL USING (true);
CREATE POLICY "Akses Baca Kategori" ON tb_kategori_sampah FOR SELECT USING (true);
CREATE POLICY "Akses Penuh Item" ON tb_item_sampah FOR ALL USING (true);
CREATE POLICY "Akses Penuh Hasil" ON tb_hasil_bermain FOR ALL USING (true);
CREATE POLICY "Akses Penuh Log" ON tb_log_pemilahan FOR ALL USING (true);

-- =============================================================================
-- SEED DATA AWAL (DEMO MITRA SDN 1 & SDN 2 CIAWILOR)
-- =============================================================================
INSERT INTO tb_guru (id_guru, nama_guru, asal_sekolah, username, password) VALUES
(1, 'Agung Febriyana, S.Pd.', 'SDN 1 Ciawilor', 'agung_sdn1', 'guru123'),
(2, 'Tris Mulyo Purnomo, S.Pd.', 'SDN 2 Ciawilor', 'tris_sdn2', 'guru123')
ON CONFLICT (id_guru) DO NOTHING;

INSERT INTO tb_sesi_kelas (id_sesi, id_guru, kode_sesi, nama_kelas, tanggal_sesi, status_sesi) VALUES
(1, 1, 'CIAWI-2A', 'Kelas 2A - SEMUTLIS', '2026-11-20', 'aktif'),
(2, 2, 'CIAWI2-1B', 'Kelas 1B - Pembiasaan Disiplin', '2026-11-19', 'selesai')
ON CONFLICT (id_sesi) DO NOTHING;

INSERT INTO tb_kategori_sampah (id_kategori, nama_kategori, warna_tong, deskripsi_singkat) VALUES
(1, 'Organik', 'Hijau (#10b981)', 'Sisa makanan, daun, kulit buah yang dapat membusuk dan terurai alami menjadi kompos.'),
(2, 'Anorganik', 'Kuning (#f59e0b)', 'Plastik, kaleng, botol, dan benda pabrik yang tidak bisa membusuk alami.'),
(3, 'B3 Berbahaya', 'Merah (#ef4444)', 'Baterai bekas, lampu bohlam pecah, termometer raksa, dan sisa bahan kimia.'),
(4, 'Daur Ulang', 'Biru (#06b6d4)', 'Kardus, kertas buku tulis, koran, dan karton yang dapat diolah kembali.')
ON CONFLICT (id_kategori) DO NOTHING;

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

INSERT INTO tb_hasil_bermain (id_hasil, id_sesi, nama_siswa, skor_akhir, akurasi_persen, max_combo, status_sertifikat, waktu_bermain) VALUES
(1, 1, 'Aditya Pratama', 1420, 92, 7, 'diklaim', NOW() - INTERVAL '2 hours'),
(2, 1, 'Siti Nur Aisyah', 1280, 85, 5, 'diklaim', NOW() - INTERVAL '1 hours'),
(3, 1, 'Rian Hidayat', 940, 71, 3, 'belum_klaim', NOW() - INTERVAL '40 minutes')
ON CONFLICT (id_hasil) DO NOTHING;
