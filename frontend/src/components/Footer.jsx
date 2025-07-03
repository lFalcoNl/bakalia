import React from 'react'
import { Link } from 'react-router-dom'
import { FiPhone, FiMail } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export default function Footer() {
  return (
    <AnimatePresence>
      <motion.footer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
        className="bg-primary text-accent border-t border-secondary mt-auto"
      >
        <div className="max-w-7xl mx-auto py-6 px-4 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
          <Link to="/" className="shrink-0">
            <img
              src="/images/logo/mainLogo.png"
              alt="Logo"
              loading="lazy"
              className="h-20 w-auto rounded-md shadow-sm transition-opacity hover:opacity-90"
            />
          </Link>

          <div className="space-y-2 text-center md:text-left text-sm">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <FiPhone className="text-secondary" />
              <a
                href="tel:+380986150065"
                className="hover:underline transition-colors"
              >
                +380 98 615 00 65
              </a>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-2">
              <FiMail className="text-secondary" />
              <a
                href="mailto:bakaliyniydvir@gmail.com"
                className="hover:underline transition-colors"
              >
                bakaliyniydvir@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="text-xs text-center text-accent py-2">
          © {new Date().getFullYear()} Бакалійний Двір
        </div>
      </motion.footer>
    </AnimatePresence>
  )
}
