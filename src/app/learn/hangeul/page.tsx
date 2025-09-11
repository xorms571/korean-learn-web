'use client';

import React, { useState, useCallback } from 'react';
import { consonants, vowels, combineHangeul, HangeulCharacter } from '@/lib/hangeul';
import { useSpeech } from '@/hooks/useSpeech';
import { FiVolume2 } from 'react-icons/fi';

const HangeulCombinerPage = () => {
  const { speak } = useSpeech();
  const [initial, setInitial] = useState<HangeulCharacter | null>(null);
  const [medial, setMedial] = useState<HangeulCharacter | null>(null);
  const [final, setFinal] = useState<HangeulCharacter | null>(null);

  const [combined, setCombined] = useState<string>('');
  const [romanization, setRomanization] = useState<string>('');

  const handleCharacterClick = useCallback((char: HangeulCharacter) => {
    if (char.type === 'consonant') {
      if (!initial) {
        // Start of a new syllable
        setInitial(char);
        setCombined(char.char);
        setRomanization(char.romanization.split('/')[0]);
      } else if (initial && medial && !final) {
        // Adding a final consonant
        setFinal(char);
        const newCombined = combineHangeul(initial.char, medial.char, char.char);
        setCombined(newCombined);
        // Adjust romanization for final consonant
        const finalRomanization = char.romanization.split('/').pop() || '';
        setRomanization(prev => `${prev}${finalRomanization}`);
      } else {
        // Invalid move or starting a new syllable, so reset with the new consonant
        setInitial(char);
        setMedial(null);
        setFinal(null);
        setCombined(char.char);
        setRomanization(char.romanization.split('/')[0]);
      }
    } else if (char.type === 'vowel') {
      if (initial && !medial) {
        // Adding a vowel after an initial consonant
        setMedial(char);
        const newCombined = combineHangeul(initial.char, char.char);
        setCombined(newCombined);
        // Combine romanizations
        const initialRoman = initial.romanization.split('/')[0];
        setRomanization(`${initialRoman}${char.romanization}`);
      } else {
        // Invalid move (vowel without initial consonant), so reset
        handleReset();
      }
    }
  }, [initial, medial, final]);

  const handleReset = () => {
    setInitial(null);
    setMedial(null);
    setFinal(null);
    setCombined('');
    setRomanization('');
  };

  const CharacterButton = ({ char, onClick }: { char: HangeulCharacter, onClick: (char: HangeulCharacter) => void }) => (
    <button
      onClick={() => onClick(char)}
      className="flex flex-col items-center justify-center w-16 h-16 m-1 rounded-lg shadow-md bg-white hover:bg-gray-100 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <span className="text-2xl font-bold text-gray-800">{char.char}</span>
      <span className="text-xs text-gray-500">{char.romanization}</span>
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Hangeul Combiner</h1>
          <p className="text-lg text-gray-600 mt-2">Click the consonants and vowels to build syllables.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Display */}
          <div className="relative flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-8 min-h-[300px]">
            <div className="relative flex items-center justify-center w-48 h-48 mb-4 bg-blue-100 rounded-full">
              <span className="text-8xl font-serif text-blue-800">{combined || '?'}</span>
            </div>
            <div className="text-4xl font-semibold text-gray-700 tracking-wider">
              {romanization || '...'}
              {combined &&
                <button onClick={() => speak(combined)} className="p-2 ml-4 rounded-full text-gray-600 hover:bg-gray-200 transition-colors" aria-label="Play pronunciation">
                  <FiVolume2 size={20} />
                </button>
              }
            </div>
            <div className="absolute top-4 right-4 p-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reset
              </button>
            </div>
            <div className="mt-6 text-center text-gray-500">
              <p>
                <span className="font-semibold">Initial:</span> {initial?.char || '_'}
                <span className="font-semibold ml-4">Medial:</span> {medial?.char || '_'}
                <span className="font-semibold ml-4">Final:</span> {final?.char || '_'}
              </p>
            </div>
          </div>

          {/* Right Side: Character Selectors */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Consonants (자음)</h3>
              <div className="flex flex-wrap justify-center">
                {consonants.map(c => <CharacterButton key={c.char} char={c} onClick={handleCharacterClick} />)}
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Vowels (모음)</h3>
              <div className="flex flex-wrap justify-center">
                {vowels.map(v => <CharacterButton key={v.char} char={v} onClick={handleCharacterClick} />)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HangeulCombinerPage;
