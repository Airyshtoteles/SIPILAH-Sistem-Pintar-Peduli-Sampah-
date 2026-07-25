/* ==========================================================================
   Certificate.js - Dynamic Professional Certificate Generator with Enriched Typography & Face Photo
   Global Window Compatibility
   ========================================================================== */

(function() {
  class CertificateGenerator {
    static drawCertificate(canvas, studentName, score, accuracy, facePhotoImg) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clean Pristine Canvas Background
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

      // 2. Official Header Block
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 15px "Outfit", "Arial", sans-serif';
      ctx.fillText('HIMPUNAN MAHASISWA TEKNIK INFORMATIKA (HIMA TI)', width / 2, 62);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px "Outfit", "Arial", sans-serif';
      ctx.fillText('PROGRAM PENGABDIAN MASYARAKAT - EDUKASI LINGKUNGAN 3D', width / 2, 80);

      // Ornate Gold & Emerald Line Separator
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(140, 95);
      ctx.lineTo(width - 140, 95);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(width / 2, 95, 4, 0, Math.PI * 2);
      ctx.fill();

      // 3. Official Certificate Title
      ctx.fillStyle = '#065f46';
      ctx.font = '800 28px "Outfit", "Georgia", serif';
      ctx.fillText('SERTIFIKAT PENGHARGAAN', width / 2, 138);

      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 12px "Outfit", sans-serif';
      ctx.fillText('No. Reg: HIMA-TI/PENGMAS/ECO3D/' + Math.floor(1000 + Math.random() * 9000), width / 2, 156);

      // 4. Student Face Photo Badge (ENLARGED 50% LARGER)
      const photoX = 145;
      const photoY = 270;
      const photoRadius = 74; // Enlarged from 52 to 74px for high-impact presence!

      if (facePhotoImg) {
        ctx.save();

        // Outer Shadow for Photo Badge
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

        // Gold Ring Outer Frame
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 5. Recipient Phrase
      ctx.fillStyle = '#334155';
      ctx.font = '15px "Outfit", "Arial", sans-serif';
      ctx.fillText('Diberikan dengan bangga kepada:', width / 2 + (facePhotoImg ? 40 : 0), 205);

      // 6. Student Name (Large Professional Typography)
      const nameToDisplay = (studentName || 'Siswa Pahlawan Sampah').trim();
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 36px "Outfit", "Georgia", serif';
      ctx.fillText(nameToDisplay, width / 2 + (facePhotoImg ? 40 : 0), 255);

      // Underline Accent Line
      const textWidth = ctx.measureText(nameToDisplay).width;
      const underlineCenterX = width / 2 + (facePhotoImg ? 40 : 0);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(underlineCenterX - (textWidth / 2) - 15, 272);
      ctx.lineTo(underlineCenterX + (textWidth / 2) + 15, 272);
      ctx.stroke();

      // 7. Citation Text
      ctx.fillStyle = '#475569';
      ctx.font = '15px "Outfit", "Arial", sans-serif';
      ctx.fillText('Atas partisipasi & keberhasilan memilah sampah pada Program Edukasi 3D EcoHero.', width / 2 + (facePhotoImg ? 40 : 0), 312);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px "Outfit", "Arial", sans-serif';
      ctx.fillText(`Raihan Skor: ${score} PTS   |   Akurasi Memilah: ${accuracy}%`, width / 2 + (facePhotoImg ? 40 : 0), 340);

      // 8. Official Gold Seal Stamp
      const sealX = width / 2;
      const sealY = 440;

      ctx.beginPath();
      ctx.arc(sealX, sealY, 42, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#d97706';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sealX, sealY, 36, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.fillText('PAHLAWAN', sealX, sealY - 6);
      ctx.fillText('LINGKUNGAN', sealX, sealY + 8);
      ctx.font = '15px sans-serif';
      ctx.fillText('⭐', sealX, sealY + 26);

      // 9. Signatures Block & Date
      const currentDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      ctx.fillStyle = '#64748b';
      ctx.font = '12px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Diterbitkan: ${currentDate}`, 65, height - 48);

      ctx.textAlign = 'right';
      ctx.fillText('Panitia Pengabdian Masyarakat HIMA TI', width - 65, height - 48);
    }

    static downloadCertificate(canvas, studentName) {
      if (!canvas) return;
      const sanitizedName = (studentName || 'Pahlawan_Sampah').replace(/[^a-zA-Z0-9]/g, '_');
      const imageURI = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `Sertifikat_EcoHero_${sanitizedName}.png`;
      link.href = imageURI;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  window.CertificateGenerator = CertificateGenerator;
})();
