import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Siswa, Setoran } from '../types';
import { JUZ_SURAH_MAP, formatNilai, calculatePredikatAkhir, getSurahNumber, SURAH_AYAT_COUNT } from './constants';

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

export const exportLaporanToPDF = async (
  filteredSetoran: Setoran[],
  siswaList: Siswa[]
) => {
  const juzSet = new Set<number>();
  filteredSetoran.forEach(s => juzSet.add(s.juz));

  // Sort juz: 30, 29, 1, 2, 3...
  const order = [30, 29, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  const juzArray = Array.from(juzSet).sort((a, b) => {
    const idxA = order.indexOf(a);
    const idxB = order.indexOf(b);
    return idxA - idxB;
  });

  if (juzArray.length === 0) {
    alert("Tidak ada data untuk diekspor");
    return;
  }

  const logoBase64 = await fetchLogoBase64();

  const doc = new jsPDF('p', 'mm', 'a4');
  let isFirstPage = true;

  const siswaToInclude = [...siswaList].sort((a, b) => a.nama.localeCompare(b.nama));

  for (const juz of juzArray) {
    const setoranJuz = filteredSetoran.filter(s => s.juz === juz);

    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 14, 10, 15, 15);
    }

    // Header Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`REKAP LAPORAN SERTIFIKASI`, 105, 15, { align: 'center' });
    doc.text(`Juz ${juz}`, 105, 22, { align: 'center' });

    const tableData: any[][] = [];
    let rowIndex = 1;

    for (const siswa of siswaToInclude) {
      const siswaId = siswa.id;
      const siswaSetoran = setoranJuz.filter(s => s.siswa_id === siswaId);

      const nilaiArray: string[] = [];
      const rowValues: any[] = [
        rowIndex++,
        siswa.nama,
        siswa.bin_binti || '-',
        siswa.nama_ayah || '-'
      ];

      if (juz === 30 || juz === 29) {
        const surahs = JUZ_SURAH_MAP[juz] || [];
        for (const surah of surahs) {
          const found = siswaSetoran.find(s => s.surah === surah);
          if (found) nilaiArray.push(found.nilai);
        }
      } else {
        const sortedSetoran = [...siswaSetoran].sort((a,b) => new Date(a.tgl).getTime() - new Date(b.tgl).getTime());
        for (const s of sortedSetoran) {
          nilaiArray.push(s.nilai);
        }
      }

      let predikat = '-';
      if (nilaiArray.length > 0) {
        predikat = calculatePredikatAkhir(juz, siswaSetoran);
      }
      
      if (predikat === 'Mumtaz (M)') predikat = 'M';
      if (predikat === 'Jayyid Jiddan (JJ)') predikat = 'JJ';
      if (predikat === 'Jayyid (J)') predikat = 'J';

      rowValues.push(predikat);

      tableData.push(rowValues);
    }

    autoTable(doc, {
      startY: 30,
      head: [['No', 'Nama', 'Bin/Binti', 'Nama Ayah', 'Predikat']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 1.5,
        valign: 'middle',
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        overflow: 'ellipsize'
      },
      headStyles: {
        fillColor: [146, 208, 80],
        textColor: [0, 0, 0],
        halign: 'center',
        fontStyle: 'bold',
        fontSize: 11,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      bodyStyles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
           if (data.column.index === 0 || data.column.index === 2 || data.column.index === 3 || data.column.index === 5) {
             data.cell.styles.halign = 'center';
           }
        }
        if (data.section === 'body' && data.column.index === 5) {
          const text = data.cell.raw;
          if (text === 'M') {
            data.cell.styles.textColor = [0, 176, 80]; // Green
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'JJ') {
            data.cell.styles.textColor = [0, 112, 192]; // Blue
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'J') {
            data.cell.styles.textColor = [255, 153, 0]; // Orange
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
  }

  doc.save(`Laporan_Setoran_Semua_Juz.pdf`);
};
