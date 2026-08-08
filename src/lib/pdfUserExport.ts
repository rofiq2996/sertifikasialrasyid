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

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 14, 10, 15, 15);
    }

    // Add Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`DATA USER PESERTA SERTIFIKASI AL-QUR'AN`, 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Juz ${juz}`, 105, 25, { align: 'center' });

    // Sort by name
    const sortedSiswa = [...siswaForJuz].sort((a, b) => a.nama.localeCompare(b.nama));

    const tableData: any[][] = [];
    let rowIndex = 1;

    for (const s of sortedSiswa) {
      tableData.push([
        rowIndex++,
        s.nama,
        s.username || s.nis || '-', // User
        s.password || '1234', // Sandi default / fallback
      ]);
    }

    autoTable(doc, {
      startY: 32,
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
        0: { halign: 'center' },
        1: { },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' }
      }
    });
  }

  doc.save(`Data_User_Peserta_Sertifikasi.pdf`);
};
