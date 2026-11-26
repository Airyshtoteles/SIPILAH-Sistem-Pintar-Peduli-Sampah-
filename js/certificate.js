/* ==========================================================================
   Certificate.js - Dynamic Professional Certificate Generator
   Mitra: SDN 1 Ciawilor & SDN 2 Ciawilor | Program SEMUTLIS
   Pengembang: Kelompok 05 - SANY (Teknik Informatika UNIKU)
   ========================================================================== */

(function() {
  class CertificateGenerator {
    static drawCertificate(canvas, studentName, score, accuracy, facePhotoImg, sesiInfo) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // 1. Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Elegant Dual Frame Border
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 14;
      ctx.strokeRect(14, 14, width - 28, height - 28);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(26, 26, width - 52, height - 52);

      // Corner Decorative Geometric Accents
      const drawCorner = (x, y, rotX, rotY) => {
        ctx.save();
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (60 * rotX), y);
        ctx.lineTo(x, y + (60 * rotY));
        ctx.fill();
        ctx.restore();
      };
      drawCorner(14, 14, 1, 1);
      drawCorner(width - 14, 14, -1, 1);
      drawCorner(14, height - 14, 1, -1);
      drawCorner(width - 14, height - 14, -1, -1);

      // 2. Official Header Block (Mitra Sekolah & UNIKU)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 13px "Outfit", "Arial", sans-serif';
      ctx.fillText('KEMITRAAN PENDIDIKAN LINGKUNGAN SEKOLAH DASAR', width / 2, 52);

      ctx.fillStyle = '#0f172a';
      ctx.font = '800 16px "Outfit", "Arial", sans-serif';
      ctx.fillText('SDN 1 CIAWILOR & SDN 2 CIAWILOR — KECAMATAN CIAWIGEBANG', width / 2, 72);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px "Outfit", "Arial", sans-serif';
      ctx.fillText('Didukung oleh: Kelompok 05 - SANY | Teknik Informatika Universitas Kuningan (UNIKU)', width / 2, 88);

      // Ornate Gold & Emerald Line Separator
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(120, 100);
      ctx.lineTo(width - 120, 100);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(width / 2, 100, 4, 0, Math.PI * 2);
      ctx.fill();

      // 3. Official Certificate Title
      ctx.fillStyle = '#065f46';
      ctx.font = '800 24px "Outfit", "Georgia", serif';
      ctx.fillText('SERTIFIKAT PENGHARGAAN SISWA', width / 2, 134);

      const regNum = 'SANY-RPL/SEMUTLIS/' + new Date().getFullYear() + '/' + Math.floor(1000 + Math.random() * 9000);
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 11px "Outfit", sans-serif';
      ctx.fillText(`No. Reg: ${regNum}`, width / 2, 150);

      // 4. Student Face Photo Badge (if uploaded / captured)
      const photoX = 145;
      const photoY = 260;
      const photoRadius = 72;

      if (facePhotoImg) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;

        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw cropped round face photo
        ctx.drawImage(facePhotoImg, photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
        ctx.restore();

        // Rings around photo
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      const textOffsetX = facePhotoImg ? 50 : 0;

      // 5. Recipient Phrase
      ctx.fillStyle = '#334155';
      ctx.font = '14px "Outfit", "Arial", sans-serif';
      ctx.fillText('Diberikan dengan penuh apresiasi kepada:', width / 2 + textOffsetX, 192);

      // 6. Student Name
      const nameToDisplay = (studentName || 'Siswa Teladan Lingkungan').trim();
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 34px "Outfit", "Georgia", serif';
      ctx.fillText(nameToDisplay, width / 2 + textOffsetX, 238);

      // Underline Accent Line
      const textWidth = ctx.measureText(nameToDisplay).width;
      const underlineCenterX = width / 2 + textOffsetX;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(underlineCenterX - (textWidth / 2) - 15, 252);
      ctx.lineTo(underlineCenterX + (textWidth / 2) + 15, 252);
      ctx.stroke();

      // 7. Citation Text
      ctx.fillStyle = '#475569';
      ctx.font = '13.5px "Outfit", "Arial", sans-serif';
      const sesiText = sesiInfo ? ` dalam ${sesiInfo}` : '';
      ctx.fillText(`Atas partisipasi dan keberhasilan memilah sampah${sesiText}`, width / 2 + textOffsetX, 285);
      ctx.fillText('pada Program SEMUTLIS (Sepuluh Menit Peduli Lingkungan Sekitar).', width / 2 + textOffsetX, 305);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px "Outfit", "Arial", sans-serif';
      ctx.fillText(`Skor Akhir: ${score} PTS    |    Akurasi Pemilahan: ${accuracy}%`, width / 2 + textOffsetX, 335);

      // 8. Official Gold Seal Stamp
      const sealX = width / 2;
      const sealY = 415;

      ctx.beginPath();
      ctx.arc(sealX, sealY, 38, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#d97706';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sealX, sealY, 32, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.fillText('SEMUTLIS', sealX, sealY - 6);
      ctx.fillText('PEDULI LINGKUNGAN', sealX, sealY + 7);
      ctx.font = '13px sans-serif';
      ctx.fillText('🌿', sealX, sealY + 23);

      // 9. Signatures Block (Mitra SDN 1 & SDN 2 Ciawilor)
      const currentDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      ctx.fillStyle = '#64748b';
      ctx.font = '11px "Outfit", sans-serif';

      // Left Signature: SDN 1 Ciawilor
      ctx.textAlign = 'left';
      ctx.fillText(`Ciawilor, ${currentDate}`, 60, height - 85);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.fillText('Agung Febriyana, S.Pd.', 60, height - 48);
      ctx.fillStyle = '#64748b';
      ctx.font = '10.5px "Outfit", sans-serif';
      ctx.fillText('Narahubung SDN 1 Ciawilor', 60, height - 34);

      // Right Signature: SDN 2 Ciawilor
      ctx.textAlign = 'right';
      ctx.fillText('Mengetahui Mitra Sekolah,', width - 60, height - 85);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.fillText('Tris Mulyo Purnomo, S.Pd.', width - 60, height - 48);
      ctx.fillStyle = '#64748b';
      ctx.font = '10.5px "Outfit", sans-serif';
      ctx.fillText('Narahubung SDN 2 Ciawilor', width - 60, height - 34);
    }

    static downloadCertificate(canvas, studentName) {
      if (!canvas) return;
      const sanitizedName = (studentName || 'Siswa_Ciawilor').replace(/[^a-zA-Z0-9]/g, '_');
      const imageURI = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = `Sertifikat_PilahSampah_${sanitizedName}.png`;
      link.href = imageURI;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  window.CertificateGenerator = CertificateGenerator;
})();
