const fs = require('fs');
let code = fs.readFileSync('src/lib/store.ts', 'utf8');

if (!code.includes('settings: any = { batasAkhirSetoran: "" };')) {
  code = code.replace(/language: 'id' \| 'en' \| 'ar' = 'id';/, "language: 'id' | 'en' | 'ar' = 'id';\n  settings: any = { batasAkhirSetoran: '' };");
}

code = code.replace(/const \[pengujiSnap, siswaSnap, setoranSnap\] = await Promise\.all\(\[/, `const [pengujiSnap, siswaSnap, setoranSnap, settingsSnap] = await Promise.all([`);
code = code.replace(/getDocs\(collection\(db, 'setoran'\)\)\n\s+\]\);/, `getDocs(collection(db, 'setoran')),\n        getDocs(collection(db, 'settings'))\n      ]);`);

// Add parsing for settingsSnap
code = code.replace(/this\.setoran = setoranSnap\.docs\.map\(d => d\.data\(\) as Setoran\);/, `this.setoran = setoranSnap.docs.map(d => d.data() as Setoran);\n        settingsSnap.docs.forEach(d => { if (d.id === 'general') this.settings = d.data(); });`);

// Add updateSettings method
if (!code.includes('updateSettings')) {
  const updateSettingsCode = `
  async updateSettings(newSettings: any) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      await setDoc(doc(db, 'settings', 'general'), this.settings);
    } catch (e) {
      localStorage.setItem('batasAkhirSetoran', this.settings.batasAkhirSetoran || '');
    }
  }

  async clearAllData() {`;
  code = code.replace(/async clearAllData\(\) \{/, updateSettingsCode);
}

fs.writeFileSync('src/lib/store.ts', code);
