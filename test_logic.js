function getGrade(salah, thresholds) {
  if (salah <= thresholds.M) return 3; // Mumtaz
  if (salah <= thresholds.JJ) return 2; // Jayyid Jiddan
  if (salah <= thresholds.J) return 1; // Jayyid
  return 0; // Below Jayyid?
}
console.log(getGrade(2, {M: 2, JJ: 4, J: 6}));
