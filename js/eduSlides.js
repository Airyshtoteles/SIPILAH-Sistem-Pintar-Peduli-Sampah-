/* ==========================================================================
   EduSlides.js - Interactive Pre-Game Education Deck & YouTube Video Impact
   ========================================================================== */

(function() {
  const eduSlidesData = [
    {
      id: 1,
      tag: "Pentingnya Memilah",
      tagType: "danger",
      title: "Tahukah Kamu? Sampah Bisa Berbahaya!",
      iconClass: "fa-solid fa-triangle-exclamation",
      description: "Jika kita membuang sampah sembarangan tanpa dipilah, lingkungan kita bisa menjadi kotor dan menyebabkan bencana alam yang merugikan!",
      items: [
        { iconClass: "fa-solid fa-cloud-showers-heavy", title: "Bencana Banjir", desc: "Sampah menyumbat selokan & sungai sehingga air meluap ke pemukiman." },
        { iconClass: "fa-solid fa-mask-face", title: "Polusi & Penyakit", desc: "Bau busuk & racun menarik lalat, nyamuk, serta mengganggu kesehatan." }
      ]
    },
    {
      id: 2,
      tag: "Video Edukasi YouTube",
      tagType: "danger",
      title: "Pelajari Dampak Sampah di Indonesia 🎥",
      iconClass: "fa-solid fa-film",
      description: "Indonesia menghasilkan jutaan ton sampah plastik setiap tahun. Mari tonton video edukasi singkat mengenai dampak sampah bagi sungai dan laut kita!",
      youtubeId: "_K3hU1iXoFA", // ID Video Edukasi Dampak Sampah Plastik
      youtubeUrl: "https://www.youtube.com/results?search_query=dampak+sampah+plastik+di+indonesia+edukasi+anak",
      items: [
        { iconClass: "fa-solid fa-fish-fins", title: "Bahaya Bagi Laut", desc: "Penyu & ikan sering tidak sengaja memakan sampah plastik." },
        { iconClass: "fa-solid fa-recycle", title: "Solusi Kita", desc: "Memilah sampah dari rumah & sekolah adalah kunci penyelamatan bumi!" }
      ]
    },
    {
      id: 3,
      tag: "Bahaya Plastik & B3",
      tagType: "danger",
      title: "Plastik Butuh Ratusan Tahun Terurai!",
      iconClass: "fa-solid fa-bottle-water",
      description: "Botol plastik dan kantong plastik tidak bisa membusuk secara alami! Jika terbawa ke laut, sampah ini membahayakan hewan laut.",
      items: [
        { iconClass: "fa-solid fa-ban-smoking", title: "Sampah Plastik", desc: "Harus dimasukkan ke Anorganik agar bisa didaur ulang!" },
        { iconClass: "fa-solid fa-bolt", title: "Baterai & Lampu (B3)", desc: "Mengandung bahan kimia beracun yang berbahaya bagi manusia." }
      ]
    },
    {
      id: 4,
      tag: "4 Warna Tempat Sampah",
      tagType: "info",
      title: "Yuk Kenali 4 Tempat Sampah 3D!",
      iconClass: "fa-solid fa-trash-can",
      description: "Setiap tempat sampah punya warna dan tugas masing-masing! Ingat warnanya ya:",
      items: [
        { iconClass: "fa-solid fa-leaf text-green", title: "ORGANIK (Hijau)", desc: "Sisa makanan, daun, kulit buah (Bisa jadi pupuk!)." },
        { iconClass: "fa-solid fa-bottle-water text-gold", title: "ANORGANIK (Kuning)", desc: "Botol plastik, kaleng, bungkus makanan." },
        { iconClass: "fa-solid fa-bolt text-red", title: "B3 BERBAHAYA (Merah)", desc: "Baterai bekas, obat kadaluarsa, pecahan kaca." },
        { iconClass: "fa-solid fa-box text-blue", title: "DAUR ULANG / KERTAS (Biru)", desc: "Kardus, kertas buku, majalah bekas." }
      ]
    },
    {
      id: 5,
      tag: "Misi Kamu!",
      tagType: "success",
      title: "Siap Menjadi EcoHero HIMA TI?",
      iconClass: "fa-solid fa-trophy",
      description: "Bantu bersihkan lingkungan sekolah! Caranya sangat gampang:",
      items: [
        { iconClass: "fa-solid fa-hand-pointer", title: "1. Klik/Tap Sampah", desc: "Pilih sampah 3D yang muncul di meja lapangan." },
        { iconClass: "fa-solid fa-bullseye", title: "2. Klik Tempat Sampah", desc: "Masukkan ke tempat sampah 3D yang sesuai!" }
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
          <div style="margin: 12px 0; text-align: center;">
            <a href="${slide.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-danger btn-sm" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700; text-decoration: none; padding: 8px 18px; border-radius: 50px; background: #ef4444; color: #fff;">
              <i class="fa-brands fa-youtube" style="font-size: 1.2rem;"></i> Tonton Video Dampak Sampah Indonesia di YouTube
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

      this.container.innerHTML = `
        <div class="slide-content-wrapper">
          <span class="slide-badge-tag ${slide.tagType}">${slide.tag}</span>
          <h2 class="slide-title">${slide.title}</h2>
          <div class="slide-illustration-icon"><i class="${slide.iconClass}"></i></div>
          <p class="slide-description">${slide.description}</p>
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
