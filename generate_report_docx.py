import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_background(cell, fill_hex):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def create_laporan():
    doc = docx.Document()

    # Setup Page Margins: A4, Left 3cm, Right 2.5cm, Top 2.5cm, Bottom 2.5cm
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.left_margin = Inches(1.18)   # 3 cm
    section.right_margin = Inches(0.98)  # 2.5 cm
    section.top_margin = Inches(0.98)    # 2.5 cm
    section.bottom_margin = Inches(0.98) # 2.5 cm

    # Base Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.line_spacing = 1.5
    normal_style.paragraph_format.space_after = Pt(4)

    # ----------------------------------------------------
    # COVER / SAMPUL
    # ----------------------------------------------------
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_header.add_run("UNIVERSITAS KUNINGAN\nFAKULTAS ILMU KOMPUTER\nPROGRAM STUDI S1 TEKNIK INFORMATIKA\n")
    r.font.bold = True
    r.font.size = Pt(14)
    r2 = p_header.add_run("Jalan Cut Nyak Dhien No. 36A, Cijoho, Kuningan, Jawa Barat 45513 | uniku.ac.id\n\n")
    r2.font.size = Pt(10)
    r2.font.italic = True

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t1 = p_title.add_run("LAPORAN PROYEK MATA KULIAH\nREKAYASA PERANGKAT LUNAK (TINFCW243408)\nTAHAP 1 – ANALISIS DAN PERANCANGAN\n\n")
    r_t1.font.bold = True
    r_t1.font.size = Pt(14)

    # Cover Info Table
    table_cover = doc.add_table(rows=8, cols=3)
    table_cover.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_cover.autofit = False

    cover_data = [
        ("Judul Proyek", ":", "Game Edukasi Pemilahan Sampah Interaktif Berbasis Web untuk Siswa SD (SIPILAH)"),
        ("Jalur Tema", ":", "Jalur B – Game Edukasi (T9)"),
        ("Kelompok", ":", "Kelompok 05 – SANY"),
        ("Anggota Tim", ":", "1. Salwa Hamdunah (20240810129) - Product Owner\n2. Novelia Audy Wijaya (20240810098) - Scrum Master\n3. Yeyen Ai Nurhidayati (20240810020) - Developer\n4. Arie Muhammad Syahrial (20240810091) - Developer"),
        ("Kelas / Rombel", ":", "TI-2024-B"),
        ("Mata Kuliah", ":", "Rekayasa Perangkat Lunak (TINFCW243408) – 3 sks"),
        ("Dosen Pengampu", ":", "Rio Andriyat Krisdiawan, S.Kom., M.Kom."),
        ("Periode Akademik", ":", "2026/2027 Ganjil")
    ]

    for idx, (lbl, sep, val) in enumerate(cover_data):
        row = table_cover.rows[idx]
        cell_lbl, cell_sep, cell_val = row.cells[0], row.cells[1], row.cells[2]
        cell_lbl.width = Inches(1.8)
        cell_sep.width = Inches(0.2)
        cell_val.width = Inches(4.2)
        
        p0 = cell_lbl.paragraphs[0]
        p0.add_run(lbl).bold = True
        p0.paragraph_format.line_spacing = 1.15
        
        p1 = cell_sep.paragraphs[0]
        p1.add_run(sep)
        p1.paragraph_format.line_spacing = 1.15
        
        p2 = cell_val.paragraphs[0]
        p2.add_run(val)
        p2.paragraph_format.line_spacing = 1.15

    doc.add_paragraph("\n\n")
    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_foot = p_foot.add_run("PROGRAM STUDI S1 TEKNIK INFORMATIKA\nFAKULTAS ILMU KOMPUTER – UNIVERSITAS KUNINGAN\n2026")
    r_foot.font.bold = True
    r_foot.font.size = Pt(12)

    doc.add_page_break()

    # Helper for Headings
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(text)
        r.font.bold = True
        r.font.size = Pt(14)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.font.bold = True
        r.font.size = Pt(12.5)
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(text)
        r.font.bold = True
        r.font.size = Pt(12)
        return p

    # ----------------------------------------------------
    # BAB I PENDAHULUAN
    # ----------------------------------------------------
    add_h1("BAB I   PENDAHULUAN")
    
    add_h2("1.1   Latar Belakang")
    doc.add_paragraph(
        "Pendidikan lingkungan hidup pada jenjang sekolah dasar memegang peranan fundamental dalam membentuk karakter dan pola perilaku peduli lingkungan sejak dini. "
        "Di Kabupaten Kuningan, khususnya pada dua instansi sekolah dasar mitra, yaitu SDN 1 Ciawilor (Jl. Raya Ciawilor, Kecamatan Ciawigebang) dan SDN 2 Ciawilor (Jl. Babakan Ciawilor No. 82), "
        "isu pengelolaan dan pemilahan sampah menjadi perhatian serius pihak sekolah. SDN 1 Ciawilor menjalankan program pembiasaan unggulan bernama SEMUTLIS (Sepuluh Menit Peduli Lingkungan Sekitar) "
        "yang diselipkan sekitar 10 menit pada awal mata pelajaran, sedangkan SDN 2 Ciawilor menekankan aturan pembiasaan disiplin membuang sampah pada tempatnya dengan sasaran utama siswa kelas awal (kelas 1–3 SD, rentang usia 6–8 tahun)."
    )
    doc.add_paragraph(
        "Meskipun program pembiasaan telah dicanangkan, pelaksanaan di lapangan masih menemui kendala signifikan. Proses edukasi sampah saat ini umumnya hanya disampaikan secara lisan (ceramah konvensional) "
        "oleh guru di sela-sela jam pelajaran Bahasa Indonesia atau Agama. Berdasarkan hasil wawancara awal dengan guru narahubung (Bapak Agung Febriyana, S.Pd. di SDN 1 Ciawilor dan Bapak Tris Mulyo Purnomo, S.Pd. di SDN 2 Ciawilor), "
        "terungkap fakta bahwa sekitar 65% siswa (lebih dari 30 siswa per kelas) masih sering keliru dalam memilah jenis sampah organik dan anorganik. "
        "Selain itu, daya fokus belajar anak usia 6–8 tahun terhadap metode ceramah satu arah hanya mampu bertahan sekitar 15–20 menit, setelah itu perhatian anak mudah teralihkan karena ketiadaan media peraga yang interaktif dan menarik."
    )
    doc.add_paragraph(
        "Kondisi ini menimbulkan dampak negatif yang nyata bagi lingkungan sekolah. Sampah plastik jajanan, sedotan, dan kantong kresek sering kali tercampur dengan sisa bekal makanan dan daun gugur, "
        "menyebabkan bau tidak sedap, menyumbat saluran drainase sekolah saat hujan turun, serta membebani petugas kebersihan sekolah yang terpaksa memilah ulang sampah yang telah tercampur di tempat penampungan sementara. "
        "Jika dibiarkan berlarut-larut tanpa intervensi teknologi edukatif, kebiasaan mencampur sampah ini akan mengkristal hingga anak beranjak dewasa, sehingga program mulia SEMUTLIS tidak mencapai hasil optimal."
    )
    doc.add_paragraph(
        "Sebagai bentuk solusi nyata rekayasa perangkat lunak, Kelompok 05 – SANY mengusulkan pengembangan \"SIPILAH (Sistem Pintar Peduli Sampah): Game Edukasi Pemilahan Sampah Interaktif Berbasis Web untuk Siswa SD\". "
        "Mengingat adanya aturan sekolah yang melarang siswa SD membawa handphone, game ini dirancang dengan pendekatan arsitektur khusus: Game Sesi Kelas Estafet (Turn-Based Classroom Mode) yang dioperasikan melalui laptop guru dan proyektor kelas. "
        "Game berbasis Three.js 3D ini menyajikan simulasi pemilahan sampah ke 4 kategori tong warna (Organik Hijau, Anorganik Kuning, B3 Merah, dan Daur Ulang Biru), dilengkapi narasi suara interaktif, sistem skor/combo, "
        "sertifikat penghargaan berfoto, serta dashboard guru yang otomatis merekap rapor ketuntasan pemahaman kelas secara objektif."
    )

    add_h2("1.2   Rumusan Masalah")
    doc.add_paragraph("Berdasarkan uraian latar belakang masalah di atas, rumusan masalah dalam proyek ini dirumuskan sebagai berikut:")
    doc.add_paragraph("1. Bagaimana merancang dan membangun game edukasi pemilahan sampah berbasis web 3D yang interaktif, menarik, dan sesuai dengan karakteristik psikomotorik siswa SD usia 6–8 tahun?")
    doc.add_paragraph("2. Bagaimana mengatasi batasan lapangan di mana siswa dilarang membawa handphone ke sekolah agar seluruh siswa tetap dapat berpartisipasi aktif dalam sesi pembelajaran pemilahan sampah?")
    doc.add_paragraph("3. Bagaimana merancang basis data relasional ternormalisasi (hingga 3NF) yang mampu mencatat log pemilahan per-item serta merekap skor dan akurasi bermain siswa secara otomatis?")
    doc.add_paragraph("4. Bagaimana menyediakan antarmuka Dashboard Guru yang memudahkan pendidik mitra (SDN 1 dan SDN 2 Ciawilor) memantau rapor ketuntasan pemahaman kelas dan mengidentifikasi jenis sampah yang paling sering salah dipilah?")

    add_h2("1.3   Tujuan Proyek")
    doc.add_paragraph("Sejalan dengan rumusan masalah di atas, tujuan dari proyek Rekayasa Perangkat Lunak ini adalah:")
    doc.add_paragraph("1. Menghasilkan spesifikasi kebutuhan, mekanik permainan 3D (Three.js), dan game edukasi web interaktif yang tervalidasi oleh guru dan siswa mitra.")
    doc.add_paragraph("2. Menerapkan arsitektur Sesi Kelas Estafet (Turn-Based Mode 60 detik) pada 1 unit laptop guru yang terhubung ke proyektor kelas, sehingga pembelajaran interaktif tetap terlaksana optimal tanpa mewajibkan siswa membawa handphone.")
    doc.add_paragraph("3. Membangun struktur basis data relasional 6 tabel ternormalisasi (3NF) dan data layer client-side (dbStore) yang andal dalam merekam hasil bermain dan log granular pemilahan sampah.")
    doc.add_paragraph("4. Membangun Dashboard Penilaian Guru yang dilengkapi visualisasi KPI analisis ketuntasan kelas, fitur ekspor rapor ke format CSV, pencetakan sertifikat digital berstempel SEMUTLIS, dan manajemen bank item sampah (CRUD).")

    add_h2("1.4   Keterkaitan dengan SDGs dan Tujuan Pembelajaran (Jalur B)")
    doc.add_paragraph(
        "Proyek ini memilih Jalur B (Game Edukasi - Kode Tema T9). Secara langsung, proyek ini mendukung pencapaian Tujuan Pembangunan Berkelanjutan (Sustainable Development Goals / SDGs), yaitu:\n"
        "• SDG 4 (Pendidikan Berkualitas): Menyediakan media pembelajaran digital gamifikasi yang inklusif, menyenangkan, dan efektif bagi siswa sekolah dasar.\n"
        "• SDG 11 (Kota dan Pemukiman yang Berkelanjutan): Membentuk budaya peduli lingkungan dan kebersihan sejak usia dini di lingkungan komunitas sekolah desa.\n"
        "• SDG 12 (Konsumsi dan Produksi yang Bertanggung Jawab): Menanamkan literasi pemilahan sampah dari sumbernya, khususnya pengurangan dan penanganan sampah plastik sekali pakai."
    )
    doc.add_paragraph(
        "Tujuan Pembelajaran Khusus:\n"
        "• Sasaran Pemain: Siswa kelas 1–3 Sekolah Dasar (rentang usia 6–8 tahun) di SDN 1 Ciawilor dan SDN 2 Ciawilor.\n"
        "• Kompetensi yang Dilatih: Kemampuan membedakan sifat material sampah serta menempatkannya pada 4 kategori tong sampah yang benar (Organik, Anorganik, B3 Berbahaya, dan Daur Ulang).\n"
        "• Pengukuran Ketercapaian: Tingkat kompetensi diukur melalui persentase akurasi pilah (Benar / Total Percobaan × 100%), perolehan skor combo, serta predikat pemahaman sistem (Sangat Paham jika akurasi ≥ 80%, Cukup Paham 60–79%, dan Perlu Bimbingan jika < 60%)."
    )

    add_h2("1.5   Ruang Lingkup dan Batasan")
    doc.add_paragraph("Ruang Lingkup (Fitur dan Proses yang Dikerjakan):")
    doc.add_paragraph("1. Simulasi pemilahan sampah 3D interaktif menggunakan Three.js dengan 16 variasi item sampah realistis (terfokus pada sampah jajanan plastik sekolah, organik sisa makanan, B3 baterai/lampu, dan kardus daur ulang).")
    doc.add_paragraph("2. Mekanisme permainan turn-based berdurasi 60 detik per giliran siswa dengan kontrol mouse/touch ramah anak (Klik Sampah ➡ Klik Tong).")
    doc.add_paragraph("3. Slide edukasi pre-game interaktif yang memuat pengantar program SEMUTLIS dan video edukasi dampak sampah.")
    doc.add_paragraph("4. Generator sertifikat digital otomatis (HTML5 Canvas 2D) yang memuat nama siswa, skor, akurasi, stempel emas SEMUTLIS, tanda tangan narahubung kedua sekolah mitra, dan foto webcam siswa.")
    doc.add_paragraph("5. Dashboard Guru multi-tab mencakup Manajemen Sesi Kelas, Rapor Ketuntasan Siswa, Analisis Kesalahan Sampah, Ekspor CSV, dan CRUD Bank Sampah.")
    doc.add_paragraph("6. Sistem basis data relasional 6 tabel (3NF) dengan implementasi engine client-side (dbStore) yang bekerja offline maupun online via Vercel/GitHub Pages.")
    
    doc.add_paragraph("\nBatasan Proyek (Hal yang Tidak Termasuk dalam Pengerjaan):")
    doc.add_paragraph("1. Siswa tidak diwajibkan memiliki akun login individu maupun membawa smartphone ke sekolah (menggunakan nama langsung di akhir sesi permainan).")
    doc.add_paragraph("2. Aplikasi tidak dibangun sebagai aplikasi native mobile (Play Store / App Store), melainkan Progressive Web App (PWA) berbasis web browser.")
    doc.add_paragraph("3. Sistem tidak mencakup transaksi keuangan bank sampah (seperti tabungan sampah uang tunai) karena fokus murni pada edukasi pemilahan di kelas.")
    doc.add_paragraph("4. Tidak menggunakan sistem sinkronisasi jaringan multi-device real-time (seperti WebSockets multiplayer room) demi mencegah ketergantungan sinyal internet di kelas yang dapat mengganggu jam belajar 10 menit.")

    # ----------------------------------------------------
    # BAB II ANALISIS KEBUTUHAN
    # ----------------------------------------------------
    add_h1("BAB II   ANALISIS KEBUTUHAN")
    
    add_h2("2.1   Gambaran Objek atau Mitra")
    doc.add_paragraph(
        "Objek mitra proyek ini adalah dua Sekolah Dasar Negeri yang berlokasi di Desa Ciawilor, Kecamatan Ciawigebang, Kabupaten Kuningan, Jawa Barat:\n"
        "1. SDN 1 Ciawilor: Berlokasi di Jl. Raya Ciawilor. Memiliki total 4 rombel sasaran (rata-rata 30 siswa per kelas) dan 4 guru kelas. Narahubung mitra adalah Bapak Agung Febriyana, S.Pd. "
        "Sekolah ini memiliki program kepedulian lingkungan aktif bernama SEMUTLIS yang diselipkan selama 10 menit sebelum jam pelajaran utama dimulai.\n"
        "2. SDN 2 Ciawilor: Berlokasi di Jl. Babakan Ciawilor No. 82. Memiliki 71 siswa sasaran pada fase awal (39 siswa kelas 1 dan 32 siswa kelas 2) dengan 2 guru pendamping. "
        "Narahubung mitra adalah Bapak Tris Mulyo Purnomo, S.Pd. Sekolah menerapkan aturan ketat larangan membawa handphone bagi siswa dan menyediakan fasilitas tempat sampah terpusat di halaman sekolah.\n"
        "Sarana TIK yang tersedia pada kedua sekolah mitra mencakup unit komputer operasional sekolah, laptop milik guru wali kelas, jaringan internet modem sekolah, serta perangkat proyektor LCD kelas."
    )

    add_h2("2.2   Proses yang Berjalan Saat Ini")
    doc.add_paragraph(
        "Alur proses edukasi dan pemilahan sampah yang saat ini berjalan di sekolah mitra dapat diuraikan sebagai berikut:\n"
        "1. Guru memulai jam masuk kelas dan membuka sesi 10 menit kegiatan lingkungan (SEMUTLIS).\n"
        "2. Guru memberikan nasihat atau ceramah lisan mengenai pentingnya membuang sampah pada tempatnya dan menjaga kebersihan laci meja.\n"
        "3. Siswa mendengarkan ceramah secara pasif tanpa adanya alat peraga interaktif yang memperlihatkan perbedaan jenis material sampah.\n"
        "4. Pada saat jam istirahat, siswa membeli makanan jajanan dan membuang bungkus plastik atau sisa makanan secara acak ke sembarang tempat sampah yang terdekat.\n"
        "5. Terjadi masalah penumpukan sampah yang bercampur antara organik basah dan plastik kering.\n"
        "6. Petugas kebersihan sekolah harus memilah ulang sampah yang kotor secara manual, dan guru harus menegur kembali siswa secara berulang pada hari berikutnya."
    )

    add_h2("2.3   Pemangku Kepentingan")
    doc.add_paragraph("Tabel 1 merangkum pihak-pihak yang terlibat dan berkepentingan terhadap sistem aplikasi.")
    
    # Table 1: Pemangku Kepentingan
    t1 = doc.add_table(rows=4, cols=4)
    t1.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["No", "Pihak", "Peran terhadap Aplikasi", "Kebutuhan Utama"]
    for i, h in enumerate(headers):
        cell = t1.rows[0].cells[i]
        set_cell_background(cell, "E2E8F0")
        p = cell.paragraphs[0]
        p.add_run(h).bold = True
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    data_t1 = [
        ("1", "Siswa SD (Kelas 1–3)", "Pengguna Akhir (Pemain Game)", "Game 3D yang seru, kontrol mudah tanpa teks sulit, efek suara ceria, dan reward sertifikat bergambar."),
        ("2", "Guru Wali Kelas", "Fasilitator & Evaluator Pembelajaran", "Kemudahan membuka sesi kelas di laptop/proyektor, login cepat, melihat rekap nilai pemahaman kelas, dan ekspor CSV."),
        ("3", "Pihak Sekolah & Petugas Kebersihan", "Penerima Manfaat Lingkungan", "Berkurangnya sampah yang tercampur di sekolah dan suksesnya program pembiasaan SEMUTLIS.")
    ]
    for r_idx, row_data in enumerate(data_t1):
        row = t1.rows[r_idx + 1]
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            p = cell.paragraphs[0]
            p.add_run(val)
            p.paragraph_format.line_spacing = 1.15
            if c_idx == 0: p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    add_h2("2.4   Kebutuhan Fungsional")
    doc.add_paragraph("Kebutuhan fungsional mendefinisikan kapabilitas dan fitur yang disediakan oleh sistem aplikasi (Tabel 2).")

    # Table 2: Kebutuhan Fungsional
    t2 = doc.add_table(rows=13, cols=3)
    t2.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers2 = ["Kode", "Kebutuhan Fungsional", "Pengguna"]
    for i, h in enumerate(headers2):
        cell = t2.rows[0].cells[i]
        set_cell_background(cell, "E2E8F0")
        p = cell.paragraphs[0]
        p.add_run(h).bold = True
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    data_t2 = [
        ("KF-01", "Aplikasi dapat menampilkan slide materi edukasi pre-game interaktif (4 jenis tong sampah & program SEMUTLIS).", "Siswa, Guru"),
        ("KF-02", "Aplikasi dapat menampilkan simulasi 3D interaktif objek sampah di meja permainan dan 4 tong sampah warna.", "Siswa"),
        ("KF-03", "Aplikasi dapat mendeteksi pemilihan objek sampah dan lemparan ke tong sampah tujuan secara raycasting 3D.", "Siswa"),
        ("KF-04", "Aplikasi dapat menghitung skor dinamis (+100 dasar + bonus combo) dan pengurangan nyawa saat salah pilah.", "Sistem"),
        ("KF-05", "Aplikasi dapat memunculkan jendela dialog umpan balik edukatif saat siswa salah memasukkan sampah.", "Siswa"),
        ("KF-06", "Aplikasi dapat mencatat log granular per-lemparan sampah (id_item, tong dipilih, status benar/salah).", "Sistem"),
        ("KF-07", "Aplikasi dapat menginput nama siswa pada akhir permainan untuk disimpan ke dalam Sesi Kelas aktif.", "Siswa"),
        ("KF-08", "Aplikasi dapat mengambil foto wajah siswa via kamera webcam atau upload file untuk sertifikat.", "Siswa, Guru"),
        ("KF-09", "Aplikasi dapat mencetak dan mengunduh sertifikat penghargaan digital dalam format gambar PNG.", "Siswa, Guru"),
        ("KF-10", "Aplikasi dapat memvalidasi login akun guru (termasuk tombol Quick Demo Login Pak Agung & Pak Tris).", "Guru"),
        ("KF-11", "Aplikasi dapat mengelola Sesi Kelas Estafet (buat sesi baru, aktivasi sesi, penutupan sesi, dan hapus).", "Guru"),
        ("KF-12", "Aplikasi dapat menampilkan Rapor Ketuntasan Kelas (KPI, rekap nilai siswa, log kesalahan, dan ekspor CSV).", "Guru")
    ]
    for r_idx, row_data in enumerate(data_t2):
        row = t2.rows[r_idx + 1]
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            p = cell.paragraphs[0]
            p.add_run(val)
            p.paragraph_format.line_spacing = 1.15
            if c_idx == 0: p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    add_h2("2.5   Kebutuhan Non-Fungsional")
    doc.add_paragraph("Kebutuhan non-fungsional mencakup atribut kualitas, performa, keamanan, dan keandalan sistem (Tabel 3).")

    # Table 3: Kebutuhan Non-Fungsional
    t3 = doc.add_table(rows=7, cols=3)
    t3.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers3 = ["Kode", "Aspek", "Kebutuhan Spesifik"]
    for i, h in enumerate(headers3):
        cell = t3.rows[0].cells[i]
        set_cell_background(cell, "E2E8F0")
        p = cell.paragraphs[0]
        p.add_run(h).bold = True
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    data_t3 = [
        ("KNF-01", "Usability (Kemudahan)", "Antarmuka menggunakan font Fredoka & Outfit berukuran besar, palet warna ceria, ikon visual, dan instruksi suara yang ramah untuk anak usia 6–8 tahun."),
        ("KNF-02", "Performance (Kecepatan)", "Game 3D mampu berjalan stabil minimal pada 30–60 FPS pada spesifikasi laptop standar guru tanpa memerlukan kartu grafis (GPU) diskrit."),
        ("KNF-03", "Portability (Aksesibilitas)", "Dapat diakses langsung melalui peramban modern (Chrome, Edge, Firefox) secara online via Vercel/GitHub Pages maupun offline lokal."),
        ("KNF-04", "Reliability (Keandalan)", "Menggunakan penyimpanan data client-side (LocalStorage dbStore) yang menjamin seluruh data sesi kelas tersimpan aman meski koneksi internet sekolah terputus."),
        ("KNF-05", "Responsiveness", "Tata letak tampilan layar menyesuaikan secara dinamis untuk proyeksi layar monitor laptop guru (rasio 16:9) maupun layar proyektor LCD kelas."),
        ("KNF-06", "Security (Keamanan)", "Menu pengelolaan sesi dan bank soal dilindungi oleh otentikasi login guru sehingga tidak dapat diubah sembarangan oleh siswa.")
    ]
    for r_idx, row_data in enumerate(data_t3):
        row = t3.rows[r_idx + 1]
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            p = cell.paragraphs[0]
            p.add_run(val)
            p.paragraph_format.line_spacing = 1.15
            if c_idx == 0: p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    add_h2("2.6   Diagram Use Case")
    doc.add_paragraph(
        "Diagram use case menggambarkan interaksi antara dua aktor utama (Siswa SD dan Guru Kelas) terhadap fungsionalitas sistem SIPILAH.\n\n"
        "Aktor Siswa SD memiliki use case: Mempelajari Slide Edukasi, Memainkan Game Pemilahan 3D (termasuk melempar sampah, melihat feedback salah), Mengisi Nama Hasil Bermain, dan Mengklaim Sertifikat Digital.\n"
        "Aktor Guru Kelas memiliki use case: Login Sistem, Mengelola Sesi Kelas Estafet, Melihat Rapor Ketuntasan Siswa, Mengunduh Rekap CSV, dan Mengelola Bank Sampah 3D."
    )

    add_h2("2.7   Deskripsi Use Case Utama")
    doc.add_paragraph("Deskripsi rinci use case utama \"Memainkan Simulasi Pemilahan Sampah 3D dan Menyimpan Hasil\" disajikan pada Tabel 4.")

    # Table 4: Deskripsi Use Case
    t4 = doc.add_table(rows=8, cols=2)
    t4.alignment = WD_TABLE_ALIGNMENT.CENTER
    uc_details = [
        ("Nama Use Case", "Memainkan Simulasi Pemilahan Sampah 3D & Mencatat Nilai Sesi"),
        ("Aktor", "Siswa SD (Pemain) dan Sistem SIPILAH"),
        ("Deskripsi Singkat", "Siswa memilah item sampah 3D yang muncul di meja permainan ke salah satu dari 4 tong sampah warna selama 60 detik, lalu menyimpan skor ke sesi kelas aktif."),
        ("Kondisi Awal (Pre-condition)", "Guru telah mengaktifkan Sesi Kelas di laptop. Game berada pada layar siap main."),
        ("Kondisi Akhir (Post-condition)", "Skor akhir, akurasi, combo, dan seluruh log aksi pilah tersimpan ke tb_hasil_bermain & tb_log_pemilahan. Siswa dapat mencetak sertifikat."),
        ("Alur Utama (Normal Flow)", "1. Siswa menekan tombol Mulai Main.\n2. Sistem memunculkan item sampah 3D acak di meja dan memulai hitung mundur 60 detik.\n3. Siswa mengklik sampah untuk mengambilnya (item terangkat).\n4. Siswa mengklik salah satu tong sampah tujuan.\n5. Sistem memutar animasi lemparan parabolik dan memeriksa kesesuaian kategori.\n6. Jika benar: sistem menambah skor (+100 + combo), memutar suara sukses, dan efek konfeti.\n7. Jika salah: nyawa berkurang 1 dan muncul popup tips edukasi.\n8. Waktu 60 detik habis: sistem menampilkan layar Game Over berisi skor dan akurasi.\n9. Siswa mengetikkan nama lengkap dan mengklik Simpan Skor & Dapatkan Sertifikat.\n10. Sistem menyimpan data ke basis data lokal dan menampilkan kanvas sertifikat siap unduh."),
        ("Alur Alternatif (Alternative Flow)", "Jika siswa kehabisan 3 nyawa sebelum waktu 60 detik habis, permainan langsung berakhir dan diarahkan ke layar Game Over untuk pencatatan nilai.")
    ]
    for r_idx, (sec, val) in enumerate(uc_details):
        row = t4.rows[r_idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.0)
        c1.width = Inches(4.5)
        set_cell_background(c0, "F1F5F9")
        p0 = c0.paragraphs[0]
        p0.add_run(sec).bold = True
        p1 = c1.paragraphs[0]
        p1.add_run(val)
        p1.paragraph_format.line_spacing = 1.15

    # ----------------------------------------------------
    # BAB III PERANCANGAN BASIS DATA
    # ----------------------------------------------------
    add_h1("BAB III   PERANCANGAN BASIS DATA")
    
    add_h2("3.1   Entity Relationship Diagram (ERD)")
    doc.add_paragraph(
        "Perancangan basis data SIPILAH terdiri dari 6 entitas yang saling berelasi secara terstruktur:\n"
        "1. tb_guru (1) ─── (N) tb_sesi_kelas: Satu guru mengelola banyak sesi kelas.\n"
        "2. tb_sesi_kelas (1) ─── (N) tb_hasil_bermain: Satu sesi kelas menampung hasil bermain banyak siswa.\n"
        "3. tb_hasil_bermain (1) ─── (N) tb_log_pemilahan: Satu hasil bermain memiliki banyak catatan log lemparan.\n"
        "4. tb_kategori_sampah (1) ─── (N) tb_item_sampah: Satu kategori menaungi banyak variasi item sampah 3D.\n"
        "5. tb_item_sampah (1) ─── (N) tb_log_pemilahan: Satu jenis sampah dapat muncul di banyak log permainan.\n"
        "6. tb_kategori_sampah (1) ─── (N) tb_log_pemilahan: Kategori tong yang dipilih siswa dicatat sebagai referensi."
    )

    add_h2("3.2   Normalisasi Bertahap (UNF → 1NF → 2NF → 3NF)")
    doc.add_paragraph(
        "Proses normalisasi dilakukan bertahap berdasarkan data mentah rekapitulasi penilaian kelas SDN Ciawilor guna menghilangkan anomali penyisipan, pembaruan, dan penghapusan:\n\n"
        "1. Bentuk Tidak Normal (UNF):\n"
        "Data form mentah memuat atribut berulang (repeating groups) pada rincian sampah yang dipilah siswa:\n"
        "UNF = { KodeSesi, NamaKelas, TanggalSesi, NamaGuru, AsalSekolah, NamaSiswa, SkorAkhir, Akurasi, (NamaItem, KategoriBenar, WarnaTong, TongDipilih, IsBenar, PesanEdukasi) }\n\n"
        "2. Bentuk Normal Pertama (1NF):\n"
        "Repeating groups dihilangkan sehingga setiap sel berisi nilai skalar atomik tunggal. Kunci komposit ditentukan:\n"
        "1NF = { KodeSesi*, NamaSiswa*, NamaItem*, NamaKelas, TanggalSesi, NamaGuru, AsalSekolah, SkorAkhir, Akurasi, KategoriBenar, WarnaTong, TongDipilih, IsBenar, PesanEdukasi }\n"
        "Masalah pada 1NF: Terjadi Ketergantungan Parsial (Partial Functional Dependency), di mana atribut sesi hanya bergantung pada KodeSesi, atribut siswa bergantung pada NamaSiswa, dan atribut sampah bergantung pada NamaItem.\n\n"
        "3. Bentuk Normal Kedua (2NF):\n"
        "Menghilangkan ketergantungan parsial dengan mendekomposisi tabel menjadi 4 entitas fungsional: tb_sesi_kelas, tb_hasil_bermain, tb_item_sampah, dan tb_log_pemilahan. Seluruh atribut non-kunci kini bergantung penuh pada primary key masing-masing.\n"
        "Masalah pada 2NF: Masih terdapat Ketergantungan Transitif (Transitive Dependency) antar-atribut non-kunci, misalnya: id_sesi ➡ id_guru ➡ asal_sekolah, serta id_item ➡ nama_kategori ➡ warna_tong.\n\n"
        "4. Bentuk Normal Ketiga (3NF):\n"
        "Menghilangkan ketergantungan transitif dengan memisahkan master guru (tb_guru) dan master kategori tong (tb_kategori_sampah). Hasil akhir 3NF menghasilkan 6 tabel yang bersih, efisien, dan bebas anomali modifikasi."
    )

    add_h2("3.3   Struktur Tabel (Kamus Data)")
    doc.add_paragraph("Kamus data mendefinisikan tipe data, panjang kolom, dan batasan integritas untuk ke-6 tabel basis data:")

    # Add 6 Data Dictionary Tables
    tables_spec = [
        ("tb_guru (Data Akun Guru Mitra)", [
            ("id_guru", "INT(11)", "PK", "Tidak", "AUTO_INCREMENT ID guru"),
            ("nama_guru", "VARCHAR(100)", "-", "Tidak", "Nama lengkap pendidik mitra"),
            ("asal_sekolah", "VARCHAR(100)", "-", "Tidak", "SDN 1 Ciawilor / SDN 2 Ciawilor"),
            ("username", "VARCHAR(50)", "UNIQUE", "Tidak", "Username login unik"),
            ("password", "VARCHAR(255)", "-", "Tidak", "Kata sandi login guru"),
            ("created_at", "TIMESTAMP", "-", "Ya", "Waktu pencatatan akun")
        ]),
        ("tb_sesi_kelas (Data Sesi Kelas Estafet)", [
            ("id_sesi", "INT(11)", "PK", "Tidak", "AUTO_INCREMENT ID sesi"),
            ("id_guru", "INT(11)", "FK", "Tidak", "Referensi ke tb_guru.id_guru"),
            ("kode_sesi", "VARCHAR(20)", "UNIQUE", "Tidak", "Kode unik sesi (misal: CIAWI-2A)"),
            ("nama_kelas", "VARCHAR(100)", "-", "Tidak", "Nama rombel & program sekolah"),
            ("tanggal_sesi", "DATE", "-", "Tidak", "Tanggal sesi kelas dijalankan"),
            ("status_sesi", "ENUM('aktif','selesai')", "-", "Tidak", "Status sesi aktif/selesai"),
            ("created_at", "TIMESTAMP", "-", "Ya", "Waktu sesi dibuat")
        ]),
        ("tb_kategori_sampah (Data Master 4 Kategori Tong)", [
            ("id_kategori", "INT(11)", "PK", "Tidak", "ID kategori sampah (1..4)"),
            ("nama_kategori", "VARCHAR(50)", "-", "Tidak", "Organik, Anorganik, B3, Daur Ulang"),
            ("warna_tong", "VARCHAR(30)", "-", "Tidak", "Warna tong (Hijau, Kuning, Merah, Biru)"),
            ("deskripsi_singkat", "TEXT", "-", "Tidak", "Karakteristik jenis sampah")
        ]),
        ("tb_item_sampah (Bank Sampah 3D & Edukasi)", [
            ("id_item", "INT(11)", "PK", "Tidak", "ID unik item sampah"),
            ("id_kategori", "INT(11)", "FK", "Tidak", "Kategori tong yang benar (FK)"),
            ("nama_item", "VARCHAR(100)", "-", "Tidak", "Nama benda sampah 3D"),
            ("kode_model_3d", "VARCHAR(50)", "-", "Tidak", "Key aset 3D (misal: gltf_bottle)"),
            ("poin_dasar", "INT(11)", "-", "Tidak", "Poin dasar (default: 100)"),
            ("pesan_edukasi_salah", "TEXT", "-", "Tidak", "Tips penjelasan jika salah pilah")
        ]),
        ("tb_hasil_bermain (Rekap Nilai Giliran Siswa)", [
            ("id_hasil", "INT(11)", "PK", "Tidak", "ID hasil giliran main"),
            ("id_sesi", "INT(11)", "FK", "Tidak", "Referensi ke tb_sesi_kelas.id_sesi"),
            ("nama_siswa", "VARCHAR(100)", "-", "Tidak", "Nama lengkap siswa"),
            ("skor_akhir", "INT(11)", "-", "Tidak", "Total skor perolehan"),
            ("akurasi_persen", "INT(11)", "-", "Tidak", "Persentase akurasi (0-100%)"),
            ("max_combo", "INT(11)", "-", "Tidak", "Rekor combo tertinggi"),
            ("status_sertifikat", "ENUM('diklaim','belum_klaim')", "-", "Tidak", "Status cetak sertifikat"),
            ("waktu_bermain", "DATETIME", "-", "Tidak", "Waktu selesai bermain")
        ]),
        ("tb_log_pemilahan (Log Granular Per-Aksi Pilah)", [
            ("id_log", "INT(11)", "PK", "Tidak", "ID unik log aksi"),
            ("id_hasil", "INT(11)", "FK", "Tidak", "Referensi ke tb_hasil_bermain"),
            ("id_item", "INT(11)", "FK", "Tidak", "Sampah yang dilempar (FK)"),
            ("id_kategori_dipilih", "INT(11)", "FK", "Tidak", "Tong sampah yang dipilih (FK)"),
            ("is_benar", "TINYINT(1)", "-", "Tidak", "1 jika benar, 0 jika salah"),
            ("created_at", "TIMESTAMP", "-", "Ya", "Waktu aksi lempar dieksekusi")
        ])
    ]

    for t_title, cols in tables_spec:
        add_h3(f"Tabel: {t_title}")
        tbl = doc.add_table(rows=len(cols)+1, cols=5)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        h_cols = ["Nama Kolom", "Tipe Data", "Kunci", "Null", "Keterangan"]
        for ci, ch in enumerate(h_cols):
            c = tbl.rows[0].cells[ci]
            set_cell_background(c, "E2E8F0")
            p = c.paragraphs[0]
            p.add_run(ch).bold = True
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for ri, rdata in enumerate(cols):
            r = tbl.rows[ri+1]
            for ci, val in enumerate(rdata):
                p = r.cells[ci].paragraphs[0]
                p.add_run(val)
                p.paragraph_format.line_spacing = 1.15
                if ci in [0, 2, 3]: p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    add_h2("3.4   Skrip Pembuatan Basis Data (DDL MySQL)")
    doc.add_paragraph("Skrip DDL MySQL telah diuji dan disimpan pada berkas terpisah database/db_pilah_sampah.sql. Perintah pembuatan skema basis data secara lengkap:")
    
    p_code = doc.add_paragraph()
    p_code.paragraph_format.line_spacing = 1.0
    r_code = p_code.add_run(
        "CREATE DATABASE IF NOT EXISTS db_pilah_sampah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n"
        "USE db_pilah_sampah;\n\n"
        "CREATE TABLE tb_guru (\n"
        "  id_guru INT AUTO_INCREMENT PRIMARY KEY,\n"
        "  nama_guru VARCHAR(100) NOT NULL,\n"
        "  asal_sekolah VARCHAR(100) NOT NULL,\n"
        "  username VARCHAR(50) NOT NULL UNIQUE,\n"
        "  password VARCHAR(255) NOT NULL,\n"
        "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n"
        "CREATE TABLE tb_sesi_kelas (\n"
        "  id_sesi INT AUTO_INCREMENT PRIMARY KEY,\n"
        "  id_guru INT NOT NULL,\n"
        "  kode_sesi VARCHAR(20) NOT NULL UNIQUE,\n"
        "  nama_kelas VARCHAR(100) NOT NULL,\n"
        "  tanggal_sesi DATE NOT NULL,\n"
        "  status_sesi ENUM('aktif', 'selesai') DEFAULT 'aktif',\n"
        "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n"
        "  CONSTRAINT fk_sesi_guru FOREIGN KEY (id_guru) REFERENCES tb_guru (id_guru) ON DELETE CASCADE\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n"
        "CREATE TABLE tb_kategori_sampah (\n"
        "  id_kategori INT AUTO_INCREMENT PRIMARY KEY,\n"
        "  nama_kategori VARCHAR(50) NOT NULL,\n"
        "  warna_tong VARCHAR(30) NOT NULL,\n"
        "  deskripsi_singkat TEXT NOT NULL\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n"
        "CREATE TABLE tb_item_sampah (\n"
        "  id_item INT AUTO_INCREMENT PRIMARY KEY,\n"
        "  id_kategori INT NOT NULL,\n"
        "  nama_item VARCHAR(100) NOT NULL,\n"
        "  kode_model_3d VARCHAR(50) NOT NULL,\n"
        "  poin_dasar INT NOT NULL DEFAULT 100,\n"
        "  pesan_edukasi_salah TEXT NOT NULL,\n"
        "  CONSTRAINT fk_item_kategori FOREIGN KEY (id_kategori) REFERENCES tb_kategori_sampah (id_kategori) ON DELETE CASCADE\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n"
        "CREATE TABLE tb_hasil_bermain (\n"
        "  id_hasil INT AUTO_INCREMENT PRIMARY KEY,\n"
        "  id_sesi INT NOT NULL,\n"
        "  nama_siswa VARCHAR(100) NOT NULL,\n"
        "  skor_akhir INT NOT NULL DEFAULT 0,\n"
        "  akurasi_persen INT NOT NULL DEFAULT 0,\n"
        "  max_combo INT NOT NULL DEFAULT 0,\n"
        "  status_sertifikat ENUM('diklaim', 'belum_klaim') DEFAULT 'belum_klaim',\n"
        "  waktu_bermain DATETIME NOT NULL,\n"
        "  CONSTRAINT fk_hasil_sesi FOREIGN KEY (id_sesi) REFERENCES tb_sesi_kelas (id_sesi) ON DELETE CASCADE\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n"
        "CREATE TABLE tb_log_pemilahan (\n"
        "  id_log INT AUTO_INCREMENT PRIMARY KEY,\n"
        "  id_hasil INT NOT NULL,\n"
        "  id_item INT NOT NULL,\n"
        "  id_kategori_dipilih INT NOT NULL,\n"
        "  is_benar TINYINT(1) NOT NULL DEFAULT 0,\n"
        "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n"
        "  CONSTRAINT fk_log_hasil FOREIGN KEY (id_hasil) REFERENCES tb_hasil_bermain (id_hasil) ON DELETE CASCADE,\n"
        "  CONSTRAINT fk_log_item FOREIGN KEY (id_item) REFERENCES tb_item_sampah (id_item) ON DELETE CASCADE,\n"
        "  CONSTRAINT fk_log_kategori FOREIGN KEY (id_kategori_dipilih) REFERENCES tb_kategori_sampah (id_kategori) ON DELETE CASCADE\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
    )
    r_code.font.name = 'Consolas'
    r_code.font.size = Pt(9.5)

    # ----------------------------------------------------
    # BAB IV PERANCANGAN ANTARMUKA
    # ----------------------------------------------------
    add_h1("BAB IV   PERANCANGAN ANTARMUKA")
    
    add_h2("4.1   Struktur Menu dan Hak Akses")
    doc.add_paragraph(
        "Aplikasi SIPILAH memiliki dua tingkat hak akses yang disesuaikan dengan peran aktor di lingkungan sekolah:\n\n"
        "1. Jalur Siswa (Publik / Tanpa Login Akun):\n"
        "   ├── Menu Utama (Informasi Sesi Aktif, Tombol Mulai Main, Pelajari Sampah, Papan Skor)\n"
        "   ├── Layar Edukasi Pre-Game (5 Slide Materi SEMUTLIS & 4 Tong Sampah)\n"
        "   ├── Arena Gameplay 3D (HUD Skor, Timer 60s, Nyawa, 4 Tong Warna, Dialog Tips Edukasi)\n"
        "   ├── Layar Game Over & Klaim Sertifikat (Input Nama Siswa, Foto Webcam, Cetak PNG)\n"
        "   └── Modal Papan Skor Kelas (Peringkat 20 Besar Sesi Aktif)\n\n"
        "2. Jalur Guru Kelas (Memerlukan Otentikasi Login):\n"
        "   └── Dashboard Penilaian Guru\n"
        "       ├── Tab 1: Manajemen Sesi Kelas (Buat Sesi Rombel, Aktivasi Sesi, Tutup Sesi)\n"
        "       ├── Tab 2: Rapor & Analisis Pemahaman Siswa (KPI Kelas, Rekap Nilai, Detail Log Pilah, Ekspor CSV)\n"
        "       └── Tab 3: Manajemen Bank Item Sampah 3D (Tambah, Edit, Hapus Variasi Sampah & Pesan Edukasi)"
    )

    add_h2("4.2   Rancangan Form (Mockup Tampilan)")
    doc.add_paragraph(
        "Seluruh antarmuka dirancang responsif menggunakan rasio aspek 16:9 beresolusi tinggi dengan tipografi ramah anak (Fredoka & Outfit). Rancangan form utama meliputi:\n"
        "1. Form Menu Utama: Memuat identitas pengembang Kelompok 05 – SANY UNIKU, badge kemitraan SDN 1 & SDN 2 Ciawilor, badge Sesi Kelas Aktif, tombol Mulai Main, dan tombol akses Mode Guru.\n"
        "2. Form Gameplay 3D: Menampilkan meja tempat sampah 3D, 4 tong sampah berlabel visual besar di bagian atas, banner target klik di bawah, dan dialog tips edukasi non-blocking saat terjadi kesalahan.\n"
        "3. Form Game Over & Sertifikat: Menampilkan kartu ringkasan skor akhir, akurasi %, combo, kolom nama siswa, preview foto wajah webcam, dan kanvas sertifikat digital berstempel resmi SEMUTLIS.\n"
        "4. Form Login Guru: Dilengkapi fitur inovatif Quick Demo Login (Pak Agung SDN 1 / Pak Tris SDN 2) guna mempermudah demonstrasi dan asesmen lapangan tanpa hambatan pengetikan kredensial.\n"
        "5. Form Dashboard Guru: Antarmuka berbasis tab modern memuat formulir pembuatan sesi rombel, 4 kartu KPI analisis kesalahan sampah, tabel nilai siswa, dan modal rincian log jawaban per butir sampah."
    )

    add_h2("4.3   Pemetaan Form terhadap Tabel Basis Data")
    doc.add_paragraph("Tabel 6 membuktikan bahwa seluruh form antarmuka terhubung secara konsisten dengan tabel-tabel basis data relasional.")

    # Table 6: Pemetaan Form
    t6 = doc.add_table(rows=11, cols=4)
    t6.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers6 = ["Nama Form / Layar", "Tabel yang Diakses", "Operasi CRUD", "Kebutuhan Terkait"]
    for i, h in enumerate(headers6):
        cell = t6.rows[0].cells[i]
        set_cell_background(cell, "E2E8F0")
        p = cell.paragraphs[0]
        p.add_run(h).bold = True
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    data_t6 = [
        ("Layar Menu Utama", "tb_sesi_kelas", "READ", "Menampilkan status kode sesi kelas yang aktif."),
        ("Layar Edukasi Pre-Game", "tb_kategori_sampah", "READ", "Menampilkan materi 4 jenis tong sampah."),
        ("Arena Gameplay 3D", "tb_item_sampah, tb_kategori_sampah", "READ", "Mengambil deck model 3D sampah untuk disortir."),
        ("Dialog Evaluasi Lemparan", "tb_item_sampah", "READ", "Menampilkan narasi edukasi jika tong salah."),
        ("Layar Game Over & Simpan", "tb_hasil_bermain, tb_log_pemilahan", "CREATE, READ", "Menyimpan capaian siswa dan log granular aksi."),
        ("Modal Papan Skor Kelas", "tb_hasil_bermain, tb_sesi_kelas", "READ", "Menampilkan peringkat 20 besar sesi aktif."),
        ("Modal Login Guru", "tb_guru", "READ", "Validasi username dan password guru mitra."),
        ("Dashboard Tab 1: Sesi Kelas", "tb_sesi_kelas, tb_guru", "CREATE, READ, UPDATE, DELETE", "Pengelolaan sesi rombongan belajar siswa."),
        ("Dashboard Tab 2: Rapor Siswa", "tb_hasil_bermain, tb_log_pemilahan", "READ", "Perhitungan agregasi KPI kelas & ekspor CSV."),
        ("Dashboard Tab 3: Bank Sampah", "tb_item_sampah, tb_kategori_sampah", "CREATE, READ, UPDATE, DELETE", "Manajemen bank item soal sampah 3D.")
    ]
    for r_idx, row_data in enumerate(data_t6):
        row = t6.rows[r_idx + 1]
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            p = cell.paragraphs[0]
            p.add_run(val)
            p.paragraph_format.line_spacing = 1.15
            if c_idx in [0, 2]: p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # ----------------------------------------------------
    # BAB V JADWAL PENGERJAAN PROYEK
    # ----------------------------------------------------
    add_h1("BAB V   JADWAL PENGERJAAN PROYEK")
    
    add_h2("5.1   Rencana Kerja per Pertemuan")
    doc.add_paragraph("Jadwal pengerjaan proyek dari pertemuan ke-5 hingga ke-15 disusun selaras dengan metodologi GDLC (Game Development Life Cycle) yang dipadukan dengan Sprint Scrum 2 mingguan (Tabel 7).")

    # Table 7: Jadwal
    t7 = doc.add_table(rows=12, cols=4)
    t7.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers7 = ["Pertemuan", "Rencana Kegiatan (Fase GDLC / Sprint)", "Target Luaran", "Status"]
    for i, h in enumerate(headers7):
        cell = t7.rows[0].cells[i]
        set_cell_background(cell, "E2E8F0")
        p = cell.paragraphs[0]
        p.add_run(h).bold = True
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    data_t7 = [
        ("P-05", "Pengumpulan Laporan Tahap 1, asistensi DDL & prototipe antarmuka.", "Dokumen Tahap 1 & Skrip SQL tervalidasi.", "Selesai"),
        ("P-06", "Sprint 1: Optimalisasi aset 3D low-poly & konversi base64 JSON offline.", "16 model 3D sampah siap load cepat.", "Terjadwal"),
        ("P-07", "Sprint 1: Penyempurnaan animasi parabolik & audio sfx ramah anak.", "Mekanik throw Three.js mulus 60 FPS.", "Terjadwal"),
        ("P-08", "Sprint 2: Integrasi modul dbStore dengan UI Dashboard Guru & Rapor.", "Fitur sesi estafet dan rapor kelas teruji.", "Terjadwal"),
        ("P-09", "Sprint 2: Pembuatan modul ekspor CSV & canvas generator sertifikat.", "Fitur unduh CSV & sertifikat PNG siap.", "Terjadwal"),
        ("P-10", "Tenggat Tahap 2: Demonstrasi prototipe fungsional kepada dosen.", "Laporan Tahap 2 & demo playable web.", "Terjadwal"),
        ("P-11", "Sprint 3: Deployment PWA ke Vercel & pengujian responsiveness proyektor.", "Aplikasi live di URL publik Vercel.", "Terjadwal"),
        ("P-12", "Sprint 3: Kunjungan Playtesting I di SDN 1 Ciawilor (Program SEMUTLIS).", "Data hasil uji main 30 siswa kelas 2A.", "Terjadwal"),
        ("P-13", "Sprint 4: Kunjungan Playtesting II di SDN 2 Ciawilor (Kelas 1–2).", "Umpan balik UAT guru (Pak Agung & Pak Tris).", "Terjadwal"),
        ("P-14", "Sprint 4: Evaluasi SUS (System Usability Scale) & perbaikan akhir bug.", "Hasil uji kegunaan & validasi mitra.", "Terjadwal"),
        ("P-15", "Tenggat Tahap 3: Presentasi Laporan Akhir, video demo, & serah terima.", "Laporan Akhir RPL & HAKI Proyek.", "Terjadwal")
    ]
    for r_idx, row_data in enumerate(data_t7):
        row = t7.rows[r_idx + 1]
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            p = cell.paragraphs[0]
            p.add_run(val)
            p.paragraph_format.line_spacing = 1.15
            if c_idx in [0, 3]: p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # ----------------------------------------------------
    # DAFTAR PUSTAKA
    # ----------------------------------------------------
    add_h1("DAFTAR PUSTAKA")
    
    daftar_pustaka = [
        "Kementerian Lingkungan Hidup dan Kehutanan Republik Indonesia. (2020). Rencana Strategis Pengelolaan Sampah Nasional 2020–2024. Kementerian LHK RI.",
        "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. (2022). Panduan Penerapan Karakter Peduli Lingkungan pada Satuan Pendidikan Dasar. Kemendikbudristek RI.",
        "Pressman, R. S., & Maxim, B. R. (2019). Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill Education.",
        "Ramadan, R., & Widyani, Y. (2013). Game Development Life Cycle Guidelines. In 2013 International Conference on Advanced Computer Science and Information Systems (ICACSIS) (pp. 95–100). IEEE.",
        "Schwaber, K., & Sutherland, J. (2020). The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game. Scrum.org.",
        "Sommerville, I. (2016). Software Engineering (10th ed.). Pearson Education."
    ]
    for pustaka in daftar_pustaka:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.first_line_indent = Inches(-0.5)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(4)
        p.add_run(pustaka)

    # Save to disk
    out_path = "Laporan_Tahap1_Kelompok05_SANY.docx"
    doc.save(out_path)
    print(f"File {out_path} created successfully!")

if __name__ == '__main__':
    create_laporan()
