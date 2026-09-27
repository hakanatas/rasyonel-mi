/* ─────────────────────────────────────────────────────────────
   ALTYAZILAR / CAPTIONS — düzenlenebilir.
   Kısa, tek fikir, 8. sınıf dili. start/end saniye cinsinden.
   note: öğretmen için önerilen seslendirme cümlesi.
   ───────────────────────────────────────────────────────────── */
(function (root) {
  const CAPTIONS = [
    { scene: 1, start: 4.4, end: 10.2, tr: 'Hangileri rasyonel?', en: 'Which are rational?',
      note: 'Kesirler, ondalık sayılar, kökler ve pi. Bunlardan hangileri rasyonel? Karar vermek için bir ölçüt lazım: ondalık gösterim.' },
    { scene: 2, start: 10.8, end: 20.8, tr: 'Biter ya da tekrar eder', en: 'It ends or it repeats',
      note: '3’ü 8’e bölelim: 0,375. Ondalık gösterim bitiyor. 2’yi 11’e bölelim: 0,1818… 18 sonsuza kadar tekrar ediyor.' },
    { scene: 2, start: 21.0, end: 27.8, tr: 'Rasyonel sayı', en: 'A rational number',
      note: 'a bölü b biçiminde yazılabilen sayılar rasyoneldir; ondalık gösterimleri ya biter ya tekrar eder.' },
    { scene: 3, start: 28.8, end: 38.8, tr: '√2 ve π', en: '√2 and π',
      note: 'Hesap makinesiyle karekök 2’ye bakalım: 1,41421356… Pi: 3,14159265… Basamaklar ne bitiyor ne de tekrar ediyor.' },
    { scene: 3, start: 39.0, end: 45.8, tr: 'İrrasyonel sayı', en: 'An irrational number',
      note: 'Karekök 16 ise tam 4. Ondalık gösterimi ne biten ne tekrar eden sayılar irrasyoneldir; a bölü b biçiminde yazılamazlar.' },
    { scene: 4, start: 46.8, end: 56.8, tr: 'İki grup', en: 'Two groups',
      note: 'Sayıları ölçüte göre ayıralım. Rasyonel: 3/8, 2/11, 0,75, karekök 16 ve eksi 5. İrrasyonel: karekök 2, pi ve karekök 3.' },
    { scene: 4, start: 57.0, end: 63.8, tr: 'Tam kare olmayanların kökü', en: 'Roots of non-squares',
      note: 'Tam kare olmayan sayıların karekökleri irrasyoneldir.' },
    { scene: 5, start: 64.8, end: 70.2, tr: '0,1010010001…', en: '0.1010010001…',
      note: '0,1010010001… Bir düzeni var ama hiçbir blok tekrar etmiyor: bu sayı irrasyonel.' },
    { scene: 5, start: 70.4, end: 79.8, tr: '22/7 π değil!', en: '22/7 is not π!',
      note: '22 bölü 7: 3,142857142857… 142857 tekrar ediyor, yani rasyonel. Pi’ye yakın ama pi değil!' },
    { scene: 6, start: 80.6, end: 86.4, tr: 'Ölçüt: ondalık gösterim', en: 'The criterion: the decimal form',
      note: 'Aklında kalsın: ondalık gösterim biterse ya da tekrar ederse sayı rasyonel, ne biter ne tekrar ederse irrasyonel.' },
    { scene: 6, start: 86.8, end: 91.0, tr: '√2 ve π irrasyonel!', en: '√2 and π are irrational!',
      note: 'Karekök 2 ve pi irrasyonel!' },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CAPTIONS;
  else { root.LI = root.LI || {}; root.LI.CAPTIONS = CAPTIONS; }
})(typeof window !== 'undefined' ? window : globalThis);
