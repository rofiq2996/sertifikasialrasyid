import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { X, Plus, Trash2, Save, Move, Fullscreen, Undo2, Redo2, ZoomIn, ZoomOut, Pipette } from 'lucide-react';

export interface CertElement {
  id: string;
  type: 'text' | 'variable';
  content: string; // text content or variable name
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
}

interface CustomTemplateEditorProps {
  onClose: () => void;
  onSave: (elements: CertElement[], bgUrl: string | null, isPortrait: boolean, printBg: boolean) => void;
  initialElements?: CertElement[];
  initialBgUrl?: string | null;
  initialIsPortrait?: boolean;
}

const VARIABLE_OPTIONS = [
  { value: 'certNum', label: 'Nomor Surat' },
  { value: 'nama', label: 'Nama Siswa' },
  { value: 'bin_binti', label: 'Bin / Binti' },
  { value: 'nama_ayah', label: 'Nama Ayah' },
  { value: 'tuntasJuz', label: 'Juz Hafalan' },
  { value: 'predikat', label: 'Predikat' },
  { value: 'certPlace', label: 'Kota / Tempat' },
  { value: 'certDate', label: 'Tanggal Keluaran' },
  { value: 'barcode', label: 'Barcode / QR' },
];

export const CustomTemplateEditor: React.FC<CustomTemplateEditorProps> = ({ onClose, onSave, initialElements, initialBgUrl, initialIsPortrait }) => {
  const [elements, setElements] = useState<CertElement[]>(initialElements || []);
  const [history, setHistory] = useState<CertElement[][]>([initialElements || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateElementsWithHistory = (newElements: CertElement[]) => {
    setElements(newElements);
    const newHistory = [...history.slice(0, historyIndex + 1), newElements];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setElements(history[prevIdx]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setElements(history[nextIdx]);
    }
  };
  const [bgUrl, setBgUrl] = useState<string | null>(initialBgUrl || null);
  const [isPortrait, setIsPortrait] = useState(initialIsPortrait !== undefined ? initialIsPortrait : true);
  const [printBg, setPrintBg] = useState<boolean>(() => {
    const saved = localStorage.getItem('customCertPrintBg');
    return saved ? JSON.parse(saved) : true;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  // A4 dimensions at some scale (e.g., 2 pixels per mm for editor)
  // A4: 210 x 297 mm
  const scale = 3.5;
  const canvasWidth = isPortrait ? 210 * scale : 297 * scale;
  const canvasHeight = isPortrait ? 297 * scale : 210 * scale;

  const handleAddText = () => {
    const newEl: CertElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Teks Baru',
      x: canvasWidth / 2 - 100,
      y: canvasHeight / 2 - 20,
      width: 200,
      height: 40,
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      fontWeight: 'normal',
      textAlign: 'center',
    };
    updateElementsWithHistory([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const handleAddVariable = (variableName: string) => {
    const isBarcode = variableName === 'barcode';
    const newEl: CertElement = {
      id: `var-${Date.now()}`,
      type: 'variable',
      content: variableName,
      x: canvasWidth / 2 - (isBarcode ? 50 : 100),
      y: canvasHeight / 2 - (isBarcode ? 50 : 20),
      width: isBarcode ? 100 : 200,
      height: isBarcode ? 100 : 40,
      fontSize: isBarcode ? 12 : 32,
      fontFamily: isBarcode ? 'Arial, sans-serif' : "'Montserrat', sans-serif",
      color: '#000000',
      fontWeight: 'bold',
      textAlign: 'center',
    };
    updateElementsWithHistory([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateElement = (id: string, updates: Partial<CertElement>) => {
    updateElementsWithHistory(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const handleDelete = (id: string) => {
    updateElementsWithHistory(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !inlineEditingId) {
        // Prevent deleting if user is typing in a textarea or input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        handleDelete(selectedId);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, inlineEditingId, elements]);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setBgUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="fixed inset-0 bg-[#041e49] z-50 flex flex-col font-sans">
      {/* HEADER */}
      <div className="h-16 bg-white dark:bg-[#031433] border-b border-slate-200 dark:border-slate-700 flex justify-between items-center px-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Editor Sertifikat Visual</h2>
        <div className="flex space-x-3 items-center">
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mr-2 space-x-1 items-center">
            <button 
              onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 shadow-sm"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(z => Math.min(3, z + 0.1))}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 shadow-sm"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mr-2">
            <button 
              onClick={undo}
              disabled={historyIndex === 0}
              className={`p-1.5 rounded-md ${historyIndex === 0 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 shadow-sm'}`}
              title="Undo"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className={`p-1.5 rounded-md ${historyIndex === history.length - 1 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 shadow-sm'}`}
              title="Redo"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>
          <button onClick={() => {
            localStorage.setItem('customCertPrintBg', JSON.stringify(printBg));
            onSave(elements, bgUrl, isPortrait, printBg);
          }} className="flex items-center px-4 py-2 bg-[#d19e44] hover:bg-[#d19e44] text-white rounded-lg font-semibold">
            <Save className="w-4 h-4 mr-2" /> Simpan Template
          </button>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR TOOLS */}
        <div className="w-72 bg-white dark:bg-[#031433] border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto flex-shrink-0 flex flex-col space-y-6">
          
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Pengaturan Dasar</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-200">Orientasi</label>
                <select 
                  value={isPortrait ? 'portrait' : 'landscape'}
                  onChange={e => setIsPortrait(e.target.value === 'portrait')}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-200">Background (Blangko)</label>
                <input type="file" accept="image/*" onChange={handleBgUpload} className="w-full text-sm dark:text-slate-300" />
                {bgUrl && (
                  <div className="mt-2 space-y-2">
                    <button onClick={() => setBgUrl(null)} className="text-red-500 text-xs text-left">Hapus Background</button>
                    <label className="flex items-center space-x-2 text-xs dark:text-slate-300">
                      <input 
                        type="checkbox" 
                        checked={printBg} 
                        onChange={e => setPrintBg(e.target.checked)} 
                        className="rounded border-slate-300 text-[#d19e44] focus:ring-[#d19e44]"
                      />
                      <span>Cetak dengan Background ini</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Tambah Elemen</h3>
            <div className="space-y-2">
              <button onClick={handleAddText} className="w-full flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg font-medium text-sm transition-colors text-slate-800 dark:text-white">
                <Plus className="w-4 h-4 mr-2" /> Teks Bebas
              </button>
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Data Dinamis (Variabel)</label>
                <div className="grid grid-cols-2 gap-2">
                  {VARIABLE_OPTIONS.map(opt => (
                    <button 
                      key={opt.value}
                      onClick={() => handleAddVariable(opt.value)}
                      className="text-xs p-2 bg-slate-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-[#d19e44]/70 rounded border border-emerald-200 dark:border-emerald-800"
                    >
                      +{opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PROPERTIES PANEL */}
          {selectedEl && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase">Properti Elemen</h3>
                <button onClick={() => handleDelete(selectedEl.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
              
              <div className="space-y-3">
                {selectedEl.type === 'variable' && selectedEl.content === 'barcode' ? (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 space-y-2">
                    <p className="font-bold text-sm">Informasi Barcode / QR Code</p>
                    <p className="leading-relaxed text-justify md:text-left">Elemen ini akan otomatis diganti dengan <strong>QR Code verifikasi</strong> asli saat sertifikat digenerate.</p>
                    <p className="leading-relaxed text-justify md:text-left">QR Code akan berisi URL validasi instan untuk mengecek keabsahan sertifikat siswa secara real-time.</p>
                  </div>
                ) : (
                  <>
                    {selectedEl.type === 'text' && (
                      <div>
                        <label className="block text-xs font-medium mb-1 dark:text-slate-300">Isi Teks / HTML (Klik Ganda pada canvas untuk edit langsung)</label>
                        <textarea 
                          value={selectedEl.content}
                          onChange={e => updateElement(selectedEl.id, { content: e.target.value })}
                          className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none"
                          rows={4}
                        />
                        <div className="mt-2">
                           <label className="block text-[10px] font-medium text-slate-500 mb-1">Klik untuk menyisipkan variabel ke teks:</label>
                           <div className="flex flex-wrap gap-1">
                              {VARIABLE_OPTIONS.map(opt => (
                                <button
                                   key={opt.value}
                                   onClick={() => updateElement(selectedEl.id, { content: selectedEl.content + `{${opt.value}}` })}
                                   className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-600 dark:hover:bg-slate-500 rounded border border-slate-200 dark:border-slate-500 dark:text-slate-200 transition-colors"
                                >
                                   +{opt.label}
                                </button>
                              ))}
                           </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium mb-1 dark:text-slate-300">Font Family</label>
                      <select 
                        value={selectedEl.fontFamily}
                        onChange={e => updateElement(selectedEl.id, { fontFamily: e.target.value })}
                        className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        <optgroup label="Standar">
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="Times New Roman, serif">Times New Roman</option>
                          <option value="'Inter', sans-serif">Inter</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Raleway', sans-serif">Raleway</option>
                          <option value="'Oswald', sans-serif">Oswald</option>
                          <option value="'Outfit', sans-serif font-sans">Outfit</option>
                        </optgroup>
                        <optgroup label="Arab">
                          <option value="Amiri, serif">Amiri</option>
                          <option value="'Cairo', sans-serif">Cairo</option>
                          <option value="'Tajawal', sans-serif font-sans">Tajawal</option>
                          <option value="'Lateef', serif">Lateef</option>
                        </optgroup>
                        <optgroup label="Handwriting / Latin">
                          <option value="'Pacifico', cursive">Pacifico</option>
                          <option value="'Great Vibes', cursive">Great Vibes</option>
                          <option value="'Dancing Script', cursive">Dancing Script</option>
                          <option value="'Caveat', cursive font-sans font-medium">Caveat</option>
                          <option value="'Satisfy', cursive font-sans font-medium">Satisfy</option>
                          <option value="'Sacramento', cursive font-sans font-medium font-bold">Sacramento</option>
                          <option value="'Indie Flower', cursive font-sans font-medium">Indie Flower</option>
                        </optgroup>
                        <optgroup label="Desain & Dekoratif">
                          <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                          <option value="'Playfair Display', serif">Playfair Display</option>
                          <option value="'Cinzel', serif">Cinzel</option>
                          <option value="'Bebas Neue', sans-serif font-sans">Bebas Neue</option>
                          <option value="'Righteous', cursive font-sans font-medium">Righteous</option>
                          <option value="'Lobster', cursive font-sans font-medium font-bold">Lobster</option>
                          <option value="'Permanent Marker', cursive font-sans font-medium font-bold">Permanent Marker</option>
                          <option value="'Abril Fatface', serif">Abril Fatface</option>
                          <option value="'JetBrains Mono', monospace font-mono">JetBrains Mono</option>
                        </optgroup>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1 dark:text-slate-300">Size (px)</label>
                        <input 
                          type="number" 
                          list="font-sizes"
                          value={selectedEl.fontSize}
                          onChange={e => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                          className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                        <datalist id="font-sizes">
                          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 54, 60, 66, 72, 80, 88, 96, 104, 112, 120].map(sz => (
                            <option key={sz} value={sz} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 dark:text-slate-300">Color</label>
                        <div className="flex space-x-1">
                          <input 
                            type="color" 
                            value={selectedEl.color}
                            onChange={e => updateElement(selectedEl.id, { color: e.target.value })}
                            className="w-full h-9 p-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                          />
                          <button
                            title="Ambil Warna (Eyedropper)"
                            onClick={async () => {
                              if (!('EyeDropper' in window)) {
                                 alert('Browser/Perangkat Anda tidak mendukung fitur Eyedropper (Pipet). Silakan gunakan Google Chrome/Edge di komputer, atau buka aplikasi ini di tab baru.');
                                 return;
                              }
                              try {
                                // @ts-ignore
                                const eyeDropper = new window.EyeDropper();
                                const result = await eyeDropper.open();
                                updateElement(selectedEl.id, { color: result.sRGBHex });
                              } catch (e: any) {
                                console.log('Eyedropper cancelled or failed', e);
                                if (e.name === 'NotAllowedError') {
                                   alert('Fitur pipet warna (Eyedropper) diblokir oleh browser saat berada di mode preview. Silakan buka aplikasi ini di tab baru (Open in New Tab) untuk menggunakannya.');
                                }
                              }
                            }}
                            className="h-9 px-2 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-600 transition-colors"
                          >
                            <Pipette className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1 dark:text-slate-300">Weight</label>
                        <select 
                          value={selectedEl.fontWeight}
                          onChange={e => updateElement(selectedEl.id, { fontWeight: e.target.value })}
                          className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="800">Extra Bold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 dark:text-slate-300">Align</label>
                        <select 
                          value={selectedEl.textAlign}
                          onChange={e => updateElement(selectedEl.id, { textAlign: e.target.value as any })}
                          className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* WORKSPACE */}
        <div className="flex-1 bg-slate-200 dark:bg-[#041e49] overflow-auto p-8">
          <div className="min-w-max min-h-max flex p-8">
            <div 
              className="m-auto"
              style={{
                width: canvasWidth * zoom,
                height: canvasHeight * zoom,
                position: 'relative'
              }}
            >
              <div 
                className="relative bg-white shadow-2xl overflow-hidden ring-1 ring-gray-300 origin-top-left"
                style={{ 
                  width: canvasWidth, 
                  height: canvasHeight,
                  backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transform: `scale(${zoom})`
                }}
                onClick={() => setSelectedId(null)} // deselect when clicking background
              >
            {elements.map(el => (
              <Rnd
                key={el.id}
                size={{ width: el.width, height: el.height }}
                position={{ x: el.x, y: el.y }}
                disableDragging={inlineEditingId === el.id}
                onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) => {
                  updateElement(el.id, {
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    ...position,
                  });
                }}
                bounds="parent"
                onClick={(e: any) => { e.stopPropagation(); setSelectedId(el.id); }}
                onDoubleClick={(e: any) => {
                  e.stopPropagation();
                  if (el.type === 'variable') {
                    if (el.content === 'barcode') return;
                    updateElement(el.id, { type: 'text', content: `{${el.content}}` });
                  }
                  setInlineEditingId(el.id);
                }}
                className={`${selectedId === el.id ? 'ring-2 ring-blue-500 z-50' : 'hover:ring-1 hover:ring-gray-400 z-10'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                }}
              >
                {el.type === 'variable' && el.content === 'barcode' ? (
                  <div className="w-full h-full p-1.5 bg-white border border-slate-200/80 shadow-xs flex items-center justify-center select-none relative" style={{ pointerEvents: 'none' }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[85%] h-[85%]">
                      <rect width="100" height="100" fill="white"/>
                      <rect x="5" y="5" width="25" height="25" fill="black" stroke="white" strokeWidth="1"/>
                      <rect x="10" y="10" width="15" height="15" fill="white"/>
                      <rect x="13" y="13" width="9" height="9" fill="black"/>
                      
                      <rect x="70" y="5" width="25" height="25" fill="black" stroke="white" strokeWidth="1"/>
                      <rect x="75" y="10" width="15" height="15" fill="white"/>
                      <rect x="78" y="13" width="9" height="9" fill="black"/>
                      
                      <rect x="5" y="70" width="25" height="25" fill="black" stroke="white" strokeWidth="1"/>
                      <rect x="10" y="75" width="15" height="15" fill="white"/>
                      <rect x="13" y="78" width="9" height="9" fill="black"/>
                      
                      <rect x="40" y="5" width="10" height="10" fill="black" />
                      <rect x="55" y="15" width="10" height="15" fill="black" />
                      <rect x="40" y="40" width="15" height="15" fill="black" />
                      <rect x="5" y="40" width="15" height="20" fill="black" />
                      <rect x="70" y="40" width="15" height="20" fill="black" />
                      <rect x="40" y="70" width="15" height="15" fill="black" />
                      <rect x="65" y="70" width="15" height="15" fill="black" />
                      <rect x="85" y="85" width="10" height="10" fill="black" />
                      <rect x="45" y="85" width="10" height="10" fill="black" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[22%] h-[22%] bg-white rounded-full flex items-center justify-center p-0.5 border border-[#d19e44] shadow-sm">
                        <img src="https://iili.io/Fr7hdzb.png" alt="logo" className="w-[85%] h-[85%] object-contain" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {inlineEditingId === el.id && (
                      <div 
                        className="absolute -top-12 left-0 bg-white shadow-xl border border-slate-200 rounded-lg flex items-center p-1.5 z-[100]" 
                        onMouseDown={e => e.preventDefault()}
                      >
                        <div className="flex gap-1 mr-2 px-1 border-r border-slate-200">
                          <button 
                            onClick={(e) => { e.preventDefault(); document.execCommand('bold', false); }}
                            className="px-2 py-0.5 rounded hover:bg-slate-100 text-slate-700 font-bold"
                            title="Bold"
                          >B</button>
                          <button 
                            onClick={(e) => { e.preventDefault(); document.execCommand('italic', false); }}
                            className="px-2 py-0.5 rounded hover:bg-slate-100 text-slate-700 italic font-serif"
                            title="Italic"
                          >I</button>
                        </div>
                        <div className="flex gap-1 mr-2 px-1 border-r border-slate-200">
                          {['#e11d48', '#2563eb', '#16a34a', '#d97706', '#0f172a'].map(c => 
                            <button 
                              key={c} 
                              onClick={(e) => { e.preventDefault(); document.execCommand('foreColor', false, c); }}
                              className="w-5 h-5 rounded-full border border-slate-300 transform hover:scale-110 transition-transform"
                              style={{backgroundColor: c}}
                            />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                           <input 
                              type="color" 
                              defaultValue={el.color}
                              onChange={(e) => document.execCommand('foreColor', false, e.target.value)}
                              className="w-6 h-6 p-0 border-0 bg-transparent rounded cursor-pointer"
                              title="Custom Color"
                           />
                           <button
                             title="Ambil Warna (Eyedropper)"
                             onClick={async (e) => {
                               e.preventDefault();
                               if (!('EyeDropper' in window)) {
                                  alert('Browser tidak mendukung fitur Eyedropper. Silakan gunakan Google Chrome di komputer.');
                                  return;
                               }
                               try {
                                 // @ts-ignore
                                 const eyeDropper = new window.EyeDropper();
                                 const result = await eyeDropper.open();
                                 document.execCommand('foreColor', false, result.sRGBHex);
                               } catch (err: any) {
                                 console.log('Eyedropper cancelled or failed', err);
                                 if (err.name === 'NotAllowedError') {
                                   alert('Fitur pipet warna (Eyedropper) diblokir oleh browser saat berada di mode preview. Silakan buka aplikasi ini di tab baru (Open in New Tab) untuk menggunakannya.');
                                 }
                               }
                             }}
                             className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded cursor-pointer transition-colors"
                           >
                             <Pipette className="w-3.5 h-3.5" />
                           </button>
                        </div>
                      </div>
                    )}
                    <div 
                      contentEditable={inlineEditingId === el.id}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                         updateElement(el.id, { content: e.currentTarget.innerHTML });
                         setInlineEditingId(null);
                      }}
                      onMouseDown={(e) => { if (inlineEditingId === el.id) e.stopPropagation(); }}
                      style={{
                        fontFamily: el.fontFamily,
                        fontSize: `${el.fontSize}px`,
                        color: el.color,
                        fontWeight: el.fontWeight,
                        textAlign: el.textAlign,
                        width: '100%',
                        wordWrap: 'break-word',
                        outline: inlineEditingId === el.id ? '2px dashed #10b981' : 'none',
                        cursor: inlineEditingId === el.id ? 'text' : 'grab',
                        minHeight: '1em'
                      }}
                      dangerouslySetInnerHTML={{
                        __html: el.type === 'variable' && inlineEditingId !== el.id
                          ? `[${VARIABLE_OPTIONS.find(o => o.value === el.content)?.label || el.content}]` 
                          : el.content
                      }}
                    />
                  </>
                )}
              </Rnd>
            ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
