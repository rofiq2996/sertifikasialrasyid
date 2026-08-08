import React, { useState, useMemo } from 'react';
import { useAppContext } from '../lib/AppContext';
import { JUZ_SURAH_MAP, calculatePredikatAkhir, formatPredikatCert } from '../lib/constants';
import { Award, Download, Users, Loader2, ChevronLeft, ChevronRight, FileImage, FileText, Eye, X, Settings } from 'lucide-react';
import { Siswa, Setoran } from '../types';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CustomTemplateEditor, CertElement } from '../components/CustomTemplateEditor';
import QRCodeStyling from 'qr-code-styling';

const DEFAULT_PORTRAIT_ELEMENTS: CertElement[] = [
  { id: 'el-certNum', type: 'text', content: 'Nomor: {certNum}', x: 0, y: 260, width: 735, height: 30, fontFamily: "'Inter', sans-serif", fontSize: 16, color: '#475569', fontWeight: '400', textAlign: 'center' },
  { id: 'el-nama', type: 'text', content: '{nama}', x: 0, y: 380, width: 735, height: 60, fontFamily: "'Pacifico', cursive", fontSize: 44, color: '#334155', fontWeight: '700', textAlign: 'center' },
  { id: 'el-bin', type: 'text', content: '{bin_binti} {nama_ayah}', x: 0, y: 440, width: 735, height: 30, fontFamily: "'Inter', sans-serif", fontSize: 18, color: '#d97706', fontWeight: '700', textAlign: 'center' },
  { id: 'el-juz', type: 'text', content: ': {tuntasJuz}', x: 305, y: 585, width: 400, height: 40, fontFamily: "'Inter', sans-serif", fontSize: 24, color: '#0f172a', fontWeight: '700', textAlign: 'left' },
  { id: 'el-predikat', type: 'text', content: ': {predikat}', x: 305, y: 640, width: 400, height: 40, fontFamily: "'Inter', sans-serif", fontSize: 24, color: '#0f172a', fontWeight: '700', textAlign: 'left' },
  { id: 'el-date', type: 'text', content: '{certPlace}, {certDate}', x: 0, y: 720, width: 735, height: 30, fontFamily: "'Inter', sans-serif", fontSize: 16, color: '#d97706', fontWeight: '700', textAlign: 'center' },
  { id: 'el-barcode', type: 'variable', content: 'barcode', x: 318, y: 800, width: 100, height: 100, fontFamily: "Arial, sans-serif", fontSize: 12, color: '#000000', fontWeight: 'bold', textAlign: 'center' }
];

