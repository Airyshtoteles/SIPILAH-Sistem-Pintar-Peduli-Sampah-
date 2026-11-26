/* ==========================================================================
   EduSlides.js - Interactive Pre-Game Education Deck
   Konteks: SDN 1 & SDN 2 Ciawilor | Program SEMUTLIS & Pembiasaan Disiplin SD
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   ========================================================================== */

(function() {
  const eduSlidesData = [
    {
      id: 1,
      tag: "Masalah Sampah Sekolah",
      tagType: "danger",
      title: "Kenapa Kita Harus Memilah Sampah?",
      iconClass: "fa-solid fa-triangle-exclamation",
      description: "Setiap hari di sekolah, banyak sisa bekal makan, plastik jajanan, dan daun gugur. Jika dibiarkan tercampur dan berserakan, lingkungan sekolah jadi kotor dan tidak sehat!",
      items: [
        { iconClass: "fa-solid fa-cloud-showers-heavy", title: "Saluran Air Tersumbat", desc: "Sampah plastik menyumbat selokan sekolah dan memicu genangan air / banjir." },
        { iconClass: "fa-solid fa-mask-face", title: "Sarang Nyamuk & Kuman", desc: "Sampah basah yang membusuk menimbulkan bau tidak sedap dan menyebarkan kuman penyakit." }
      ]
    },
    {
      id: 2,
      tag: "Program Sekolah Unggulan",
      tagType: "success",
      title: "Gerakan SEMUTLIS di Sekolah Kita 🌱",
      iconClass: "fa-solid fa-hand-holding-heart",
      description: "SDN 1 Ciawilor menjalankan program SEMUTLIS (Sepuluh Menit Peduli Lingkungan Sekitar) dan SDN 2 Ciawilor membiasakan disiplin buang sampah sejak kelas 1–3 SD!",
      youtubeId: "_K3hU1iXoFA",
      youtubeUrl: "https://www.youtube.com/results?search_query=dampak+sampah+plastik+di+indonesia+edukasi+anak",
      items: [
        { iconClass: "fa-solid fa-clock", title: "10 Menit Setiap Hari", desc: "Luangkan 10 menit sebelum masuk kelas untuk membersihkan laci meja dan halaman sekolah." },
        { iconClass: "fa-solid fa-users", title: "Disiplin Bersama", desc: "Memilah sampah bukan tugas penjaga sekolah saja, tapi kebiasaan baik kita semua!" }
      ]
    },
    {
      id: 3,
      tag: "2 Tong Arena 3D",
      tagType: "info",
      title: "Kenali 2 Tempat Sampah Utama di Game 3D",
      iconClass: "fa-solid fa-trash-can",
      description: "Di arena permainan 3D, kamu akan memilah sampah ke dalam 2 tempat sampah:",
      items: [
        { iconClass: "fa-solid fa-leaf text-green", title: "1. TONG HIJAU (ORGANIK)", desc: "Sampah sisa makhluk hidup: kulit pisang, gigitan apel, daun kering, dan roti (membusuk jadi pupuk kompos)." },
        { iconClass: "fa-solid fa-bottle-water text-gold", title: "2. TONG KUNING (ANORGANIK)", desc: "Sampah buatan pabrik: botol plastik, kaleng soda, bebek mainan, sedotan, kardus, dan kertas (tidak membusuk, harus didaur ulang)." }
      ]
    },
    {
      id: 4,
      tag: "Pesan Khusus Guru",
      tagType: "danger",
      title: "⚠️ Pesan Keselamatan Sampah B3 (Untuk Panduan Guru)",
      iconClass: "fa-solid fa-radiation",
      description: "PERINGATAN PENTING KESELAMATAN SISWA: Sampah B3 (Bahan Berbahaya & Beracun) TIDAK DIMAINKAN di arena 3D demi faktor psikologis dan keselamatan anak-anak SD kelas 1–3.",
      b3AlertBox: true,
      items: [
        { iconClass: "fa-solid fa-ban text-red", title: "Jangan Pernah Disentuh!", desc: "Contoh B3: Baterai bekas, lampu bohlam pecah, botol obat/cairan kimia keras, dan termometer raksa." },
        { iconClass: "fa-solid fa-bullhorn text-orange", title: "Segera Lapor ke Guru / Orang Tua", desc: "Guru wajib mengingatkan siswa jika melihat sampah B3 di sekolah atau rumah, segera panggil orang dewasa!" }
      ]
    },
    {
      id: 5,
      tag: "Misi Kamu di Kelas!",
      tagType: "success",
      title: "Siap Bermain Estafet di Kelas? 🎮",
      iconClass: "fa-solid fa-trophy",
      description: "Permainan dipandu oleh Guru di laptop dan proyektor kelas. Siswa maju bergantian bermain memilih level yang cocok!",
      items: [
        { iconClass: "fa-solid fa-hand-pointer", title: "Langkah 1: Klik Sampah di Meja", desc: "Klik atau sentuh sampah 3D yang muncul di tengah meja untuk mengangkatnya." },
        { iconClass: "fa-solid fa-bullseye", title: "Langkah 2: Pilih Tong Hijau atau Kuning", desc: "Masukkan ke Tong Hijau (Organik) atau Kuning (Anorganik). Kumpulkan combo dan raih 3 bintang ⭐!" }
      ]
    }
  ];

  class EduSlidesController {
    constructor(containerId, counterId, fillId, prevBtnId, nextBtnId, skipBtnId, onCompleteCallback) {
      this.container = document.getElementById(containerId);
      this.counterEl = document.getElementById(counterId);
      this.fillEl = document.getElementById(fillId);
      this.prevBtn = document.getElementById(prevBtnId);
      this.nextBtn = document.getElementById(nextBtnId);
      this.skipBtn = document.getElementById(skipBtnId);
      this.onComplete = onCompleteCallback;

      this.currentIndex = 0;
      this.initEvents();
    }

    initEvents() {
      if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
      if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
      if (this.skipBtn) this.skipBtn.addEventListener('click', () => {
        if (this.onComplete) this.onComplete();
      });
    }

    render() {
      if (!this.container) return;
      const slide = eduSlidesData[this.currentIndex];
      const total = eduSlidesData.length;

      if (this.counterEl) this.counterEl.textContent = `Slide ${this.currentIndex + 1} dari ${total}`;
      if (this.fillEl) this.fillEl.style.width = `${((this.currentIndex + 1) / total) * 100}%`;

      let videoSectionHTML = '';
      if (slide.youtubeUrl) {
        videoSectionHTML = `
          <div style="margin: 10px 0; text-align: center;">
            <a href="${slide.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-danger btn-sm" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700; text-decoration: none; padding: 7px 16px; border-radius: 50px; background: #ef4444; color: #fff; font-size: 0.85rem;">
              <i class="fa-brands fa-youtube" style="font-size: 1.1rem;"></i> Tonton Video Dampak Sampah Indonesia di YouTube
            </a>
          </div>
        `;
      }

      let itemsHTML = '';
      if (slide.items && slide.items.length > 0) {
        itemsHTML = `<div class="edu-grid">
          ${slide.items.map(item => `
            <div class="edu-item-card">
              <i class="${item.iconClass}"></i>
              <div class="edu-item-info">
                <h4>${item.title}</h4>
                <p>${item.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>`;
      }

      let alertBoxHTML = '';
      if (slide.b3AlertBox) {
        alertBoxHTML = `
          <div class="b3-teacher-alert-box" style="background: rgba(239, 68, 68, 0.12); border: 2px dashed #ef4444; border-radius: 12px; padding: 14px 18px; margin: 12px 0; text-align: left;">
            <div style="display: flex; align-items: center; gap: 10px; color: #b91c1c; font-weight: 700; margin-bottom: 6px;">
              <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.25rem;"></i>
              <span>PANDUAN KESELAMATAN GURU: SAMPAH B3 BERBAHAYA</span>
            </div>
            <p style="margin: 0; font-size: 0.88rem; color: #7f1d1d; line-height: 1.5;">
              Sampah B3 tidak dimasukkan ke dalam tantangan pilah 3D anak-anak karena berisiko memicu persepsi bahwa benda berbahaya tersebut aman untuk disentuh/dimainkan. Mohon tekankan kepada seluruh siswa bahwa benda berkategori B3 wajib dijauhi dan dilaporkan kepada orang dewasa.
            </p>
          </div>
        `;
      }

      this.container.innerHTML = `
        <div class="slide-content-wrapper">
          <span class="slide-badge-tag ${slide.tagType}">${slide.tag}</span>
          <h2 class="slide-title">${slide.title}</h2>
          <div class="slide-illustration-icon"><i class="${slide.iconClass}"></i></div>
          <p class="slide-description">${slide.description}</p>
          ${alertBoxHTML}
          ${videoSectionHTML}
          ${itemsHTML}
        </div>
      `;

      if (this.prevBtn) {
        this.prevBtn.disabled = (this.currentIndex === 0);
        this.prevBtn.style.opacity = (this.currentIndex === 0) ? '0.5' : '1';
      }

      if (this.currentIndex === total - 1) {
        if (this.nextBtn) this.nextBtn.classList.add('hidden');
        if (this.skipBtn) this.skipBtn.classList.remove('hidden');
      } else {
        if (this.nextBtn) this.nextBtn.classList.remove('hidden');
        if (this.skipBtn) this.skipBtn.classList.add('hidden');
      }
    }

    nextSlide() {
      if (this.currentIndex < eduSlidesData.length - 1) {
        this.currentIndex++;
        this.render();
      }
    }

    prevSlide() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.render();
      }
    }

    reset() {
      this.currentIndex = 0;
      this.render();
    }
  }

  window.eduSlidesData = eduSlidesData;
  window.EduSlidesController = EduSlidesController;
})();
