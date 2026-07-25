/* ==========================================================================
   App.js - Main Application Controller
   GLTF Assets Preloader, Webcam Face Photo Capture & Navigation Control
   ========================================================================== */

(function() {
  class AppController {
    constructor() {
      this.currentScreen = 'screen-menu';
      this.lastResultData = null;
      this.modelsReady = false;
      this.pendingGameStart = false;

      this.mediaStream = null;
      this.capturedPhotoImg = null;

      // Preload GLTF Models first
      if (window.ModelFactory3D) {
        window.ModelFactory3D.preloadModels(() => {
          console.log('GLTF Model assets preloaded successfully!');
          this.modelsReady = true;
          if (this.pendingGameStart) {
            this.pendingGameStart = false;
            this.showScreen('screen-game');
            this.gameEngine.startGame();
          }
        });
      } else {
        this.modelsReady = true;
      }

      this.initScene();
      this.initEduSlides();
      this.initUIEvents();
      this.initCameraEvents();
      this.startAnimationLoop();
    }

    initScene() {
      this.parkScene = new window.ParkScene3D('canvas-container');

      this.gameEngine = new window.GameEngine3D(
        this.parkScene,
        (score, combo, lives) => this.updateHUD(score, combo, lives),
        (itemData, wrongCategory, callback) => this.showWrongFeedbackModal(itemData, wrongCategory, callback),
        (resultData) => this.handleGameOver(resultData)
      );
    }

    initEduSlides() {
      this.eduController = new window.EduSlidesController(
        'edu-slide-content',
        'edu-slide-counter',
        'edu-progress-fill',
        'btn-edu-prev',
        'btn-edu-next',
        'btn-edu-skip-game',
        () => {
          if (this.modelsReady) {
            this.showScreen('screen-game');
            this.gameEngine.startGame();
          } else {
            this.pendingGameStart = true;
            const btn = document.getElementById('btn-edu-skip-game');
            if (btn) btn.textContent = 'Memuat Model 3D...';
          }
        }
      );
      this.eduController.render();
    }

    initUIEvents() {
      const unlockAudio = () => {
        if (window.audioSystem) window.audioSystem.init();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);

      // Menu Buttons
      const startBtn = document.getElementById('btn-start-game');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          this.showScreen('screen-edu');
          this.eduController.reset();
        });
      }

      const openEduBtn = document.getElementById('btn-open-edu');
      if (openEduBtn) {
        openEduBtn.addEventListener('click', () => {
          this.showScreen('screen-edu');
          this.eduController.reset();
        });
      }

      const openLeaderboardBtn = document.getElementById('btn-open-leaderboard');
      if (openLeaderboardBtn) {
        openLeaderboardBtn.addEventListener('click', () => {
          this.showLeaderboardModal();
        });
      }

      // HUD Buttons
      const toggleSoundBtn = document.getElementById('btn-toggle-sound');
      if (toggleSoundBtn) {
        toggleSoundBtn.addEventListener('click', () => {
          if (window.audioSystem) {
            const isMuted = window.audioSystem.toggleMute();
            const soundIcon = document.getElementById('sound-icon');
            if (soundIcon) {
              soundIcon.className = isMuted ? 'fa-solid fa-volume-xmark text-red' : 'fa-solid fa-volume-high';
            }
          }
        });
      }

      const homeFromHudBtn = document.getElementById('btn-home-from-hud');
      if (homeFromHudBtn) {
        homeFromHudBtn.addEventListener('click', () => {
          if (confirm('Apakah kamu yakin ingin kembali ke Menu Utama? Game akan direset.')) {
            this.stopCamera();
            this.showScreen('screen-menu');
          }
        });
      }

      const closeFeedbackBtn = document.getElementById('btn-close-feedback');
      if (closeFeedbackBtn) {
        const handleCloseFeedback = (e) => {
          if (e) e.stopPropagation();
          const modal = document.getElementById('edu-feedback-modal');
          if (modal) modal.classList.add('hidden');
          if (this.pendingFeedbackCallback) {
            const cb = this.pendingFeedbackCallback;
            this.pendingFeedbackCallback = null;
            try { cb(); } catch (err) {}
          }
        };
        closeFeedbackBtn.addEventListener('click', handleCloseFeedback);
        closeFeedbackBtn.addEventListener('touchend', handleCloseFeedback, { passive: true });
      }

      // Game Over Buttons
      const restartBtn = document.getElementById('btn-restart-game');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.stopCamera();
          this.showScreen('screen-game');
          this.gameEngine.startGame();
        });
      }

      const viewLeaderboardBtn = document.getElementById('btn-view-leaderboard');
      if (viewLeaderboardBtn) {
        viewLeaderboardBtn.addEventListener('click', () => {
          this.showLeaderboardModal();
        });
      }

      const claimCertBtn = document.getElementById('btn-claim-certificate');
      if (claimCertBtn) {
        claimCertBtn.addEventListener('click', () => {
          this.handleClaimCertificate();
        });
      }

      const homeFromGameoverBtn = document.getElementById('btn-home-from-gameover');
      if (homeFromGameoverBtn) {
        homeFromGameoverBtn.addEventListener('click', () => {
          this.stopCamera();
          this.showScreen('screen-menu');
        });
      }

      // Modal Close Buttons
      const closeCertBtn = document.getElementById('btn-close-cert');
      if (closeCertBtn) {
        closeCertBtn.addEventListener('click', () => {
          document.getElementById('modal-certificate').classList.add('hidden');
        });
      }

      const closeLeaderboardBtn = document.getElementById('btn-close-leaderboard');
      if (closeLeaderboardBtn) {
        closeLeaderboardBtn.addEventListener('click', () => {
          document.getElementById('modal-leaderboard').classList.add('hidden');
        });
      }
    }

    initCameraEvents() {
      const startCamBtn = document.getElementById('btn-start-camera');
      const captureBtn = document.getElementById('btn-capture-photo');
      const retakeBtn = document.getElementById('btn-retake-photo');
      const photoFileInput = document.getElementById('input-photo-file');

      if (startCamBtn) {
        startCamBtn.addEventListener('click', () => this.startCamera());
      }
      if (captureBtn) {
        captureBtn.addEventListener('click', () => this.capturePhoto());
      }
      if (retakeBtn) {
        retakeBtn.addEventListener('click', () => this.startCamera());
      }
      if (photoFileInput) {
        photoFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
      }
    }

    startCamera() {
      const video = document.getElementById('webcam-video');
      const previewImg = document.getElementById('photo-preview');
      const placeholder = document.getElementById('camera-placeholder');
      const startCamBtn = document.getElementById('btn-start-camera');
      const captureBtn = document.getElementById('btn-capture-photo');
      const retakeBtn = document.getElementById('btn-retake-photo');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Browser kamu belum mendukung akses Kamera Webcam secara langsung. Silakan gunakan tombol Unggah Foto.');
        return;
      }

      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          this.mediaStream = stream;
          if (video) {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
              video.play().catch(e => console.warn('Video play error:', e));
            };
            video.play().catch(e => console.warn('Video play error:', e));
            video.classList.remove('hidden');
          }
          if (previewImg) previewImg.classList.add('hidden');
          if (placeholder) placeholder.classList.add('hidden');
          if (startCamBtn) startCamBtn.classList.add('hidden');
          if (captureBtn) captureBtn.classList.remove('hidden');
          if (retakeBtn) retakeBtn.classList.add('hidden');
        })
        .catch(err => {
          console.warn('Camera access error:', err);
          alert('Akses kamera ditolak atau tidak ditemukan. Kamu bisa mengunggah file foto dari HP/Laptop dengan tombol "Unggah Foto".');
        });
    }

    capturePhoto() {
      const video = document.getElementById('webcam-video');
      const photoCanvas = document.getElementById('photo-canvas');
      const previewImg = document.getElementById('photo-preview');
      const captureBtn = document.getElementById('btn-capture-photo');
      const retakeBtn = document.getElementById('btn-retake-photo');

      if (!video || !photoCanvas) return;

      const size = 300;
      photoCanvas.width = size;
      photoCanvas.height = size;
      const ctx = photoCanvas.getContext('2d');

      const vWidth = video.videoWidth || 640;
      const vHeight = video.videoHeight || 480;

      // Crop video stream into square aspect
      const minDim = Math.min(vWidth, vHeight);
      const startX = (vWidth - minDim) / 2;
      const startY = (vHeight - minDim) / 2;

      ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, size, size);

      const dataUrl = photoCanvas.toDataURL('image/png');
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        this.capturedPhotoImg = img;
        if (previewImg) {
          previewImg.src = dataUrl;
          previewImg.classList.remove('hidden');
        }
        video.classList.add('hidden');
        this.stopCamera();

        if (captureBtn) captureBtn.classList.add('hidden');
        if (retakeBtn) retakeBtn.classList.remove('hidden');
      };
    }

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          this.capturedPhotoImg = img;

          const previewImg = document.getElementById('photo-preview');
          const video = document.getElementById('webcam-video');
          const placeholder = document.getElementById('camera-placeholder');
          const startCamBtn = document.getElementById('btn-start-camera');
          const captureBtn = document.getElementById('btn-capture-photo');
          const retakeBtn = document.getElementById('btn-retake-photo');

          if (previewImg) {
            previewImg.src = dataUrl;
            previewImg.classList.remove('hidden');
          }
          if (video) video.classList.add('hidden');
          if (placeholder) placeholder.classList.add('hidden');
          if (startCamBtn) startCamBtn.classList.add('hidden');
          if (captureBtn) captureBtn.classList.add('hidden');
          if (retakeBtn) retakeBtn.classList.remove('hidden');
        };
      };
      reader.readAsDataURL(file);
    }

    stopCamera() {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
    }

    showScreen(screenId) {
      const screens = document.querySelectorAll('.screen');
      screens.forEach(s => s.classList.add('hidden'));

      const targetScreen = document.getElementById(screenId);
      if (targetScreen) targetScreen.classList.remove('hidden');

      this.currentScreen = screenId;
    }

    updateHUD(score, combo, lives) {
      const scoreEl = document.getElementById('hud-score');
      if (scoreEl) scoreEl.textContent = score.toLocaleString('id-ID');

      const comboBadge = document.getElementById('hud-combo-badge');
      const comboText = document.getElementById('hud-combo-text');
      if (combo > 1) {
        if (comboBadge) comboBadge.classList.remove('hidden');
        if (comboText) comboText.textContent = `COMBO x${combo}`;
      } else {
        if (comboBadge) comboBadge.classList.add('hidden');
      }

      const livesEl = document.getElementById('hud-lives');
      if (livesEl) {
        let heartsHTML = '';
        for (let i = 0; i < 3; i++) {
          if (i < lives) {
            heartsHTML += `<i class="fa-solid fa-heart text-red"></i>`;
          } else {
            heartsHTML += `<i class="fa-regular fa-heart text-muted"></i>`;
          }
        }
        livesEl.innerHTML = heartsHTML;
      }
    }

    showWrongFeedbackModal(itemData, wrongCategory, callback) {
      this.pendingFeedbackCallback = callback;

      const modal = document.getElementById('edu-feedback-modal');
      const infoEl = document.getElementById('feedback-item-info');
      const tipEl = document.getElementById('feedback-tip-text');

      if (infoEl) infoEl.innerHTML = `<strong>${itemData.name}</strong> tidak cocok di tempat sampah ini.`;
      if (tipEl) tipEl.textContent = `${itemData.tip} Kategori yang benar adalah: ${itemData.categoryName}!`;

      modal.classList.remove('hidden');
    }

    handleGameOver(resultData) {
      this.lastResultData = resultData;

      const resScore = document.getElementById('res-score');
      const resAcc = document.getElementById('res-accuracy');
      const resCombo = document.getElementById('res-maxcombo');

      if (resScore) resScore.textContent = resultData.score.toLocaleString('id-ID');
      if (resAcc) resAcc.textContent = `${resultData.accuracy}%`;
      if (resCombo) resCombo.textContent = `x${resultData.maxCombo}`;

      this.showScreen('screen-gameover');
    }

    handleClaimCertificate() {
      const nameInput = document.getElementById('input-student-name');
      const studentName = nameInput ? nameInput.value.trim() : '';

      if (!studentName) {
        alert('Mohon masukkan Nama Lengkap kamu terlebih dahulu untuk dicetak di sertifikat!');
        if (nameInput) nameInput.focus();
        return;
      }

      if (this.lastResultData && window.LeaderboardManager) {
        window.LeaderboardManager.saveScore(studentName, this.lastResultData.score, this.lastResultData.accuracy);
      }

      const canvas = document.getElementById('certificate-canvas');
      if (window.CertificateGenerator) {
        window.CertificateGenerator.drawCertificate(
          canvas,
          studentName,
          this.lastResultData ? this.lastResultData.score : 0,
          this.lastResultData ? this.lastResultData.accuracy : 0,
          this.capturedPhotoImg
        );
      }

      const downloadBtn = document.getElementById('btn-download-cert');
      if (downloadBtn) {
        downloadBtn.onclick = () => {
          if (window.CertificateGenerator) {
            window.CertificateGenerator.downloadCertificate(canvas, studentName);
          }
        };
      }

      document.getElementById('modal-leaderboard').classList.add('hidden');
      document.getElementById('modal-certificate').classList.remove('hidden');
    }

    showLeaderboardModal() {
      const tbody = document.getElementById('leaderboard-tbody');
      if (window.LeaderboardManager) {
        window.LeaderboardManager.renderTable(tbody);
      }
      document.getElementById('modal-certificate').classList.add('hidden');
      document.getElementById('modal-leaderboard').classList.remove('hidden');
    }

    startAnimationLoop() {
      let lastTime = performance.now();
      const animate = (now) => {
        requestAnimationFrame(animate);

        const delta = Math.min((now - lastTime) / 1000, 0.1) || 0.016;
        lastTime = now;

        try {
          if (this.gameEngine && typeof this.gameEngine.updateAnimation === 'function') {
            this.gameEngine.updateAnimation(delta);
          }
        } catch (e) {
          console.warn('Game engine animation update error:', e);
        }

        try {
          if (this.parkScene) {
            this.parkScene.render();
          }
        } catch (e) {
          console.warn('Park scene render error:', e);
        }
      };
      animate(performance.now());
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.appInstance = new AppController();
  });
})();
