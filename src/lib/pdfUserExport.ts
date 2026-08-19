import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Siswa, Penguji } from '../types';

const fetchLogoBase64 = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://iili.io/Fr7hdzb.png');
    if (response.ok) {
      const blob = await response.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    console.warn("Failed to load logo for PDF", e);
  }
  return null;
};

export const exportUserToPDF = async (siswaList: Siswa[], pengujiList: Penguji[]) => {
  if (siswaList.length === 0) {
    alert("Tidak ada data untuk diekspor");
    return;
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const logoBase64 = await fetchLogoBase64();

  const juzSet = new Set<number>();
  for (const s of siswaList) {
    if (s.target && Array.isArray(s.target)) {
      s.target.forEach(j => juzSet.add(j));
    }
  }

  if (juzSet.size === 0) {
    juzSet.add(30); // At least one if somehow empty
  }

  const order = [30, 29, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  
  const juzArray = Array.from(juzSet).sort((a, b) => {
    const idxA = order.indexOf(a);
    const idxB = order.indexOf(b);
    return idxA - idxB;
  });

  let isFirstPage = true;

  for (const juz of juzArray) {
    // Filter siswa that have this target juz
    const siswaForJuz = siswaList.filter(s => s.target && s.target.includes(juz));
    
    if (siswaForJuz.length === 0) continue;

    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    // Group by penguji
    const siswaByPenguji: Record<string, Siswa[]> = {};
    for (const s of siswaForJuz) {
      const pid = s.penguji_id || 'unknown';
      if (!siswaByPenguji[pid]) {
        siswaByPenguji[pid] = [];
      }
      siswaByPenguji[pid].push(s);
    }

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 14, 10, 15, 15);
    }

    // Add Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`DATA USER PESERTA SERTIFIKASI AL-QUR'AN`, 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Juz ${juz}`, 105, 25, { align: 'center' });

    let currentY = 32;
    let rowIndex = 1;

    // Sort penguji by name (get penguji objects to sort properly)
    const pengujiIds = Object.keys(siswaByPenguji);
    const sortedPengujiIds = pengujiIds.sort((a, b) => {
      const pA = pengujiList.find(p => p.id === a)?.nama || 'Tanpa Penguji';
      const pB = pengujiList.find(p => p.id === b)?.nama || 'Tanpa Penguji';
      return pA.localeCompare(pB);
    });

    for (const pid of sortedPengujiIds) {
      const pName = pengujiList.find(p => p.id === pid)?.nama || 'Tanpa Penguji';
      const pSiswa = [...siswaByPenguji[pid]].sort((a, b) => a.nama.localeCompare(b.nama));

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      
      // Check if we need a new page for the title and at least some table rows
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.text(`Nama Penguji : ${pName}`, 14, currentY);
      currentY += 4; // Add a little space before table

      const tableData: any[][] = [];
      for (const s of pSiswa) {
        tableData.push([
          rowIndex++,
          s.nama,
          s.username || s.nis || '-', // User
          s.password || '1234', // Sandi default / fallback
        ]);
      }

      autoTable(doc, {
        startY: currentY,
        head: [['No', 'Nama', 'User', 'Sandi']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 1,
          valign: 'middle',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          overflow: 'ellipsize'
        },
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          halign: 'center',
          fontStyle: 'bold',
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        bodyStyles: {
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { },
          2: { halign: 'center', cellWidth: 40 },
          3: { halign: 'center', cellWidth: 30 }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  doc.save(`Data_User_Peserta_Sertifikasi.pdf`);
};
