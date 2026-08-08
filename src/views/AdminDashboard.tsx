import React, { useEffect, useState } from 'react';
import { Users, UserCheck, TrendingUp, Award, BarChart3, Settings, CheckCircle, Trash2, Layers } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { JUZ_SURAH_MAP } from '../lib/constants';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AdminDashboard = ({ setActiveMenu }: { setActiveMenu?: (menu: string) => void }) => {
  const { siswa, penguji, setoran, theme } = useAppContext();
  
  const [siswaTuntas, setSiswaTuntas] = useState(0);

  useEffect(() => {
    let totalTuntas = 0;
    siswa.forEach(s => {
      if (!s.target || s.target.length === 0) return;
      
      let isStudentTuntas = true;
      for (const juz of s.target) {
        const requiredSurahs = JUZ_SURAH_MAP[juz] || [];
        for (const surah of requiredSurahs) {
          const hasSetoran = setoran.some(st => st.siswa_id === s.id && st.juz === juz && st.surah === surah);
          if (!hasSetoran) {
            isStudentTuntas = false;
            break;
          }
        }
        if (!isStudentTuntas) break;
      }
      
      if (isStudentTuntas) {
        totalTuntas++;
      }
    });

    setSiswaTuntas(totalTuntas);
  }, [setoran, siswa]);

  const textColor = theme === 'dark' ? '#f3f4f6' : '#374151';

  const chartData = {
    labels: ['Mumtaz (M)', 'Jayyid Jiddan (JJ)', 'Jayyid (J)'],
    datasets: [{
      label: 'Kualitas Setoran Hafalan',
      data: [
        setoran.filter(s => s.nilai.includes('M') && !s.nilai.includes('JJ')).length, 
        setoran.filter(s => s.nilai.includes('JJ')).length, 
        setoran.filter(s => s.nilai === 'Jayyid (J)' || s.nilai === 'J').length
      ],
      backgroundColor: ['#d19e44', '#10b981', '#3b82f6'],
      borderRadius: 8,
      barThickness: 40,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: theme === 'dark' ? '#374151' : '#f3f4f6' }, ticks: { color: textColor, precision: 0 } },
      x: { grid: { display: false }, ticks: { color: textColor } }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: 'Total Siswa', value: siswa.length, icon: Users, color: 'text-[#041e49] dark:text-[#d19e44]', bg: 'bg-[#041e49]/5 dark:bg-[#d19e44]/10' },
          { label: 'Guru Penguji', value: penguji.length, icon: UserCheck, color: 'text-[#d19e44]', bg: 'bg-[#d19e44]/20 dark:bg-[#d19e44]/20' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-slate-50 dark:bg-[#031433] p-4 md:p-5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className={`${stat.bg} ${stat.color} border border-slate-200/50 dark:border-slate-700/50 shadow-inner p-2.5 md:p-3 rounded-2xl`}><Icon className="w-5 h-5 md:w-6 md:h-6" /></div>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-sm md:text-base text-slate-500 font-bold uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          )
        })}
        <div className="col-span-2 md:col-span-1 bg-[#041e49] p-4 md:p-5 rounded-[2rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 md:-top-4 opacity-10"><Award className="w-24 h-24 md:w-32 md:h-32 text-[#d19e44]" /></div>
          <div className="relative z-10 mb-3 md:mb-4">
            <div className="border border-white/10 bg-white/10 backdrop-blur-md p-2.5 md:p-3 rounded-2xl inline-block">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#d19e44]" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-2xl md:text-3xl font-black">{siswaTuntas}</p>
            <p className="text-xs md:text-sm text-[#d19e44] font-bold mt-0.5 tracking-wide uppercase">SISWA TUNTAS TARGET</p>
          </div>
        </div>
      </div>

      {setActiveMenu && (
        <div className="md:hidden mt-4">
          <div className="grid grid-cols-4 gap-y-6 gap-x-2 px-1">
            {[
              { id: 'siswa', label: 'Siswa', icon: Users, color: 'text-purple-500', bg: 'bg-purple-100' },
              { id: 'penguji', label: 'Penguji', icon: UserCheck, color: 'text-[#d19e44]', bg: 'bg-[#d19e44]/20' },
              { id: 'laporan', label: 'Laporan', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-100' },
              { id: 'recycle', label: 'Sampah', icon: Trash2, color: 'text-red-500', bg: 'bg-red-100' },
            ].map((menu) => {
              const Icon = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveMenu(menu.id)}
                  className="flex flex-col items-center justify-center space-y-2 group"
                >
                  <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 dark:bg-[#031433] ${menu.bg} dark:bg-opacity-20`}>
                    <Icon className={`w-6 h-6 ${menu.color}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    {menu.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-slate-50 dark:bg-[#031433] p-4 md:p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base md:text-lg pl-2 border-l-4 border-[#d19e44]">Grafik Kualitas Setoran</h3>
        </div>
        <div className="w-full h-56 md:h-80">
          <Bar options={chartOptions} data={chartData} />
        </div>
      </div>
    </div>
  );
};
