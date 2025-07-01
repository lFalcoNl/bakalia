import React from 'react'
import { Link } from 'react-router-dom'
import { FiPhone, FiMail } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-primary text-accent border-t border-secondary mt-auto">
      <div className="max-w-7xl mx-auto py-6 flex flex-col md:flex-row items-center justify-between w-full px-4">
        <Link to="/" className="mb-6 md:mb-0">
          <img
            src="/images/logo/mainLogo.png"
            alt="Logo"
            className="h-20 w-auto rounded-md shadow-sm transition-opacity hover:opacity-90"
          />
        </Link>
        <div className="space-y-2 text-center md:text-left text-sm">
          <p className="flex items-center justify-center md:justify-start space-x-2">
            <FiPhone className="text-secondary" />
            <a
              href="tel:+380986150065"
              className="text-accent hover:underline transition-colors"
            >
              +380 98 615 00 65
            </a>
          </p>
          <p className="flex items-center justify-center md:justify-start space-x-2">
            <FiMail className="text-secondary" />
            <a
              href="mailto:bakaliyniydvir@gmail.com"
              className="text-accent hover:underline transition-colors"
            >
              bakaliyniydvir@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Нижній рядок з копірайтом */}
      <div className="text-xs text-center bg-primary text-accent">
        © {new Date().getFullYear()} Бакалійний Двір
      </div>
    </footer>
  )
}
