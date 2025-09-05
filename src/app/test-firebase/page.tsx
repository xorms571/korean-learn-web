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
          id: 'lesson-01-greetings',
          lessonNumber: 1,
          title: 'Greetings',
          content: 'Learn common ways to greet people in Korean.',
          exampleSentences: {
            ex1: { korean: '안녕하세요?', english: 'Hello?', pronunciation: 'An-nyeong-ha-se-yo?', audioUrl: '/audio/greetings/hello.mp3', searchKeyword: 'korean greeting' },
            ex2: { korean: '안녕히 가세요.', english: 'Goodbye (to someone leaving).', pronunciation: 'An-nyeong-hi ga-se-yo.', audioUrl: '/audio/greetings/goodbye_leaving.mp3', searchKeyword: 'korean goodbye leaving' },
            ex3: { korean: '안녕히 계세요.', english: 'Goodbye (to someone staying).', pronunciation: 'An-nyeong-hi gye-se-yo.', audioUrl: '/audio/greetings/goodbye_staying.mp3', searchKeyword: 'korean goodbye staying' },
            ex4: { korean: '좋은 아침이에요.', english: 'Good morning.', pronunciation: 'Jo-eun a-chim-i-e-yo.', audioUrl: '/audio/greetings/good_morning.mp3', searchKeyword: 'korean good morning' },
          },
          tip: 'Use polite greetings with strangers or elders.',
          image: '/lesson/daily_01.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-02-introductions',
          lessonNumber: 2,
          title: 'Introductions',
          content: 'Learn how to introduce yourself politely.',
          exampleSentences: {
            ex1: { korean: '저는 [이름]입니다.', english: 'I am [name].', pronunciation: 'Jeo-neun [i-reum]-im-ni-da.', audioUrl: '/audio/introductions/i_am.mp3', searchKeyword: 'korean introduction' },
            ex2: { korean: '만나서 반갑습니다.', english: 'Nice to meet you.', pronunciation: 'Man-na-seo ban-gap-seum-ni-da.', audioUrl: '/audio/introductions/nice_to_meet_you.mp3', searchKeyword: 'korean nice to meet you' },
            ex3: { korean: '제 이름은 [이름]이에요.', english: 'My name is [name].', pronunciation: 'Je i-reum-eun [i-reum]-i-e-yo.', audioUrl: '/audio/introductions/my_name_is.mp3', searchKeyword: 'korean my name is' },
            ex4: { korean: '저는 미국에서 왔습니다.', english: 'I came from the USA.', pronunciation: 'Jeo-neun Mi-guk-e-seo wass-seum-ni-da.', audioUrl: '/audio/introductions/from_usa.mp3', searchKeyword: 'korean from usa' },
          },
          tip: 'Use "입니다" to introduce yourself formally.',
          image: '/lesson/daily_02.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-03-thank-sorry',
          lessonNumber: 3,
          title: 'Thank You and Sorry',
          content: 'Learn how to express gratitude and apology.',
          exampleSentences: {
            ex1: { korean: '감사합니다.', english: 'Thank you.', pronunciation: 'Gam-sa-ham-ni-da.', audioUrl: '/audio/thank_sorry/thank_you_formal.mp3', searchKeyword: 'korean thank you' },
            ex2: { korean: '고마워요.', english: 'Thanks (polite).', pronunciation: 'Go-ma-wo-yo.', audioUrl: '/audio/thank_sorry/thank_you_polite.mp3', searchKeyword: 'korean thanks' },
            ex3: { korean: '죄송합니다.', english: 'I am sorry (formal).', pronunciation: 'Jwe-song-ham-ni-da.', audioUrl: '/audio/thank_sorry/sorry_formal.mp3', searchKeyword: 'korean sorry formal' },
            ex4: { korean: '미안해요.', english: 'Sorry (casual polite).', pronunciation: 'Mi-an-hae-yo.', audioUrl: '/audio/thank_sorry/sorry_polite.mp3', searchKeyword: 'korean sorry polite' },
          },
          tip: 'Always show gratitude or apologize politely.',
          image: '/lesson/daily_03.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-04-restaurant',
          lessonNumber: 4,
          title: 'Ordering at a Restaurant',
          content: 'Learn useful phrases for ordering food and drinks.',
          exampleSentences: {
            ex1: { korean: '메뉴 좀 주세요.', english: 'Please give me a menu.', pronunciation: 'Me-nyu jom ju-se-yo.', audioUrl: '/audio/restaurant/menu_please.mp3', searchKeyword: 'korean restaurant menu' },
            ex2: { korean: '김치찌개 하나 주세요.', english: 'One kimchi stew, please.', pronunciation: 'Kim-chi-jji-gae ha-na ju-se-yo.', audioUrl: '/audio/restaurant/kimchi_stew.mp3', searchKeyword: 'korean kimchi stew' },
            ex3: { korean: '물 좀 주세요.', english: 'Please give me some water.', pronunciation: 'Mul jom ju-se-yo.', audioUrl: '/audio/restaurant/water_please.mp3', searchKeyword: 'korean water please' },
            ex4: { korean: '계산서 주세요.', english: 'Please give me the bill.', pronunciation: 'Gye-san-seo ju-se-yo.', audioUrl: '/audio/restaurant/bill_please.mp3', searchKeyword: 'korean bill please' },
          },
          tip: 'Use polite endings with restaurant staff.',
          image: '/lesson/daily_04.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-05-shopping',
          lessonNumber: 5,
          title: 'Shopping Expressions',
          content: 'Learn how to ask for prices and make purchases.',
          exampleSentences: {
            ex1: { korean: '이거 얼마예요?', english: 'How much is this?', pronunciation: 'I-geo eol-ma-ye-yo?', audioUrl: '/audio/shopping/how_much.mp3', searchKeyword: 'korean shopping price' },
            ex2: { korean: '좀 깎아주세요.', english: 'Please give me a discount.', pronunciation: 'Jom kkak-ka-ju-se-yo.', audioUrl: '/audio/shopping/discount_please.mp3', searchKeyword: 'korean shopping discount' },
            ex3: { korean: '카드 돼요?', english: 'Do you take cards?', pronunciation: 'Ka-deu dwae-yo?', audioUrl: '/audio/shopping/card_ok.mp3', searchKeyword: 'korean shopping card' },
            ex4: { korean: '현금으로 할게요.', english: 'I will pay in cash.', pronunciation: 'Hyeon-geum-eu-ro hal-ge-yo.', audioUrl: '/audio/shopping/cash_pay.mp3', searchKeyword: 'korean shopping cash' },
          },
          tip: 'Bargaining may be possible in traditional markets.',
          image: '/lesson/daily_05.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-06-directions',
          lessonNumber: 6,
          title: 'Asking for Directions',
          content: 'Learn how to ask and give simple directions.',
          exampleSentences: {
            ex1: { korean: '지하철역이 어디예요?', english: 'Where is the subway station?', pronunciation: 'Ji-ha-cheol-yeok-i eo-di-ye-yo?', audioUrl: '/audio/directions/subway_station.mp3', searchKeyword: 'korean subway station' },
            ex2: { korean: '여기서 멀어요?', english: 'Is it far from here?', pronunciation: 'Yeo-gi-seo meo-reo-yo?', audioUrl: '/audio/directions/far_from_here.mp3', searchKeyword: 'korean far from here' },
            ex3: { korean: '왼쪽으로 가세요.', english: 'Go to the left.', pronunciation: 'Oen-jjok-eu-ro ga-se-yo.', audioUrl: '/audio/directions/go_left.mp3', searchKeyword: 'korean go left' },
            ex4: { korean: '오른쪽에 있어요.', english: 'It is on the right.', pronunciation: 'O-reun-jjok-e i-sseo-yo.', audioUrl: '/audio/directions/on_the_right.mp3', searchKeyword: 'korean on the right' },
          },
          tip: 'Learn basic place words like left, right, and straight.',
          image: '/lesson/daily_06.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-07-time',
          lessonNumber: 7,
          title: 'Talking About Time',
          content: 'Learn how to ask and tell the time.',
          exampleSentences: {
            ex1: { korean: '지금 몇 시예요?', english: 'What time is it now?', pronunciation: 'Ji-geum myeot si-ye-yo?', audioUrl: '/audio/time/what_time.mp3', searchKeyword: 'korean time now' },
            ex2: { korean: '세 시예요.', english: 'It’s three o’clock.', pronunciation: 'Se si-ye-yo.', audioUrl: '/audio/time/three_oclock.mp3', searchKeyword: 'korean three oclock' },
            ex3: { korean: '몇 분 남았어요?', english: 'How many minutes are left?', pronunciation: 'Myeot bun nam-ass-eo-yo?', audioUrl: '/audio/time/minutes_left.mp3', searchKeyword: 'korean minutes left' },
            ex4: { korean: '내일 만나요.', english: 'See you tomorrow.', pronunciation: 'Nae-il man-na-yo.', audioUrl: '/audio/time/see_you_tomorrow.mp3', searchKeyword: 'korean see you tomorrow' },
          },
          tip: 'Use Sino-Korean numbers for hours and minutes.',
          image: '/lesson/daily_07.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-08-hospital',
          lessonNumber: 8,
          title: 'At the Hospital',
          content: 'Learn phrases for visiting a doctor or pharmacy.',
          exampleSentences: {
            ex1: { korean: '머리가 아파요.', english: 'I have a headache.', pronunciation: 'Meo-ri-ga a-pa-yo.', audioUrl: '/audio/hospital/headache.mp3', searchKeyword: 'korean headache' },
            ex2: { korean: '열이 있어요.', english: 'I have a fever.', pronunciation: 'Yeol-i i-sseo-yo.', audioUrl: '/audio/hospital/fever.mp3', searchKeyword: 'korean fever' },
            ex3: { korean: '약 주세요.', english: 'Please give me some medicine.', pronunciation: 'Yak ju-se-yo.', audioUrl: '/audio/hospital/medicine_please.mp3', searchKeyword: 'korean medicine' },
            ex4: { korean: '병원은 어디예요?', english: 'Where is the hospital?', pronunciation: 'Byeong-won-eun eo-di-ye-yo?', audioUrl: '/audio/hospital/where_hospital.mp3', searchKeyword: 'korean hospital' },
          },
          tip: 'Learn body part vocabulary to explain symptoms clearly.',
          image: '/lesson/daily_08.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-09-transport',
          lessonNumber: 9,
          title: 'Transportation',
          content: 'Learn how to use buses, subways, and taxis.',
          exampleSentences: {
            ex1: { korean: '버스 정류장은 어디예요?', english: 'Where is the bus stop?', pronunciation: 'Beo-seu jeong-ryu-jang-eun eo-di-ye-yo?', audioUrl: '/audio/transport/bus_stop.mp3', searchKeyword: 'korean bus stop' },
            ex2: { korean: '이 버스는 서울역에 가요?', english: 'Does this bus go to Seoul Station?', pronunciation: 'I beo-seu-neun Seo-ul-yeok-e ga-yo?', audioUrl: '/audio/transport/bus_to_seoul_station.mp3', searchKeyword: 'korean bus to seoul station' },
            ex3: { korean: '택시 불러 주세요.', english: 'Please call a taxi.', pronunciation: 'Taek-si bul-leo ju-se-yo.', audioUrl: '/audio/transport/call_taxi.mp3', searchKeyword: 'korean taxi' },
            ex4: { korean: '교통카드 있어요?', english: 'Do you have a transportation card?', pronunciation: 'Gyo-tong-ka-deu i-sseo-yo?', audioUrl: '/audio/transport/transport_card.mp3', searchKeyword: 'korean transportation card' },
          },
          tip: 'Public transportation is very convenient in Korea.',
          image: '/lesson/daily_09.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-10-smalltalk',
          lessonNumber: 10,
          title: 'Small Talk',
          content: 'Learn simple everyday conversation starters.',
          exampleSentences: {
            ex1: { korean: '오늘 날씨 어때요?', english: 'How’s the weather today?', pronunciation: 'O-neul nal-ssi eo-ttae-yo?', audioUrl: '/audio/smalltalk/weather_today.mp3', searchKeyword: 'korean weather' },
            ex2: { korean: '주말에 뭐 했어요?', english: 'What did you do over the weekend?', pronunciation: 'Ju-mal-e mwo haess-eo-yo?', audioUrl: '/audio/smalltalk/weekend_what_did_you_do.mp3', searchKeyword: 'korean weekend' },
            ex3: { korean: '한국 음식 좋아해요?', english: 'Do you like Korean food?', pronunciation: 'Han-guk eum-sik jo-a-hae-yo?', audioUrl: '/audio/smalltalk/like_korean_food.mp3', searchKeyword: 'korean food' },
            ex4: { korean: '취미가 뭐예요?', english: 'What is your hobby?', pronunciation: 'Chwi-mi-ga mwo-ye-yo?', audioUrl: '/audio/smalltalk/what_hobby.mp3', searchKeyword: 'korean hobby' },
          },
          tip: 'Use small talk to make friends and build connections.',
          image: '/lesson/daily_10.png',
          createdAt: new Date(),
        },
      ];

      // 2. 코스 생성
      const courseRef = await addDoc(collection(db, 'courses'), {
        title: 'Daily Korean Conversation',
        description: 'Learn essential Korean expressions for everyday conversations.',
        level: 'Beginner',
        category: 'Conversation',
        duration: '5 hours',
        lessonsCount: courseLessons.length,
        image: '/course/daily.png',
        progress: 0,
        createdAt: new Date(),
      });

      // 3. lessons 서브컬렉션에 추가
      for (const lesson of courseLessons) {
        await setDoc(doc(collection(courseRef, 'lessons'), lesson.id), lesson);
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