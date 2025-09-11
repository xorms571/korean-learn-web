'use client';

import { useState, useEffect, useCallback } from 'react';

export const useSpeech = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };

      // Voices are loaded asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices(); // Initial load

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text: string, lang: string = 'ko-KR') => {
    if (!isClient || typeof window.speechSynthesis === 'undefined') {
      console.warn('Speech synthesis is not supported or not available yet.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    const koreanVoice = voices.find(voice => voice.lang === lang);
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    window.speechSynthesis.cancel(); // Cancel any previous speech
    window.speechSynthesis.speak(utterance);
  }, [voices, isClient]);

  return { speak };
};
