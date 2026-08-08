import { calculatePredikatAkhir, SURAH_LIST_ORDERED } from "./src/lib/constants";
const list = [];
// 93 to 114
for (let i = 92; i < 114; i++) {
  list.push({ surah: SURAH_LIST_ORDERED[i], nilai: 'Jayyid (J)', tgl: '2023-01-01' });
}
console.log(calculatePredikatAkhir(30, list));
