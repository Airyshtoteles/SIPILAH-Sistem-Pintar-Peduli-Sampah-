/* ==========================================================================
   Audio.js - Web Audio API Sound Synthesizer & Casual Game BGM Loop
   Fixed Infinite Recursion Stack Overflow in init() / startBGM()
   ========================================================================== */

(function() {
  class SoundSynthesizer {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.bgmInterval = null;
      this.bgmPlaying = false;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.muted) {
        this.stopBGM();
      } else {
        this.startBGM();
      }
      return this.muted;
    }

    // Relaxing Casual Game BGM Melody Loop Synthesizer
    startBGM() {
      if (this.bgmInterval || this.muted) return;
      this.init();
      if (!this.ctx) return;

      this.bgmPlaying = true;
      const bgmNotes = [
        // Chord Cmaj7 (C5, E5, G5, B5)
        { f: 261.63, d: 0.6 }, { f: 329.63, d: 0.6 }, { f: 392.00, d: 0.6 }, { f: 493.88, d: 0.6 },
        // Chord Am7 (A4, C5, E5, G5)
        { f: 220.00, d: 0.6 }, { f: 261.63, d: 0.6 }, { f: 329.63, d: 0.6 }, { f: 392.00, d: 0.6 },
        // Chord Fmaj7 (F4, A4, C5, E5)
        { f: 174.61, d: 0.6 }, { f: 220.00, d: 0.6 }, { f: 261.63, d: 0.6 }, { f: 329.63, d: 0.6 },
        // Chord G7 (G4, B4, D5, F5)
        { f: 196.00, d: 0.6 }, { f: 246.94, d: 0.6 }, { f: 293.66, d: 0.6 }, { f: 349.23, d: 0.6 }
      ];

      let noteIdx = 0;
      this.bgmInterval = setInterval(() => {
        if (this.muted || !this.ctx) return;
        try {
          const item = bgmNotes[noteIdx % bgmNotes.length];
          noteIdx++;

          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(item.f, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.025, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0005, this.ctx.currentTime + 0.55);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.55);
        } catch (e) {}
      }, 360);
    }

    stopBGM() {
      if (this.bgmInterval) {
        clearInterval(this.bgmInterval);
        this.bgmInterval = null;
      }
      this.bgmPlaying = false;
    }

    // Play Pop Sound (Item Picked)
    playPop() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
      } catch (e) {
        console.warn('Audio playback error:', e);
      }
    }

    // Play Throw Sound (Item Flying into Bin)
    playThrow() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
      } catch (e) {
        console.warn('Audio playback error:', e);
      }
    }

    // Play Correct Sorting Sound (Joyful Chime)
    playCorrect() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

          gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(this.ctx.currentTime + idx * 0.06);
          osc.stop(this.ctx.currentTime + idx * 0.06 + 0.2);
        });
      } catch (e) {
        console.warn('Audio playback error:', e);
      }
    }

    playSuccess() {
      this.playCorrect();
    }

    // Play Wrong Sorting Sound (Gentle Low Boing)
    playWrong() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
      } catch (e) {
        console.warn('Audio playback error:', e);
      }
    }

    playError() {
      this.playWrong();
    }

    // Play Fanfare Sound (Game Over / High Score)
    playFanfare() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

          gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(this.ctx.currentTime + idx * 0.12);
          osc.stop(this.ctx.currentTime + idx * 0.12 + 0.4);
        });
      } catch (e) {
        console.warn('Audio playback error:', e);
      }
    }
  }

  window.audioSystem = new SoundSynthesizer();
})();
