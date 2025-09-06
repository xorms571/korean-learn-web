'use client';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function TestFirebasePage() {
  const [message, setMessage] = useState('');

  const seedData = async () => {
    setMessage('데이터 업로드 중...');
    try {
      const courseLessons = [
        {
          id: "lesson-01-intro",
          lessonNumber: 1,
          title: "Introduction to Hangul",
          content:
            "Hangul is the Korean alphabet system created in the 15th century by King Sejong. It consists of 14 consonants and 10 vowels. In this lesson, you will learn the concept of syllable blocks and how letters combine.",
          exampleSentences: {
            ex1: {
              korean: "한글",
              english: "Hangul (Korean alphabet)",
              pronunciation: "Han-geul",
            },
            ex2: {
              korean: "훈민정음",
              english: "Hunminjeongeum (The original name of Hangul)",
              pronunciation: "Hun-min-jeong-eum",
            },
            ex3: { korean: "자음", english: "Consonants", pronunciation: "Ja-eum" },
            ex4: { korean: "모음", english: "Vowels", pronunciation: "Mo-eum" },
          },
          tip: "Remember: Hangul letters are grouped into blocks, not written linearly like English.",
          image: "/lesson/hangeul_intro.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-02-consonants1",
          lessonNumber: 2,
          title: "Basic Consonants ㄱ, ㄴ, ㄷ, ㄹ",
          content:
            "Learn the first four basic consonants. ㄱ sounds like 'g/k', ㄴ is like 'n', ㄷ is like 'd/t', and ㄹ is similar to 'r/l'.",
          exampleSentences: {
            ex1: { korean: "가", english: "ga", pronunciation: "ga" },
            ex2: { korean: "나", english: "na", pronunciation: "na" },
            ex3: { korean: "다", english: "da", pronunciation: "da" },
            ex4: { korean: "라", english: "ra/la", pronunciation: "ra / la" },
          },
          tip: "Practice repeating these sounds slowly, then combine them with vowels.",
          image: "/lesson/hangeul_consonants1.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-03-consonants2",
          lessonNumber: 3,
          title: "Basic Consonants ㅁ, ㅂ, ㅅ, ㅇ",
          content:
            "Learn four more consonants. ㅁ sounds like 'm', ㅂ is like 'b/p', ㅅ is 's', and ㅇ is silent at the beginning but 'ng' at the end.",
          exampleSentences: {
            ex1: { korean: "마", english: "ma", pronunciation: "ma" },
            ex2: { korean: "바", english: "ba", pronunciation: "ba" },
            ex3: { korean: "사", english: "sa", pronunciation: "sa" },
            ex4: { korean: "아", english: "a", pronunciation: "a" },
          },
          tip: "Note the special rule of ㅇ: silent at the start, 'ng' at the end.",
          image: "/lesson/hangeul_consonants2.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-04-consonants3",
          lessonNumber: 4,
          title: "Basic Consonants ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ",
          content:
            "Learn the remaining basic consonants. ㅈ = j, ㅊ = ch, ㅋ = k (strong), ㅌ = t (strong), ㅍ = p (strong), ㅎ = h.",
          exampleSentences: {
            ex1: { korean: "자", english: "ja", pronunciation: "ja" },
            ex2: { korean: "차", english: "cha", pronunciation: "cha" },
            ex3: { korean: "카", english: "ka", pronunciation: "ka" },
            ex4: { korean: "타", english: "ta", pronunciation: "ta" },
            ex5: { korean: "파", english: "pa", pronunciation: "pa" },
            ex6: { korean: "하", english: "ha", pronunciation: "ha" },
          },
          tip: "Notice how aspiration (extra breath) makes sounds stronger.",
          image: "/lesson/hangeul_consonants3.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-05-vowels1",
          lessonNumber: 5,
          title: "Basic Vowels ㅏ, ㅑ, ㅓ, ㅕ",
          content:
            "Learn the vowels: ㅏ = a, ㅑ = ya, ㅓ = eo, ㅕ = yeo. These are pronounced with open mouth sounds.",
          exampleSentences: {
            ex1: { korean: "아", english: "a", pronunciation: "a" },
            ex2: { korean: "야", english: "ya", pronunciation: "ya" },
            ex3: { korean: "어", english: "eo", pronunciation: "eo" },
            ex4: { korean: "여", english: "yeo", pronunciation: "yeo" },
          },
          tip: "ㅓ (eo) and ㅕ (yeo) are unique sounds, not found in English.",
          image: "/lesson/hangeul_vowels1.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-06-vowels2",
          lessonNumber: 6,
          title: "Basic Vowels ㅗ, ㅛ, ㅜ, ㅠ",
          content:
            "Learn the vowels: ㅗ = o, ㅛ = yo, ㅜ = u, ㅠ = yu. These are rounded lip sounds.",
          exampleSentences: {
            ex1: { korean: "오", english: "o", pronunciation: "o" },
            ex2: { korean: "요", english: "yo", pronunciation: "yo" },
            ex3: { korean: "우", english: "u", pronunciation: "u" },
            ex4: { korean: "유", english: "yu", pronunciation: "yu" },
          },
          tip: "Practice rounding your lips when pronouncing ㅗ and ㅜ.",
          image: "/lesson/hangeul_vowels2.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-07-vowels3",
          lessonNumber: 7,
          title: "Basic Vowels ㅡ, ㅣ",
          content:
            "Learn the vowels: ㅡ = eu, ㅣ = i. ㅡ is a unique sound with the tongue flat in the middle.",
          exampleSentences: {
            ex1: { korean: "으", english: "eu", pronunciation: "eu" },
            ex2: { korean: "이", english: "i", pronunciation: "i" },
          },
          tip: "ㅣ is simple like 'ee' in 'see'. ㅡ has no English equivalent, practice carefully.",
          image: "/lesson/hangeul_vowels3.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-08-combined-vowels",
          lessonNumber: 8,
          title: "Combined Vowels",
          content:
            "Hangul also has combined vowels like ㅐ (ae), ㅒ (yae), ㅔ (e), ㅖ (ye), ㅘ (wa), ㅙ (wae), ㅚ (oe), ㅝ (wo), ㅞ (we), ㅟ (wi), ㅢ (ui).",
          exampleSentences: {
            ex1: { korean: "애", english: "ae", pronunciation: "ae" },
            ex2: { korean: "예", english: "ye", pronunciation: "ye" },
            ex3: { korean: "왜", english: "wae", pronunciation: "wae" },
            ex4: { korean: "위", english: "wi", pronunciation: "wi" },
            ex5: { korean: "의", english: "ui", pronunciation: "ui" },
          },
          tip: "These sounds are combinations of basic vowels. Some are very common in words.",
          image: "/lesson/hangeul_combined_vowels.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-09-syllable-blocks",
          lessonNumber: 9,
          title: "Forming Syllable Blocks",
          content:
            "Hangul letters form blocks that represent syllables. A block must have at least one consonant and one vowel.",
          exampleSentences: {
            ex1: { korean: "가", english: "ga", pronunciation: "ga" },
            ex2: { korean: "고", english: "go", pronunciation: "go" },
            ex3: { korean: "구", english: "gu", pronunciation: "gu" },
            ex4: { korean: "기", english: "gi", pronunciation: "gi" },
          },
          tip: "Think of syllable blocks as squares made of consonant + vowel (+ optional final consonant).",
          image: "/lesson/hangeul_syllable_blocks.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-10-batchim",
          lessonNumber: 10,
          title: "Final Consonants (Batchim)",
          content:
            "A syllable block can end with a consonant, called 받침 (batchim). It changes the sound slightly.",
          exampleSentences: {
            ex1: { korean: "강", english: "gang", pronunciation: "gang" },
            ex2: { korean: "밥", english: "bap", pronunciation: "bap" },
            ex3: { korean: "꽃", english: "kkot", pronunciation: "kkot" },
            ex4: { korean: "집", english: "jip", pronunciation: "jip" },
          },
          tip: "Batchim can be one consonant. Pronounce it softly at the end.",
          image: "/lesson/hangeul_batchim.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-11-practice-words",
          lessonNumber: 11,
          title: "Practice Words",
          content:
            "Now practice reading simple Korean words formed from basic syllables.",
          exampleSentences: {
            ex1: { korean: "학교", english: "school", pronunciation: "hak-gyo" },
            ex2: { korean: "엄마", english: "mom", pronunciation: "eom-ma" },
            ex3: { korean: "아빠", english: "dad", pronunciation: "a-ppa" },
            ex4: { korean: "한국", english: "Korea", pronunciation: "han-guk" },
          },
          tip: "Practice slowly, syllable by syllable, then faster like natural speech.",
          image: "/lesson/hangeul_practice_words.png",
          createdAt: new Date(),
        },
        {
          id: "lesson-12-review",
          lessonNumber: 12,
          title: "Review and Quiz",
          content:
            "Review all consonants and vowels. Try reading and writing without help.",
          exampleSentences: {
            ex1: { korean: "가나다", english: "ga-na-da (alphabet order)", pronunciation: "ga-na-da" },
            ex2: { korean: "라마바", english: "ra-ma-ba", pronunciation: "ra-ma-ba" },
            ex3: { korean: "사아자", english: "sa-a-ja", pronunciation: "sa-a-ja" },
            ex4: { korean: "차카타", english: "cha-ka-ta", pronunciation: "cha-ka-ta" },
          },
          tip: "If you can read these smoothly, you have mastered Hangul basics!",
          image: "/lesson/hangeul_review.png",
          createdAt: new Date(),
        },
      ];

      // 2. 코스 생성
      const courseRef = await addDoc(collection(db, "courses"), {
        title: "Korean Alphabet (Hangul) Basics",
        description:
          "This course introduces Hangul, the Korean alphabet. You will learn the basic consonants and vowels, how to pronounce them, and how to read simple syllables. Designed for complete beginners.",
        level: "Beginner",
        category: "Alphabet",
        duration: "5 hours",
        lessonsCount: courseLessons.length,
        image: "/course/hangeul_basics.png",
        progress: 0,
        createdAt: new Date(),
      });

      // 3. lessons 서브컬렉션에 추가
      for (const lesson of courseLessons) {
        await setDoc(doc(collection(courseRef, "lessons"), lesson.id), lesson);
      }

      setMessage('데이터 업로드 완료!');
    } catch (e: any) {
      console.error('Error adding document: ', e);
      setMessage('데이터 업로드 실패: ' + e.message);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Firebase 데이터 테스트 페이지</h1>
      <p>이 페이지는 Firebase Firestore에 샘플 코스 및 레슨 데이터를 업로드합니다.</p>
      <button
        onClick={seedData}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        샘플 데이터 업로드
      </button>
      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
      <p style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
        데이터 업로드 후에는 이 페이지를 삭제하거나 기능을 비활성화하는 것을 권장합니다.
      </p>
    </div>
  );
}