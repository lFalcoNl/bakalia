import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="fade-in fade-in bg-primary text-secondary p-6 mt-auto">
      <div className="fade-in fade-in container mx-auto flex flex-col md:flex-row items-center justify-between">
        <Link to="/">
          <img src="/images/logo/mainLogo.png" alt="Logo" className="fade-in fade-in h-20 m-3 rounded-md" />
        </Link>
        <div className="fade-in fade-in text-center md:text-left space-y-1">
          <p>Адреса: м.Шептицький</p>
{/*           <p>Адреса: вул. Бічна Промислова 23А, м.Шептицький</p> */}
          <p>Телефон: +380986150065</p>
          <p>Email: bakaliyniydvir@gmail.com</p>
        </div>
      </div>
    </footer>
  )
}
