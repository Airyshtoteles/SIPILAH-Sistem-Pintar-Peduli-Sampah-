/* ==========================================================================
   uiFeedback.js - Modern Modal Confirmation, Alert Dialogs & Toast Notifications
   Menggantikan browser window.alert() dan window.confirm() dengan UI modern
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   ========================================================================== */

(function() {
  class UIFeedbackManager {
    constructor() {
      this.modal = null;
      this.toastContainer = null;
    }

    _getElements() {
      return {
        modal: document.getElementById('modal-custom-confirm'),
        iconWrap: document.getElementById('confirm-modal-icon-wrap'),
        icon: document.getElementById('confirm-modal-icon'),
        titleEl: document.getElementById('confirm-modal-title'),
        msgEl: document.getElementById('confirm-modal-message'),
        btnOk: document.getElementById('btn-confirm-ok'),
        btnCancel: document.getElementById('btn-confirm-cancel')
      };
    }

    confirm({
      title = 'Konfirmasi Tindakan',
      message = 'Apakah Bapak/Ibu Guru yakin ingin melanjutkan?',
      confirmText = 'Ya, Lanjutkan',
      cancelText = 'Batal',
      type = 'warning' // 'warning', 'danger', 'info', 'success'
    }) {
      return new Promise((resolve) => {
        const els = this._getElements();
        if (!els.modal) {
          resolve(window.confirm(message));
          return;
        }

        els.titleEl.textContent = title;
        els.msgEl.innerHTML = message;
        els.btnOk.innerHTML = `<i class="fa-solid fa-check"></i> ${confirmText}`;
        els.btnCancel.style.display = 'inline-flex';
        els.btnCancel.innerHTML = `<i class="fa-solid fa-xmark"></i> ${cancelText}`;

        // Styling by type
        els.iconWrap.className = `confirm-icon-wrap ${type}`;
        if (type === 'danger') {
          els.icon.className = 'fa-solid fa-trash-can';
          els.btnOk.className = 'btn btn-danger btn-confirm-action';
        } else if (type === 'warning') {
          els.icon.className = 'fa-solid fa-triangle-exclamation';
          els.btnOk.className = 'btn btn-warning btn-confirm-action';
        } else if (type === 'success') {
          els.icon.className = 'fa-solid fa-circle-check';
          els.btnOk.className = 'btn btn-success btn-confirm-action';
        } else {
          els.icon.className = 'fa-solid fa-circle-question';
          els.btnOk.className = 'btn btn-primary btn-confirm-action';
        }

        const cleanup = () => {
          els.modal.classList.add('hidden');
          els.btnOk.onclick = null;
          els.btnCancel.onclick = null;
        };

        els.btnOk.onclick = () => {
          cleanup();
          resolve(true);
        };

        els.btnCancel.onclick = () => {
          cleanup();
          resolve(false);
        };

        els.modal.classList.remove('hidden');
      });
    }

    alert({
      title = 'Informasi',
      message = '',
      okText = 'Mengerti',
      type = 'info'
    }) {
      return new Promise((resolve) => {
        const els = this._getElements();
        if (!els.modal) {
          window.alert(message);
          resolve();
          return;
        }

        els.titleEl.textContent = title;
        els.msgEl.innerHTML = message;
        els.btnOk.innerHTML = `<i class="fa-solid fa-check"></i> ${okText}`;
        els.btnCancel.style.display = 'none'; // Sembunyikan tombol batal untuk mode alert

        els.iconWrap.className = `confirm-icon-wrap ${type}`;
        if (type === 'success') {
          els.icon.className = 'fa-solid fa-circle-check';
          els.btnOk.className = 'btn btn-success btn-confirm-action';
        } else if (type === 'danger') {
          els.icon.className = 'fa-solid fa-circle-xmark';
          els.btnOk.className = 'btn btn-danger btn-confirm-action';
        } else {
          els.icon.className = 'fa-solid fa-circle-info';
          els.btnOk.className = 'btn btn-primary btn-confirm-action';
        }

        const cleanup = () => {
          els.modal.classList.add('hidden');
          els.btnOk.onclick = null;
        };

        els.btnOk.onclick = () => {
          cleanup();
          resolve();
        };

        els.modal.classList.remove('hidden');
      });
    }

    toast(message, type = 'info', duration = 3000) {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast-item ${type}`;

      let icon = '<i class="fa-solid fa-circle-info text-blue"></i>';
      if (type === 'success') icon = '<i class="fa-solid fa-circle-check text-green"></i>';
      else if (type === 'danger') icon = '<i class="fa-solid fa-circle-exclamation text-red"></i>';
      else if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation text-gold"></i>';

      toast.innerHTML = `${icon} <span>${message}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 350);
      }, duration);
    }
  }

  window.uiFeedback = new UIFeedbackManager();
})();
