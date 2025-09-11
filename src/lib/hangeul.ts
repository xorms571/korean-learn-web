// src/lib/hangeul.ts

export interface HangeulCharacter {
  char: string;
  romanization: string;
  type: 'consonant' | 'vowel';
}

export const consonants: HangeulCharacter[] = [
  { char: 'ㄱ', romanization: 'g/k', type: 'consonant' },
  { char: 'ㄴ', romanization: 'n', type: 'consonant' },
  { char: 'ㄷ', romanization: 'd/t', type: 'consonant' },
  { char: 'ㄹ', romanization: 'r/l', type: 'consonant' },
  { char: 'ㅁ', romanization: 'm', type: 'consonant' },
  { char: 'ㅂ', romanization: 'b/p', type: 'consonant' },
  { char: 'ㅅ', romanization: 's', type: 'consonant' },
  { char: 'ㅇ', romanization: 'ng/-', type: 'consonant' },
  { char: 'ㅈ', romanization: 'j', type: 'consonant' },
  { char: 'ㅊ', romanization: 'ch', type: 'consonant' },
  { char: 'ㅋ', romanization: 'k', type: 'consonant' },
  { char: 'ㅌ', romanization: 't', type: 'consonant' },
  { char: 'ㅍ', romanization: 'p', type: 'consonant' },
  { char: 'ㅎ', romanization: 'h', type: 'consonant' },
  { char: 'ㄲ', romanization: 'kk', type: 'consonant' },
  { char: 'ㄸ', romanization: 'tt', type: 'consonant' },
  { char: 'ㅃ', romanization: 'pp', type: 'consonant' },
  { char: 'ㅆ', romanization: 'ss', type: 'consonant' },
  { char: 'ㅉ', romanization: 'jj', type: 'consonant' },
];

export const vowels: HangeulCharacter[] = [
  { char: 'ㅏ', romanization: 'a', type: 'vowel' },
  { char: 'ㅑ', romanization: 'ya', type: 'vowel' },
  { char: 'ㅓ', romanization: 'eo', type: 'vowel' },
  { char: 'ㅕ', romanization: 'yeo', type: 'vowel' },
  { char: 'ㅗ', romanization: 'o', type: 'vowel' },
  { char: 'ㅛ', romanization: 'yo', type: 'vowel' },
  { char: 'ㅜ', romanization: 'u', type: 'vowel' },
  { char: 'ㅠ', romanization: 'yu', type: 'vowel' },
  { char: 'ㅡ', romanization: 'eu', type: 'vowel' },
  { char: 'ㅣ', romanization: 'i', type: 'vowel' },
  { char: 'ㅐ', romanization: 'ae', type: 'vowel' },
  { char: 'ㅒ', romanization: 'yae', type: 'vowel' },
  { char: 'ㅔ', romanization: 'e', type: 'vowel' },
  { char: 'ㅖ', romanization: 'ye', type: 'vowel' },
  { char: 'ㅘ', romanization: 'wa', type: 'vowel' },
  { char: 'ㅙ', romanization: 'wae', type: 'vowel' },
  { char: 'ㅚ', romanization: 'oe', type: 'vowel' },
  { char: 'ㅝ', romanization: 'wo', type: 'vowel' },
  { char: 'ㅞ', romanization: 'we', type: 'vowel' },
  { char: 'ㅟ', romanization: 'wi', type: 'vowel' },
  { char: 'ㅢ', romanization: 'ui', type: 'vowel' },
];

const INITIAL_CONSONANTS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
const MEDIAL_VOWELS = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
const FINAL_CONSONANTS = 'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'.split('');
const HANGEUL_START_CODE = 0xAC00;
const HANGEUL_END_CODE = 0xD7A3;

// Function to combine characters
export function combineHangeul(initial: string, medial: string, final?: string): string {
  const initialIndex = INITIAL_CONSONANTS.indexOf(initial);
  const medialIndex = MEDIAL_VOWELS.indexOf(medial);
  // Add 1 to finalIndex because the 0th final consonant is "none"
  const finalIndex = final ? FINAL_CONSONANTS.indexOf(final) + 1 : 0;

  if (initialIndex === -1 || medialIndex === -1) {
    return initial + medial + (final || '');
  }

  const combinedCode = HANGEUL_START_CODE + (initialIndex * 21 * 28) + (medialIndex * 28) + finalIndex;

  if (combinedCode >= HANGEUL_START_CODE && combinedCode <= HANGEUL_END_CODE) {
    return String.fromCharCode(combinedCode);
  }

  return initial + medial + (final || '');
}
