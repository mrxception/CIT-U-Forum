import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="/cit.png" alt="CIT Logo"/>
              </div>
              <span className="font-bold text-xl text-gray-900">Forum</span>
            </div>
            <p className="text-gray-600 text-sm">
              Discussion forum for Cebu Institute of Technology - University students.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/forums" className="text-gray-600 hover:text-blue-600">
                  Forums
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-blue-600">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-blue-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-gray-600 hover:text-blue-600">
                  Forum Rules
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">CIT-U</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://cit.edu"
                  className="text-gray-600 hover:text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official Website
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2025 CIT-U Forum. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
