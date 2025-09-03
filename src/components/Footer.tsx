export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">한국어 학습</h3>
            <p className="text-gray-300 mb-4">
              영어 사용자들을 위한 체계적이고 효과적인 한국어 학습 플랫폼입니다.
            </p>
            <p className="text-gray-400 text-sm">
              © 2024 한국어 학습. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">빠른 링크</h4>
            <ul className="space-y-2">
              <li><a href="/courses" className="text-gray-300 hover:text-white">코스</a></li>
              <li><a href="/community" className="text-gray-300 hover:text-white">커뮤니티</a></li>
              <li><a href="/dashboard" className="text-gray-300 hover:text-white">대시보드</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-md font-semibold mb-4">지원</h4>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-300 hover:text-white">도움말</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">문의하기</a></li>
              <li><a href="/faq" className="text-gray-300 hover:text-white">자주 묻는 질문</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
