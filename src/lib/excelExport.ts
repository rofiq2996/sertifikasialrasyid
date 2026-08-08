import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Siswa, Setoran } from '../types';
import { JUZ_SURAH_MAP, formatNilai, calculatePredikatAkhir, getSurahNumber, SURAH_AYAT_COUNT } from './constants';

export const exportLaporanToExcel = async (
  filteredSetoran: Setoran[],
  siswaList: Siswa[],
  exportFormat: string
) => {
  const workbook = new ExcelJS.Workbook();
  const juzSet = new Set<number>();

  let imageId: number | undefined;
  try {
    const response = await fetch('https://iili.io/Fr7hdzb.png');
    if (response.ok) {
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      imageId = workbook.addImage({
        buffer: buffer,
        extension: 'png',
      });
    }
  } catch (e) {
    console.warn("Failed to load logo", e);
  }

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

  // Determine students to be displayed
  // If no specific setoran filter on student names/penguji, this might be all students.
  // Actually, we should probably evaluate which students are "active" for the current filter.
  // But wait! If we do filterJuz !== 'All', filterSetoran only has students for that Juz!
  // To avoid hiding students who just haven't setoran yet in this Juz...
  // Let's just list all siswaList, but wait, siswaList in Laporan is ALL students.
  // The user probably only wants students who match the Search and Penguji filter.
  // But since we didn't pass the raw search/penguji query down, we can derive the students
  // from filteredSetoran ONLY IF they had any setoran.
  // But what if a student has NO setoran at all? They'd be excluded.
  // Let's stick to students who are currently in `filteredSetoran` if any,
  // OR just list all `siswaList`, because Rekapitulasi might need to list everyone!

  for (const juz of juzArray) {
    const sheet = workbook.addWorksheet(`Juz ${juz}`);
    const setoranJuz = filteredSetoran.filter(s => s.juz === juz);

    // Determine Columns for given Juz
    let columnsDef: string[] = [];
    if (exportFormat === 'semua_nilai') {
      if (juz === 30 || juz === 29) {
        columnsDef = JUZ_SURAH_MAP[juz] || [];
      } else {
        // Juz 1-28: Max setoran columns
        let maxSetoranCount = 0;
        const siswaToInclude = [...siswaList].sort((a, b) => a.nama.localeCompare(b.nama));
        for (const siswa of siswaToInclude) {
           const count = setoranJuz.filter(s => s.siswa_id === siswa.id).length;
           if (count > maxSetoranCount) maxSetoranCount = count;
        }
        for (let i = 1; i <= maxSetoranCount; i++) {
           columnsDef.push(`S${i}`);
        }
        if (maxSetoranCount === 0) columnsDef.push('S1');
      }
    }

    // Title
    const totalCols = columnsDef.length + 6;
    sheet.mergeCells(1, 1, 1, totalCols);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = `REKAPITULASI SERTIFIKASI AL-QUR'AN - Juz ${juz}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    sheet.getRow(1).height = 70;

    if (imageId !== undefined) {
      // Add logo to the top left (around column 1, row 1)
      sheet.addImage(imageId, {
        tl: { col: 0.5, row: 0.2 },
        ext: { width: 70, height: 70 }
      });
    }

    sheet.addRow([]); // empty row

    // Header Row
    const headerRowValues = ['No', 'Nama', 'Bin/Binti', 'Nama Ayah'];
    for (let i = 0; i < columnsDef.length; i++) {
      if (juz === 30 || juz === 29) {
         headerRowValues.push((i + 1).toString());
      } else {
         headerRowValues.push(columnsDef[i]);
      }
    }
    headerRowValues.push('Predikat');

    const headerRow = sheet.addRow(headerRowValues);
    headerRow.height = 30; // Increase header row height a bit to match "lebar row" if it meant height, or just for better looks
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 12, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // All headers have the same green background
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF92D050' } 
      };
    });

    // Include all filtered students
    const siswaToInclude = [...siswaList].sort((a, b) => a.nama.localeCompare(b.nama));
    let rowIndex = 1;

    for (const siswa of siswaToInclude) {
      const siswaId = siswa.id;

      const siswaSetoran = setoranJuz.filter(s => s.siswa_id === siswaId);
      const rowValues: any[] = [
        rowIndex++,
        siswa.nama,
        siswa.bin_binti || '-',
        siswa.nama_ayah || '-'
      ];

      const nilaiArray: string[] = [];

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

      if (exportFormat === 'semua_nilai') {
        for (let i = 0; i < columnsDef.length; i++) {
          const colDef = columnsDef[i];
          let found;
          let cellVal = '-';
          if (juz === 30 || juz === 29) {
            found = siswaSetoran.find(s => s.surah === colDef);
            if (found) {
              cellVal = formatNilai(found.nilai);
            }
          } else {
            const sortedSetoran = [...siswaSetoran].sort((a,b) => new Date(a.tgl).getTime() - new Date(b.tgl).getTime());
            found = sortedSetoran[i];
            if (found) {
              let ayatStr = found.ayat || '';
              ayatStr = ayatStr.replace('Ayat ', '');
              if (ayatStr === 'Lengkap 1 Surah' || ayatStr === 'Lengkap') {
                 const maxAyat = SURAH_AYAT_COUNT[found.surah] || '';
                 ayatStr = `1-${maxAyat}`;
              }
              cellVal = `${getSurahNumber(found.surah)} (${ayatStr}) ${formatNilai(found.nilai)}`;
            }
          }

          if (juz === 30 || juz === 29) {
            rowValues.push(found ? cellVal : '');
          } else {
            rowValues.push(cellVal);
          }
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

      const dataRow = sheet.addRow(rowValues);
      dataRow.eachCell((cell, colN) => {
        cell.font = { name: 'Arial', size: 12 };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (colN === 1 || colN === 3 || colN === 4 || colN > 5) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
            cell.alignment = { vertical: 'middle' };
        }
      });
    }

    // Auto-fit columns
    sheet.columns.forEach((column, i) => {
      // Score columns should have a fixed width of 5
      if (i > 4 && i < 5 + columnsDef.length) {
        column.width = 5;
        return;
      }

      let maxLength = 0;
      column.eachCell!({ includeEmpty: true }, (cell: any) => {
        if (Number(cell.row) <= 2) return; // Skip title and empty row for width calculation
        
        // Do not include the "Nb. Keterangan Nomor Surat" instructions to width sizing
        if (cell.value && cell.value.toString().startsWith('Nb.')) return;

        let columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      // Add some padding and set minimum width
      let customMin = 10;
      let padding = 4;
      if (i === 1) { customMin = 25; padding = 8; } // Nama
      else if (i === 0) { customMin = 6; padding = 4; } // No
      else if (i === 3 || i === 4) { customMin = 15; padding = 8; } 

      column.width = Math.max(maxLength + padding, customMin);
    });

    // Add Nb. at bottom
    if (exportFormat === 'semua_nilai') {
      sheet.addRow([]);
      const nbTitleRow = sheet.addRow(['Nb. Keterangan Nomor Surat:']);
      nbTitleRow.getCell(1).font = { name: 'Arial', size: 12, italic: true, bold: true };
      
      const nbHeaderRow = sheet.addRow(['No', 'Nama Surat']);
      nbHeaderRow.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 12, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      if (juz === 30 || juz === 29) {
        const surahsToDisplay = JUZ_SURAH_MAP[juz] || [];
        for (let i = 0; i < surahsToDisplay.length; i++) {
            const itemRow = sheet.addRow([i + 1, surahsToDisplay[i]]);
            itemRow.eachCell((cell, colIndex) => {
              cell.font = { name: 'Arial', size: 12 };
              if (colIndex === 1) {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
              }
            });
        }
      } else if (juz < 29) {
        const surahsToDisplay = JUZ_SURAH_MAP[juz] || [];
        for (let i = 0; i < surahsToDisplay.length; i++) {
            const itemRow = sheet.addRow([getSurahNumber(surahsToDisplay[i]), surahsToDisplay[i]]);
            itemRow.eachCell((cell, colIndex) => {
              cell.font = { name: 'Arial', size: 12 };
              if (colIndex === 1) {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
              }
            });
        }
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Laporan_Setoran_Semua_Juz.xlsx`);
};
