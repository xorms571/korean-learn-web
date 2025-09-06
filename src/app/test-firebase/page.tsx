'use client';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function TestFirebasePage() {
  const [message, setMessage] = useState('');

  const seedData = async () => {
    setMessage('데이터 업로드 중...');
    try {
      const shoppingLessons = [
        {
          id: 'lesson-01-greetings',
          lessonNumber: 1,
          title: 'Entering a Store and Greetings',
          content: 'Learn how to greet when entering a store and respond politely.',
          exampleSentences: {
            ex1: { korean: '어서 오세요.', english: 'Welcome.', pronunciation: 'Eo-seo o-se-yo.' },
            ex2: { korean: '안녕하세요.', english: 'Hello.', pronunciation: 'An-nyeong-ha-se-yo.' },
            ex3: { korean: '처음 왔어요.', english: 'It’s my first time here.', pronunciation: 'Cheo-eum wa-sseo-yo.' },
            ex4: { korean: '구경해도 돼요?', english: 'May I look around?', pronunciation: 'Gu-gyeong-hae-do dwae-yo?' },
            ex5: { korean: '잠시 둘러볼게요.', english: 'I’ll just look around.', pronunciation: 'Jam-si dul-reo-bol-gge-yo.' },
            ex6: { korean: '감사합니다.', english: 'Thank you.', pronunciation: 'Gam-sa-ham-ni-da.' },
          },
          tip: 'Korean shopkeepers often greet customers warmly. A polite response is appreciated.',
          image: '/lesson/shopping_01.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-02-asking-price',
          lessonNumber: 2,
          title: 'Asking for Prices',
          content: 'Learn how to ask the price of an item.',
          exampleSentences: {
            ex1: { korean: '이거 얼마예요?', english: 'How much is this?', pronunciation: 'I-geo eol-ma-ye-yo?' },
            ex2: { korean: '저건 얼마예요?', english: 'How much is that?', pronunciation: 'Jeo-geon eol-ma-ye-yo?' },
            ex3: { korean: '조금 비싸네요.', english: 'It’s a bit expensive.', pronunciation: 'Jo-geum bi-ssa-ne-yo.' },
            ex4: { korean: '할인 있어요?', english: 'Do you have a discount?', pronunciation: 'Hal-in i-sseo-yo?' },
            ex5: { korean: '더 싼 거 있어요?', english: 'Do you have something cheaper?', pronunciation: 'Deo ssan geo i-sseo-yo?' },
            ex6: { korean: '가격표 있어요?', english: 'Is there a price tag?', pronunciation: 'Ga-gyeok-pyo i-sseo-yo?' },
          },
          tip: 'In traditional markets, bargaining is common. In big stores, prices are fixed.',
          image: '/lesson/shopping_02.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-03-trying',
          lessonNumber: 3,
          title: 'Trying Things On',
          content: 'Learn useful phrases for fitting rooms and trying clothes.',
          exampleSentences: {
            ex1: { korean: '이거 입어봐도 돼요?', english: 'Can I try this on?', pronunciation: 'I-geo i-beo-bwa-do dwae-yo?' },
            ex2: { korean: '탈의실 어디예요?', english: 'Where is the fitting room?', pronunciation: 'Tal-ui-sil eo-di-ye-yo?' },
            ex3: { korean: '다른 사이즈 있어요?', english: 'Do you have another size?', pronunciation: 'Da-reun sa-i-jeu i-sseo-yo?' },
            ex4: { korean: '좀 큰 거 있어요?', english: 'Do you have something bigger?', pronunciation: 'Jom keun geo i-sseo-yo?' },
            ex5: { korean: '좀 작은 거 있어요?', english: 'Do you have something smaller?', pronunciation: 'Jom jag-eun geo i-sseo-yo?' },
            ex6: { korean: '거울 있어요?', english: 'Is there a mirror?', pronunciation: 'Geo-ul i-sseo-yo?' },
          },
          tip: 'Most clothing stores in Korea allow trying clothes before purchase.',
          image: '/lesson/shopping_03.png',
          createdAt: new Date(),
        },
        {
          id: 'lesson-04-colors',
          lessonNumber: 4,
          title: 'Asking about Colors',
          content: 'Learn how to ask if an item comes in different colors.',
          exampleSentences: {
            ex1: { korean: '이거 다른 색 있어요?', english: 'Do you have this in another color?', pronunciation: 'I-geo da-reun saek i-sseo-yo?' },
            ex2: { korean: '빨간색 있어요?', english: 'Do you have red?', pronunciation: 'Ppal-gan-saek i-sseo-yo?' },
            ex3: { korean: '검은색 있나요?', english: 'Do you have black?', pronunciation: 'Geo-meun-saek inn-a-yo?' },
            ex4: { korean: '하얀색도 있어요?', english: 'Do you also have white?', pronunciation: 'Ha-yan-saek-do i-sseo-yo?' },
            ex5: { korean: '이 색이 좋아요.', english: 'I like this color.', pronunciation: 'I saek-i jo-a-yo.' },
            ex6: { korean: '다른 색 추천해 주세요.', english: 'Please recommend another color.', pronunciation: 'Da-reun saek chu-cheon-hae ju-se-yo.' },
          },
          tip: 'In Korea, color is an important part of fashion expression.',
          image: '/lesson/shopping_04.png',
          createdAt: new Date(),
        },
        // lesson-05
        {
          id: 'lesson-05-paying',
          lessonNumber: 5,
          title: 'Paying at the Counter',
          content: 'Learn essential phrases for making payments in Korea.',
          exampleSentences: {
            ex1: { korean: '카드 돼요?', english: 'Do you take cards?', pronunciation: 'Ka-deu dwae-yo?' },
            ex2: { korean: '현금으로 계산할게요.', english: 'I’ll pay in cash.', pronunciation: 'Hyeon-geum-eu-ro gye-san-hal-gge-yo.' },
            ex3: { korean: '카드로 할게요.', english: 'I’ll pay by card.', pronunciation: 'Ka-deu-ro hal-gge-yo.' },
            ex4: { korean: '할부 돼요?', english: 'Can I pay in installments?', pronunciation: 'Hal-bu dwae-yo?' },
            ex5: { korean: '영수증 주세요.', english: 'Please give me a receipt.', pronunciation: 'Yeong-su-jeung ju-se-yo.' },
            ex6: { korean: '포인트 적립 돼요?', english: 'Can I collect points?', pronunciation: 'Po-in-teu jeok-rip dwae-yo?' },
          },
          tip: 'Most stores in Korea accept both card and cash. Mobile payment is also very common.',
          image: '/lesson/shopping_05.png',
          createdAt: new Date(),
        },

        // lesson-06
        {
          id: 'lesson-06-refund',
          lessonNumber: 6,
          title: 'Refunds and Exchanges',
          content: 'Learn how to ask for a refund or exchange items.',
          exampleSentences: {
            ex1: { korean: '환불해 주세요.', english: 'Please give me a refund.', pronunciation: 'Hwan-bul-hae ju-se-yo.' },
            ex2: { korean: '교환하고 싶어요.', english: 'I want to exchange this.', pronunciation: 'Gyo-hwan-ha-go si-peo-yo.' },
            ex3: { korean: '영수증 있어요.', english: 'I have the receipt.', pronunciation: 'Yeong-su-jeung i-sseo-yo.' },
            ex4: { korean: '며칠 이내에 환불할 수 있어요?', english: 'How many days do I have to get a refund?', pronunciation: 'Myeo-chil i-nae-e hwan-bul-hal su i-sseo-yo?' },
            ex5: { korean: '불량품이에요.', english: 'This is defective.', pronunciation: 'Bul-ryang-pum-i-e-yo.' },
            ex6: { korean: '색이 달라요.', english: 'The color is different.', pronunciation: 'Saek-i dal-la-yo.' },
          },
          tip: 'Refunds and exchanges usually require a receipt and are allowed within 7 to 14 days.',
          image: '/lesson/shopping_06.png',
          createdAt: new Date(),
        },

        // lesson-07
        {
          id: 'lesson-07-souvenirs',
          lessonNumber: 7,
          title: 'Buying Souvenirs',
          content: 'Learn expressions to buy traditional gifts and souvenirs.',
          exampleSentences: {
            ex1: { korean: '기념품 있어요?', english: 'Do you have souvenirs?', pronunciation: 'Gi-nyeom-pum i-sseo-yo?' },
            ex2: { korean: '이거 선물용이에요.', english: 'This is for a gift.', pronunciation: 'I-geo seon-mul-yong-i-e-yo.' },
            ex3: { korean: '포장해 주세요.', english: 'Please wrap it.', pronunciation: 'Po-jang-hae ju-se-yo.' },
            ex4: { korean: '더 전통적인 것 있어요?', english: 'Do you have something more traditional?', pronunciation: 'Deo jeon-tong-jeog-in geot i-sseo-yo?' },
            ex5: { korean: '한국에서 유명한 선물은 뭐예요?', english: 'What gifts are famous in Korea?', pronunciation: 'Han-gug-e-seo yu-myeong-han seon-mul-eun mwo-ye-yo?' },
            ex6: { korean: '작은 사이즈 있어요?', english: 'Do you have a smaller size?', pronunciation: 'Jag-eun sa-i-jeu i-sseo-yo?' },
          },
          tip: 'Popular souvenirs in Korea include K-pop goods, hanbok accessories, and snacks.',
          image: '/lesson/shopping_07.png',
          createdAt: new Date(),
        },

        // lesson-08
        {
          id: 'lesson-08-traditional-market',
          lessonNumber: 8,
          title: 'At the Traditional Market',
          content: 'Learn phrases useful in Korean traditional markets.',
          exampleSentences: {
            ex1: { korean: '덤 좀 주세요.', english: 'Please give me a little extra.', pronunciation: 'Deom jom ju-se-yo.' },
            ex2: { korean: '서비스 있어요?', english: 'Do you give freebies?', pronunciation: 'Seo-bi-seu i-sseo-yo?' },
            ex3: { korean: '더 신선한 거 있어요?', english: 'Do you have fresher ones?', pronunciation: 'Deo sin-seon-han geo i-sseo-yo?' },
            ex4: { korean: '반만 팔 수 있어요?', english: 'Can you sell me just half?', pronunciation: 'Ban-man pal su i-sseo-yo?' },
            ex5: { korean: '시식할 수 있어요?', english: 'Can I taste this?', pronunciation: 'Si-sik-hal su i-sseo-yo?' },
            ex6: { korean: '시장 언제 문 닫아요?', english: 'When does the market close?', pronunciation: 'Si-jang eon-je mun da-da-yo?' },
          },
          tip: 'Bargaining and asking for freebies are common in traditional markets.',
          image: '/lesson/shopping_08.png',
          createdAt: new Date(),
        },

        // lesson-09
        {
          id: 'lesson-09-online',
          lessonNumber: 9,
          title: 'Online Shopping',
          content: 'Learn Korean phrases used for online shopping.',
          exampleSentences: {
            ex1: { korean: '배송비 얼마예요?', english: 'How much is the shipping fee?', pronunciation: 'Bae-song-bi eol-ma-ye-yo?' },
            ex2: { korean: '언제 도착해요?', english: 'When will it arrive?', pronunciation: 'Eon-je do-chak-hae-yo?' },
            ex3: { korean: '환불 규정은 어떻게 돼요?', english: 'What is the refund policy?', pronunciation: 'Hwan-bul gyu-jeong-eun eo-tteo-ke dwae-yo?' },
            ex4: { korean: '리뷰 보여 주세요.', english: 'Please show me the reviews.', pronunciation: 'Ri-byu bo-yeo ju-se-yo.' },
            ex5: { korean: '품절이에요?', english: 'Is it out of stock?', pronunciation: 'Pum-jeol-i-e-yo?' },
            ex6: { korean: '배송 추적할 수 있어요?', english: 'Can I track the delivery?', pronunciation: 'Bae-song chu-jeok-hal su i-sseo-yo?' },
          },
          tip: 'Korea has fast shipping. Many sites offer same-day or next-day delivery.',
          image: '/lesson/shopping_09.png',
          createdAt: new Date(),
        },

        // lesson-10
        {
          id: 'lesson-10-discount-events',
          lessonNumber: 10,
          title: 'Discounts and Events',
          content: 'Learn useful expressions for discounts, sales, and promotions.',
          exampleSentences: {
            ex1: { korean: '세일 중이에요?', english: 'Is this on sale?', pronunciation: 'Se-il jung-i-e-yo?' },
            ex2: { korean: '몇 퍼센트 할인이에요?', english: 'What percentage is the discount?', pronunciation: 'Myeot peo-sen-teu hal-in-i-e-yo?' },
            ex3: { korean: '1+1 행사예요.', english: 'It’s a buy one get one free event.', pronunciation: 'One-peul-leo-seu one haeng-sa-ye-yo.' },
            ex4: { korean: '사은품 있어요?', english: 'Do you have a free gift?', pronunciation: 'Sa-eun-pum i-sseo-yo?' },
            ex5: { korean: '쿠폰 사용할 수 있어요?', english: 'Can I use a coupon?', pronunciation: 'Ku-pon sa-yong-hal su i-sseo-yo?' },
            ex6: { korean: '언제까지 세일해요?', english: 'Until when is the sale?', pronunciation: 'Eon-je-kka-ji se-il-hae-yo?' },
          },
          tip: 'Major discount events include Black Friday, seasonal sales, and member promotions.',
          image: '/lesson/shopping_10.png',
          createdAt: new Date(),
        },

      ];

      // 2. 코스 생성
      const shoppingCourseRef = await addDoc(collection(db, 'courses'), {
        title: 'Shopping in Korea',
        description: 'Learn essential Korean expressions for shopping and bargaining.',
        level: 'Beginner',
        category: 'shopping',
        duration: '4 hours',
        lessonsCount: shoppingLessons.length,
        image: '/course/shopping.png',
        progress: 0,
        createdAt: new Date(),
      });

      // 3. lessons 서브컬렉션에 추가
      for (const lesson of shoppingLessons) {
        await setDoc(doc(collection(shoppingCourseRef, 'lessons'), lesson.id), lesson);
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