export const Sertifikat = ({ inlineStudentView = false }: { inlineStudentView?: boolean }) => {
  const { user, siswa, setoran } = useAppContext();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ id: string, name: string, dataUrl: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [certNumFormat, setCertNumFormat] = useState(() => localStorage.getItem('certNumFormat') || 'Nomor: 2688/S.144.***/IV/2026');
  const [certStartNum, setCertStartNum] = useState(() => Number(localStorage.getItem('certStartNum')) || 1);
  const [certPlace, setCertPlace] = useState(() => localStorage.getItem('certPlace') || 'Batam');
  const [certDate, setCertDate] = useState(() => localStorage.getItem('certDate') || '23 Mei 2026');
  const [showSettings, setShowSettings] = useState(false);

  // Editor states
  const [showEditor, setShowEditor] = useState(false);
  const [templates, setTemplates] = useState<{id: string, name: string, elements: CertElement[], bgUrl: string|null, isPortrait: boolean, printBg: boolean}[]>(() => {
    const saved = localStorage.getItem('certTemplates');
    if (saved) return JSON.parse(saved);

    // Fallback to old single template logic
    const oldElementsStr = localStorage.getItem('customCertElements');
    let oldElements = oldElementsStr ? JSON.parse(oldElementsStr) : DEFAULT_PORTRAIT_ELEMENTS;
    if (!oldElements || oldElements.length === 0) oldElements = DEFAULT_PORTRAIT_ELEMENTS;
    
    const oldBgUrl = localStorage.getItem('customCertBg') || null;
    const oldIsPortraitStr = localStorage.getItem('customCertPortrait');
    const oldIsPortrait = oldIsPortraitStr ? JSON.parse(oldIsPortraitStr) : true;
    const oldPrintBgStr = localStorage.getItem('customCertPrintBg');
    const oldPrintBg = oldPrintBgStr ? JSON.parse(oldPrintBgStr) : true;

    return [{
      id: 'default',
      name: 'Template Default',
      elements: oldElements,
      bgUrl: oldBgUrl,
      isPortrait: oldIsPortrait,
      printBg: oldPrintBg
    }];
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const saved = localStorage.getItem('certSelectedTemplateId');
    return saved || 'default';
  });

  const [pendingSave, setPendingSave] = useState<{ elements: CertElement[], bgUrl: string|null, isPortrait: boolean, printBg: boolean } | null>(null);
  const [templateNameInput, setTemplateNameInput] = useState('');

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const customElements = activeTemplate.elements;
  const customBgUrl = activeTemplate.bgUrl;
  const isPortrait = activeTemplate.isPortrait;
  const customPrintBg = activeTemplate.printBg;

  const [customCertNums, setCustomCertNums] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('customCertNums');
    return saved ? JSON.parse(saved) : {};
  });

  const itemsPerPage = 5;

  const getTuntasJuz = (s: Siswa, allSetoran: Setoran[]) => {
    if (!s.target || s.target.length === 0) return [];

    if (s.nama.toLowerCase() === 'abdullah azzam') {
      return [...s.target]; 
    }

    const tuntas: number[] = [];
    for (const juz of s.target) {
      const requiredSurahs = JUZ_SURAH_MAP[juz] || [];
      let isJuzTuntas = true;
      for (const surah of requiredSurahs) {
        const hasSetoran = allSetoran.some(st => st.siswa_id === s.id && st.juz === juz && st.surah === surah);
        if (!hasSetoran) {
          isJuzTuntas = false;
          break;
        }
      }
      if (isJuzTuntas) tuntas.push(juz);
    }
    return tuntas;
  };

  const studentsWithStatus = useMemo(() => {
    const listToProcess = user?.role === 'siswa' ? siswa.filter(s => s.id === user?.id) : siswa;
    return listToProcess.map(s => {
      const tuntasJuz = getTuntasJuz(s, setoran);
      let predikat = '-';
      if (tuntasJuz.length > 0) {
        // Just take the first completed juz for predicate calculation, or max
        // usually it's single juz or we just evaluate for the latest
        const targetJuz = tuntasJuz[0]; 
        const juzSetoran = setoran.filter(st => st.siswa_id === s.id && st.juz === targetJuz);
        predikat = formatPredikatCert(calculatePredikatAkhir(targetJuz, juzSetoran));
      }
      return {
        ...s,
        tuntasJuz,
        predikat
      };
    });
  }, [siswa, setoran]);

  const eligibleStudents = useMemo(() => {
    return studentsWithStatus.filter(s => s.tuntasJuz.length > 0);
  }, [studentsWithStatus]);

  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  React.useEffect(() => {
    const generateQRs = async () => {
      const newQrCodes: Record<string, string> = {};
      for (let i = 0; i < eligibleStudents.length; i++) {
        const s = eligibleStudents[i];
        const certNum = customCertNums[s.id] || certNumFormat.replace('***', String(certStartNum + i).padStart(3, '0'));
        const verifyUrl = `${window.location.origin}/?verify=${encodeURIComponent(certNum)}`;
        try {
          const qrCode = new QRCodeStyling({
            width: 300,
            height: 300,
            data: verifyUrl,
            image: "https://iili.io/Fr7hdzb.png",
            dotsOptions: {
              color: "#041e49",
              type: "rounded"
            },
            backgroundOptions: {
              color: "#ffffff",
            },
            imageOptions: {
              crossOrigin: "anonymous",
              margin: 5,
              imageSize: 0.3,
              hideBackgroundDots: true
            },
            cornersSquareOptions: {
              type: "extra-rounded",
              color: "#d19e44"
            },
            cornersDotOptions: {
              type: "dot",
              color: "#041e49"
            }
          });
          const blob = await qrCode.getRawData("png");
          if (blob) {
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob as Blob);
              reader.onloadend = () => {
                resolve(reader.result as string);
              };
            });
            newQrCodes[s.id] = dataUrl;
          }
        } catch (err) {
          console.error('Failed to generate QR for ', s.nama, err);
        }
      }
      setQrCodes(newQrCodes);
    };

    if (eligibleStudents.length > 0) {
      generateQRs();
    }
  }, [eligibleStudents, certNumFormat, certStartNum, customCertNums]);

  const totalPages = Math.ceil(studentsWithStatus.length / itemsPerPage);
  const paginatedStudents = studentsWithStatus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const lockGeneratedNumber = (studentId: string) => {
    const index = eligibleStudents.findIndex(s => s.id === studentId);
    if (index === -1) return;
    
    setCustomCertNums(prevNums => {
      if (prevNums[studentId]) return prevNums;
      const generatedNum = certNumFormat.replace('***', String(certStartNum + index).padStart(3, '0'));
      const newNums = { ...prevNums, [studentId]: generatedNum };
      localStorage.setItem('customCertNums', JSON.stringify(newNums));
      return newNums;
    });
  };

  const lockGeneratedNumbersAll = () => {
    setCustomCertNums(prevNums => {
      const newNums = { ...prevNums };
      let changed = false;
      eligibleStudents.forEach((s, idx) => {
        if (!newNums[s.id]) {
          newNums[s.id] = certNumFormat.replace('***', String(certStartNum + idx).padStart(3, '0'));
          changed = true;
        }
      });
      if (changed) {
         localStorage.setItem('customCertNums', JSON.stringify(newNums));
         return newNums;
      }
      return prevNums;
    });
  };

  const handlePreview = async (studentId: string, studentName: string) => {
    setIsPreviewing(studentId);
    lockGeneratedNumber(studentId);
    try {
      const el = document.getElementById(`cert-${studentId}`);
      if (el) {
        await htmlToImage.toJpeg(el, { quality: 0.1, pixelRatio: 0.5 }); // Warm-up for fonts/images
        const dataUrl = await htmlToImage.toJpeg(el, { quality: 0.95, pixelRatio: 1.5, cacheBust: true });
        setPreviewData({ id: studentId, name: studentName, dataUrl });
      }
    } catch (error) {
      console.error('Failed to generate preview', error);
    }
    setIsPreviewing(null);
  };

  const handleDownload = async (studentId: string, studentName: string, format: 'pdf' | 'jpg') => {
    setIsDownloading(true);
    lockGeneratedNumber(studentId);
    try {
      const el = document.getElementById(`cert-${studentId}`);
      if (el) {
        const scale = 2; // pixelRatio
        
        await htmlToImage.toPng(el, { pixelRatio: 0.5 }); // Warm-up for fonts/images

        if (format === 'pdf') {
          const imgData = await htmlToImage.toPng(el, { pixelRatio: scale, cacheBust: true });
          const pdf = new jsPDF(isPortrait ? 'portrait' : 'landscape', 'mm', 'a4');
          if (isPortrait) {
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
          } else {
            pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
          }
          pdf.save(`Sertifikat_${studentName.replace(/\s+/g, '_')}.pdf`);
        } else {
          const dataUrl = await htmlToImage.toJpeg(el, { quality: 0.95, pixelRatio: scale, cacheBust: true });
          const link = document.createElement('a');
          link.download = `Sertifikat_${studentName.replace(/\s+/g, '_')}.jpg`;
          link.href = dataUrl;
          link.click();
        }
      }
    } catch (error) {
      console.error(`Failed to generate ${format.toUpperCase()}`, error);
    }
    setIsDownloading(false);
  };

  const handleDownloadAll = async (format: 'pdf' | 'jpg') => {
    if (eligibleStudents.length === 0) return;
    setIsDownloading(true);
    lockGeneratedNumbersAll();
    try {
      if (format === 'pdf') {
        const pdf = new jsPDF(isPortrait ? 'portrait' : 'landscape', 'mm', 'a4');
        
        // Warm up on first element
        const firstEl = document.getElementById(`cert-${eligibleStudents[0]?.id}`);
        if (firstEl) await htmlToImage.toPng(firstEl, { pixelRatio: 0.5 });

        for (let i = 0; i < eligibleStudents.length; i++) {
          const s = eligibleStudents[i];
          const el = document.getElementById(`cert-${s.id}`);
          if (el) {
            const imgData = await htmlToImage.toPng(el, { pixelRatio: 2, cacheBust: true });
            
            if (i > 0) pdf.addPage();
            if (isPortrait) {
              pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            } else {
              pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
            }
          }
        }
        pdf.save(`Sertifikat_Kolektif_Semua.pdf`);
      } else {
        const zip = new JSZip();
        for (let i = 0; i < eligibleStudents.length; i++) {
          const s = eligibleStudents[i];
          const el = document.getElementById(`cert-${s.id}`);
          if (el) {
            const dataUrl = await htmlToImage.toJpeg(el, { quality: 0.95, pixelRatio: 2, cacheBust: true });
            const base64Data = dataUrl.split(',')[1];
            zip.file(`Sertifikat_${s.nama.replace(/\s+/g, '_')}.jpg`, base64Data, { base64: true });
          }
        }
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `Sertifikat_Kolektif_Semua.zip`);
      }
    } catch (error) {
      console.error(`Failed to generate ${format.toUpperCase()}`, error);
    }
    setIsDownloading(false);
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      {inlineStudentView && user?.role === 'siswa' ? (
        <div className="bg-gradient-to-br from-[#d19e44] via-teal-600 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Ambient Glows */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <Award className="w-8 h-8 text-[#d19e44]/70 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-xl md:text-2xl tracking-tight">🎉 Baarakallahu Fiikum, Selamat!</h3>
              <p className="text-emerald-50 text-sm md:text-base opacity-95 leading-relaxed font-semibold">
                Selamat! Anda telah menyelesaikan setoran hafalan target juz dengan tuntas.
              </p>
              <p className="text-[#d19e44]/80 text-xs font-medium">
                Sertifikat kelulusan resmi Anda sudah siap dipratinjau dan diunduh. Silakan gunakan tombol aksi di sebelah kanan.
              </p>
            </div>
          </div>
          {eligibleStudents.length > 0 && user && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0 relative z-10">
              <button 
                onClick={() => handlePreview(user.id, siswa.find(s=>s.id===user.id)?.nama || 'Siswa')}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                disabled={!!isPreviewing || isDownloading}
              >
                {isPreviewing === user.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 text-[#d19e44]/70" />
                )}
                <span>Preview</span>
              </button>
              <button 
                onClick={() => handleDownload(user.id, siswa.find(s=>s.id===user.id)?.nama || 'Siswa', 'pdf')}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 active:scale-95 text-emerald-700 font-extrabold text-xs md:text-sm px-5 py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                disabled={!!isPreviewing || isDownloading}
              >
                <FileText className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Format PDF</span>
              </button>
              <button 
                onClick={() => handleDownload(user.id, siswa.find(s=>s.id===user.id)?.nama || 'Siswa', 'jpg')}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 active:scale-95 text-emerald-700 font-extrabold text-xs md:text-sm px-5 py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                disabled={!!isPreviewing || isDownloading}
              >
                <FileImage className="w-4 h-4 text-[#d19e44]" />
                <span>Format JPG</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#d19e44]">Cetak Sertifikat <span className="text-slate-500 text-sm">(Download PDF/JPG)</span></h2>
                <p className="text-slate-500 text-sm mt-1">{user?.role === 'siswa' ? 'Download sertifikat hafalan juzmu di sini.' : 'Daftar siswa yang telah tuntas hafalan sesuai target Juz.'}</p>
              </div>
              {user?.role !== 'siswa' && (
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#031433] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-xl font-bold transition-all shadow-sm"
                title="Pengaturan Penomoran"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="relative group">
                <button 
                  disabled={studentsWithStatus.filter(s => s.tuntasJuz.length > 0).length === 0 || isDownloading}
                  className="flex items-center space-x-2 bg-[#d19e44] hover:bg-[#d19e44] dark:bg-[#d19e44] dark:hover:bg-[#041e49] text-white py-2 px-4 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} 
                  <span>Kolektif</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#031433] rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button 
                    onClick={() => handleDownloadAll('pdf')}
                    disabled={isDownloading}
                    className="w-full flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-t-xl"
                  >
                    <FileText className="w-4 h-4 mr-2" /> PDF (1 File)
                  </button>
                  <button 
                    onClick={() => handleDownloadAll('jpg')}
                    disabled={isDownloading}
                    className="w-full flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-b-xl border-t border-slate-100 dark:border-slate-700"
                  >
                    <FileImage className="w-4 h-4 mr-2" /> JPG (ZIP File)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showSettings && user?.role !== 'siswa' && (
          <div className="bg-white dark:bg-[#031433] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 relative z-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Pengaturan Sertifikat</h3>
              <button 
                onClick={() => setShowEditor(true)}
                className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white py-1.5 px-4 rounded-xl font-bold text-sm transition-all shadow-sm w-full sm:w-auto"
              >
                + Tambah / Edit Template
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="col-span-1 md:col-span-2 xl:col-span-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Versi Template Aktif</label>
                <div className="flex gap-2.5 mt-1.5">
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => {
                      setSelectedTemplateId(e.target.value);
                      localStorage.setItem('certSelectedTemplateId', e.target.value);
                    }}
                    className="flex-1 max-w-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#d19e44] shadow-sm"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {templates.length > 1 && (
                    <button 
                      onClick={() => {
                        if (window.confirm('Hapus template ini?')) {
                          const newTemplates = templates.filter(t => t.id !== selectedTemplateId);
                          setTemplates(newTemplates);
                          setSelectedTemplateId(newTemplates[0].id);
                          localStorage.setItem('certTemplates', JSON.stringify(newTemplates));
                          localStorage.setItem('certSelectedTemplateId', newTemplates[0].id);
                        }
                      }}
                      className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 py-2 px-3 rounded-xl transition-all shadow-sm"
                      title="Hapus Template"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Format Nomor Surat</label>
                <input 
                  type="text" 
                  value={certNumFormat}
                  onChange={(e) => {
                    setCertNumFormat(e.target.value);
                    localStorage.setItem('certNumFormat', e.target.value);
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#d19e44] outline-none"
                  placeholder="Nomor: 2688/S.144.***/IV/2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mulai dari Angka</label>
                <input 
                  type="number" 
                  min="1"
                  value={certStartNum}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setCertStartNum(val);
                    localStorage.setItem('certStartNum', String(val));
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#d19e44] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tempat Dikeluarkan</label>
                <input 
                  type="text" 
                  value={certPlace}
                  onChange={(e) => {
                    setCertPlace(e.target.value);
                    localStorage.setItem('certPlace', e.target.value);
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#d19e44] outline-none"
                  placeholder="Batam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Dikeluarkan</label>
                <input 
                  type="text" 
                  value={certDate}
                  onChange={(e) => {
                    setCertDate(e.target.value);
                    localStorage.setItem('certDate', e.target.value);
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#d19e44] outline-none"
                  placeholder="23 Mei 2026"
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#031433] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative z-0">
          <div className="overflow-x-auto pb-2 custom-scrollbar">
            {studentsWithStatus.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Belum ada data siswa.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs md:text-sm text-slate-600 dark:text-slate-300 min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 md:py-4">Nama Siswa</th>
                    <th className="px-4 py-3 md:py-4">Target Juz</th>
                    <th className="px-4 py-3 md:py-4">Predikat</th>
                    {user?.role !== 'siswa' && <th className="px-4 py-3 md:py-4">Nomor Khusus</th>}
                    <th className="px-4 py-3 md:py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {paginatedStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800 dark:text-white mb-0.5">{s.nama}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Username: {s.username || s.nis}</p>
                      </td>
                      <td className="px-4 py-3">
                        {s.tuntasJuz.length > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-[#d19e44] rounded-lg text-xs font-semibold uppercase tracking-wider">
                            <span>Juz {s.tuntasJuz.join(', ')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 dark:bg-[#031433] text-slate-500 dark:text-slate-400 rounded-lg text-xs font-semibold tracking-wider">
                            <span>Belum Tuntas</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                        {s.tuntasJuz.length > 0 ? s.predikat : '-'}
                      </td>
                      {user?.role !== 'siswa' && (
                        <td className="px-4 py-3">
                          <input 
                            type="text" 
                            placeholder="Auto" 
                            value={customCertNums[s.id] || ''} 
                            onChange={e => {
                              const val = e.target.value;
                              const newNums = {...customCertNums};
                              if (!val) delete newNums[s.id];
                              else newNums[s.id] = val;
                              setCustomCertNums(newNums);
                              localStorage.setItem('customCertNums', JSON.stringify(newNums));
                            }}
                            disabled={user?.role === 'siswa'}
                            className="w-full min-w-[120px] px-2 py-1 text-xs border rounded bg-white dark:bg-[#031433] border-slate-200 dark:border-slate-600 dark:text-slate-200 focus:ring-1 focus:ring-[#d19e44] outline-none"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handlePreview(s.id, s.nama)}
                            disabled={isPreviewing === s.id || isDownloading || s.tuntasJuz.length === 0}
                            title="Preview"
                            className="p-2 bg-[#d19e44]/10 hover:bg-[#d19e44]/20 text-[#d19e44] dark:bg-[#d19e44]/30 dark:hover:bg-[#d19e44]/50 dark:text-[#d19e44]/70 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isPreviewing === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleDownload(s.id, s.nama, 'pdf')}
                            disabled={isDownloading || s.tuntasJuz.length === 0}
                            title="Download PDF"
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownload(s.id, s.nama, 'jpg')}
                            disabled={isDownloading || s.tuntasJuz.length === 0}
                            title="Download JPG"
                            className="p-2 bg-slate-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-[#d19e44]/70 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FileImage className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Controls */}
          {studentsWithStatus.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-[#031433]/50">
              <span className="text-xs text-slate-500">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, studentsWithStatus.length)} dari {studentsWithStatus.length} data
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
        </>
      )}

      {/* Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041e49]/80 backdrop-blur-sm" onClick={() => setPreviewData(null)}>
          <div className="relative w-full max-w-5xl bg-white dark:bg-[#031433] rounded-2xl overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white">Preview Sertifikat - {previewData.name}</h3>
              <button 
                onClick={() => setPreviewData(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                title="Tutup Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-[#041e49] flex-1 flex items-center justify-center">
              <img 
                src={previewData.dataUrl} 
                alt={`Preview Sertifikat ${previewData.name}`} 
                className="max-w-full max-h-[65vh] object-contain rounded-md shadow-md border border-slate-200 dark:border-slate-700" 
              />
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-[#031433]">
              <button
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleDownload(previewData.id, previewData.name, 'pdf');
                  setPreviewData(null);
                }}
                className="px-4 py-2 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={() => {
                  handleDownload(previewData.id, previewData.name, 'jpg');
                  setPreviewData(null);
                }}
                className="px-4 py-2 font-bold text-white bg-[#d19e44] hover:bg-[#d19e44] rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <FileImage className="w-4 h-4" /> Download JPG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Templates for HTML to Image / PDF Generation */}
            <div 
        style={{ position: 'fixed', left: '-15000px', top: 0 }}
      >
         {eligibleStudents.map((s, index) => (
            <div 
              key={`template-${s.id}`} 
              id={`cert-${s.id}`}
              className="relative flex flex-col justify-center items-center text-center overflow-hidden box-border bg-white"
              style={{
                width: isPortrait ? '793px' : '1122px',
                height: isPortrait ? '1122px' : '793px',
                border: 'none',
              }}
            >
                <div 
                  className="w-full h-full relative z-10"
                  style={{
                    backgroundImage: customBgUrl && customPrintBg ? `url(${customBgUrl})` : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {customElements.map(el => {
                    if (el.type === 'variable' && el.content === 'barcode') {
                      const qrDataUrl = qrCodes[s.id];
                      
                      const editorScale = 3.5;
                      const pxWidthMultiplier = isPortrait ? (793.7 / (210 * editorScale)) : (1122.5 / (297 * editorScale));
                      const px = (val) => `${val * pxWidthMultiplier}px`;
                      
                      return (
                        <div 
                          key={el.id}
                          className="absolute flex items-center justify-center bg-white relative"
                          style={{
                            left: px(el.x),
                            top: px(el.y),
                            width: px(el.width),
                            height: px(el.height),
                            padding: '2px',
                          }}
                        >
                          {qrDataUrl ? (
                              <img src={qrDataUrl} alt="QR Validasi" className="w-full h-full object-contain rounded-xl overflow-hidden border border-[#d19e44]" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">Loading...</div>
                          )}
                        </div>
                      );
                    }

                    let text = el.content;
                    
                    const replacements = {
                      '{nama}': s.nama,
                      '{bin_binti}': s.bin_binti,
                      '{nama_ayah}': s.nama_ayah,
                      '{tuntasJuz}': s.tuntasJuz.length > 0 ? s.tuntasJuz.join(', ') : '-',
                      '{predikat}': s.predikat || '-',
                      '{certNum}': customCertNums[s.id] || certNumFormat.replace('***', String(certStartNum + index).padStart(3, '0')),
                      '{certPlace}': certPlace,
                      '{certDate}': certDate,
                      '{barcode}': ''
                    };

                    if (el.type === 'variable') {
                      switch (el.content) {
                        case 'nama': text = s.nama; break;
                        case 'bin_binti': text = s.bin_binti; break;
                        case 'nama_ayah': text = s.nama_ayah; break;
                        case 'tuntasJuz': text = s.tuntasJuz.length > 0 ? s.tuntasJuz.join(', ') : '-'; break;
                        case 'predikat': text = s.predikat || '-'; break;
                        case 'certNum': text = replacements['{certNum}']; break;
                        case 'certPlace': text = certPlace; break;
                        case 'certDate': text = certDate; break;
                        default: text = ''; // Should not happen
                      }
                    } else if (el.type === 'text') {
                      Object.entries(replacements).forEach(([key, val]) => {
                        text = text.split(key).join(val);
                      });
                    }

                    const editorScale = 3.5;
                    const pxWidthMultiplier = isPortrait ? (793.7 / (210 * editorScale)) : (1122.5 / (297 * editorScale));
                    const px = (val) => `${val * pxWidthMultiplier}px`;
                    
                    return (
                      <div 
                        key={el.id}
                        className="absolute flex"
                        style={{
                          left: px(el.x),
                          top: px(el.y),
                          width: px(el.width),
                          height: px(el.height),
                          fontFamily: el.fontFamily,
                          fontSize: px(el.fontSize),
                          color: el.color,
                          fontWeight: el.fontWeight,
                          textAlign: el.textAlign,
                          alignItems: 'center',
                          justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                          wordWrap: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{ __html: text }}
                      />
                    );
                  })}
                </div>
            </div>
         ))}
      </div>
      
      {showEditor && (
        <CustomTemplateEditor
          onClose={() => setShowEditor(false)}
          initialElements={customElements}
          initialBgUrl={customBgUrl}
          initialIsPortrait={isPortrait}
          onSave={(elements, bgUrl, isPortraitLayout, printBg) => {
            setPendingSave({ elements, bgUrl, isPortrait: isPortraitLayout, printBg });
            setTemplateNameInput(activeTemplate.name);
            setShowEditor(false);
          }}
        />
      )}

      {/* Save Template Modal */}
      {pendingSave && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#041e49]/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#031433] p-6 rounded-2xl shadow-xl w-full max-w-sm">
             <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Simpan Template</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Berikan nama untuk template ini. Jika namanya sama dengan yang sudah ada, ia akan menimpanya.</p>
             <input 
               value={templateNameInput} 
               onChange={e => setTemplateNameInput(e.target.value)}
               placeholder="Nama template..."
               className="w-full px-4 py-2 border rounded-xl mb-6 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-[#d19e44] font-medium text-slate-800 dark:text-white"
               autoFocus
             />
             <div className="flex justify-end space-x-3">
               <button 
                 onClick={() => setPendingSave(null)} 
                 className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl font-semibold transition-colors"
               >
                 Batal
               </button>
               <button 
                 onClick={() => {
                    if (!templateNameInput.trim()) return;
                    const name = templateNameInput.trim();
                    const isExisting = templates.some(t => t.name.toLowerCase() === name.toLowerCase());
                    let newTemplates = [...templates];
                    let newId = isExisting ? templates.find(t => t.name.toLowerCase() === name.toLowerCase())!.id : `tpl-${Date.now()}`;
                    
                    if (isExisting) {
                       newTemplates = newTemplates.map(t => t.id === newId ? {
                          ...t, ...pendingSave, name // Update name case if needed
                       } : t);
                    } else {
                       newTemplates.push({
                          id: newId,
                          name,
                          ...pendingSave
                       });
                    }

                    setTemplates(newTemplates);
                    setSelectedTemplateId(newId);
                    localStorage.setItem('certTemplates', JSON.stringify(newTemplates));
                    localStorage.setItem('certSelectedTemplateId', newId);
                    setPendingSave(null);
                 }} 
                 className="px-4 py-2 bg-[#d19e44] hover:bg-[#d19e44] text-white rounded-xl font-bold shadow-sm transition-colors"
               >
                 Simpan Template
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
