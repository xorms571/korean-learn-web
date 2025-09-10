import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Korean Learning</h3>
            <p className="text-gray-300 mb-4">
              A systematic and effective Korean learning platform for English speakers.
            </p>
            <p className="text-gray-400 text-sm">
              © 2025 Korean Learning. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/courses" className="text-gray-300 hover:text-white">Courses</Link></li>
              <li><Link href="/community" className="text-gray-300 hover:text-white">Community</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-md font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-300 hover:text-white">Help</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
