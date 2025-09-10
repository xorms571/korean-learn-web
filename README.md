# Korean Learning Platform

이 프로젝트는 영어권 사용자를 위한 체계적인 한국어 학습 플랫폼입니다. Next.js와 Firebase를 기반으로 구축되었으며, 다양한 인터랙티브 기능을 통해 학습 경험을 향상시키는 것을 목표로 합니다.

## ✨ 주요 기능

### 1. 사용자 인증
- **회원가입 및 로그인**: Firebase Authentication을 이용한 이메일 기반의 안전한 회원가입 및 로그인 기능을 제공합니다.
- **프로필 관리**: 사용자는 자신의 프로필 정보(이름, 프로필 사진 등)를 관리할 수 있습니다.

### 2. 코스 시스템
- **코스 탐색**: 레벨(Beginner, Intermediate, Advanced) 및 카테고리별로 코스를 필터링하고 탐색할 수 있습니다.
- **학습 진행률 추적**: 각 코스의 학습 진행 상태가 퍼센티지로 표시되며, 완료한 코스는 특별한 뱃지로 표시됩니다.
- **동적 콘텐츠**: 코스 목록의 이미지는 Pexels/Pixabay API를 통해 동적으로 가져와 시각적인 흥미를 더합니다.

### 3. 자동 레벨 시스템
- **레벨 자동 계산**: 사용자의 코스 완료 상태에 따라 'Beginner 0'과 같은 형태로 현재 레벨이 자동으로 계산되고 업데이트됩니다.
- **동기 부여**: 특정 레벨의 모든 코스를 100% 완료하면 다음 단계(예: Intermediate 0)로 레벨이 상승하여 학습에 대한 동기를 부여합니다.

### 4. 커뮤니티
- **게시글 작성 및 조회**: 사용자는 커뮤니티에 게시글을 작성하여 다른 학습자들과 소통할 수 있습니다.
- **실시간 댓글 수**: 각 게시글의 댓글 수가 실시간으로 업데이트되어 표시됩니다.

### 5. 문의하기 기능
- **이메일 전송**: 사용자는 문의하기 페이지의 양식을 통해 관리자에게 직접 이메일을 보낼 수 있습니다.
- **Resend 연동**: Next.js API Route와 Resend 서비스를 연동하여 안정적인 이메일 전송을 구현했습니다.

### 6. 정보 페이지
- **Help / FAQ / Contact**: 사용자의 편의를 위해 도움말, 자주 묻는 질문, 문의하기 등 다양한 정보 페이지를 제공합니다.

## 🛠️ 기술 스택

- **프레임워크**: Next.js (v14)
- **언어**: TypeScript
- **백엔드 및 데이터베이스**: Firebase (Firestore, Authentication)
- **스타일링**: Tailwind CSS
- **이메일 서비스**: Resend
- **아이콘**: react-icons

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
