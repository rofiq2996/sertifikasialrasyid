export type Language = 'id' | 'en' | 'ar';

export const translations = {
  id: {
    // Menu Profil
    'menu.edit_profil': 'Edit Profil',
    'menu.keamanan_akun': 'Keamanan Akun',
    'menu.bahasa': 'Bahasa',
    'menu.tentang_aplikasi': 'Tentang Aplikasi',
    'menu.keluar': 'Keluar dari Akun',
    'menu.kembali': 'Kembali',
    
    // Bahasa
    'bahasa.title': 'Bahasa',
    'bahasa.subtitle': 'Pilih bahasa yang akan digunakan pada antarmuka aplikasi.',
    'bahasa.id': 'Bahasa Indonesia',
    'bahasa.en': 'English',
    'bahasa.ar': 'اللغة العربية',

    // Edit Profil
    'profil.title': 'Edit Profil',
    'profil.subtitle': 'Perbarui informasi identitas pribadi Anda dengan aman.',
    'profil.nama_siswa': 'Nama Lengkap Siswa',
    'profil.bin_binti': 'Anak (Bin / Binti)',
    'profil.nama_ayah': 'Nama Orang Tua / Wali (Ayah)',
    'profil.nis': 'Nomor Induk Siswa (NIS)',
    'profil.nama_penguji': 'Nama Lengkap Penguji',
    'profil.username': 'Username Login',
    'profil.simpan': 'SIMPAN PROFIL',
    'profil.menyimpan': 'MENYIMPAN...',
    
    // Keamanan
    'keamanan.title': 'Keamanan Akun',
    'keamanan.subtitle': 'Ganti kata sandi untuk menjaga keamanan akun Anda.',
    'keamanan.sandi_baru': 'Kata Sandi (Password Login Baru)',
    'keamanan.perbarui': 'PERBARUI SANDI',
  },
  en: {
    // Menu Profil
    'menu.edit_profil': 'Edit Profile',
    'menu.keamanan_akun': 'Account Security',
    'menu.bahasa': 'Language',
    'menu.tentang_aplikasi': 'About App',
    'menu.keluar': 'Log out',
    'menu.kembali': 'Back',
    
    // Bahasa
    'bahasa.title': 'Language',
    'bahasa.subtitle': 'Choose the language used for the app interface.',
    'bahasa.id': 'Indonesian',
    'bahasa.en': 'English',
    'bahasa.ar': 'Arabic',

    // Edit Profil
    'profil.title': 'Edit Profile',
    'profil.subtitle': 'Securely update your personal identity information.',
    'profil.nama_siswa': 'Student Full Name',
    'profil.bin_binti': 'Child of (Bin / Binti)',
    'profil.nama_ayah': 'Parent / Guardian Name (Father)',
    'profil.nis': 'Student ID Number (NIS)',
    'profil.nama_penguji': 'Examiner Full Name',
    'profil.username': 'Login Username',
    'profil.simpan': 'SAVE PROFILE',
    'profil.menyimpan': 'SAVING...',
    
    // Keamanan
    'keamanan.title': 'Account Security',
    'keamanan.subtitle': 'Change password to secure your account.',
    'keamanan.sandi_baru': 'New Login Password',
    'keamanan.perbarui': 'UPDATE PASSWORD',
  },
  ar: {
    // Menu Profil
    'menu.edit_profil': 'تعديل الملف الشخصي',
    'menu.keamanan_akun': 'أمن الحساب',
    'menu.bahasa': 'اللغة',
    'menu.tentang_aplikasi': 'عن التطبيق',
    'menu.keluar': 'تسجيل الخروج',
    'menu.kembali': 'رجوع',
    
    // Bahasa
    'bahasa.title': 'اللغة',
    'bahasa.subtitle': 'اختر اللغة المستخدمة في واجهة التطبيق.',
    'bahasa.id': 'الإندونيسية',
    'bahasa.en': 'الإنجليزية',
    'bahasa.ar': 'العربية',

    // Edit Profil
    'profil.title': 'تعديل الملف',
    'profil.subtitle': 'قم بتحديث معلومات هويتك الشخصية بأمان.',
    'profil.nama_siswa': 'الاسم الكامل للطالب',
    'profil.bin_binti': 'ابن / ابنة',
    'profil.nama_ayah': 'اسم الوالد / ولي الأمر (الأب)',
    'profil.nis': 'رقم تعريف الطالب',
    'profil.nama_penguji': 'الاسم الكامل للممتحن',
    'profil.username': 'اسم المستخدم',
    'profil.simpan': 'حفظ الملف',
    'profil.menyimpan': 'جاري الحفظ...',
    
    // Keamanan
    'keamanan.title': 'أمن الحساب',
    'keamanan.subtitle': 'تغيير كلمة المرور لتأمين حسابك.',
    'keamanan.sandi_baru': 'كلمة مرور جديدة',
    'keamanan.perbarui': 'تحديث كلمة المرور',
  }
};

export const useTranslation = (lang: Language) => {
  return (key: string) => {
    // @ts-ignore
    return translations[lang]?.[key] || translations['id'][key] || key;
  };
};
