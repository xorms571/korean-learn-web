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
              © 2024 Korean Learning. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/courses" className="text-gray-300 hover:text-white">Courses</a></li>
              <li><a href="/community" className="text-gray-300 hover:text-white">Community</a></li>
              <li><a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-md font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-300 hover:text-white">Help</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
              <li><a href="/faq" className="text-gray-300 hover:text-white">FAQ</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
