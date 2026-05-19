'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell, Menu, X, LogOut, Settings } from 'lucide-react'
import type { Profile } from '@/types'

interface NavbarProps {
  profile: Profile
  unreadCount?: number
}

const navLinks: Record<string, { label: string; href: string; emoji: string }[]> = {
  parent: [
    { label: 'Übersicht', href: '/parent', emoji: '🏠' },
    { label: 'Mein Kind', href: '/parent/child', emoji: '👶' },
    { label: 'Nachrichten', href: '/parent/tickets', emoji: '💬' },
    { label: 'FAQ', href: '/parent/faq', emoji: '🤔' },
  ],
  teacher: [
    { label: 'Übersicht', href: '/teacher', emoji: '🏠' },
    { label: 'Gruppen', href: '/teacher/groups', emoji: '👥' },
    { label: 'Kinder', href: '/teacher/children', emoji: '👶' },
    { label: 'Beobachtungen', href: '/teacher/observations', emoji: '👁️' },
    { label: 'Lerngeschichten', href: '/teacher/stories', emoji: '📖' },
    { label: 'Speiseplan', href: '/teacher/meals', emoji: '🍽️' },
    { label: 'Mitteilung', href: '/teacher/broadcast', emoji: '📢' },
  ],
  admin: [
    { label: 'Übersicht', href: '/admin', emoji: '🏠' },
    { label: 'Eltern', href: '/admin/parents', emoji: '👨‍👩‍👧' },
    { label: 'Speiseplan', href: '/admin/meals', emoji: '🍽️' },
    { label: 'Broadcast', href: '/admin/broadcast', emoji: '📢' },
    { label: 'Einladungen', href: '/admin/invitations', emoji: '✉️' },
  ],
}

export default function Navbar({ profile, unreadCount = 0 }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const links = navLinks[profile.role] ?? []

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b-4 border-[#EDE8DF] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <a href={`/${profile.role}`} className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">🏡</span>
          <span className="font-black text-lg text-teal-700 tracking-tight">Kita Connect</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                pathname === l.href
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <span>{l.emoji}</span>
              {l.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <a
            href={`/${profile.role}/notifications`}
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </a>

          <div className="hidden md:flex items-center gap-2 bg-teal-50 rounded-xl px-3 py-1.5">
            <span className="text-lg">
              {profile.role === 'parent' ? '👨‍👩‍👧' : profile.role === 'teacher' ? '👩‍🏫' : '⚙️'}
            </span>
            <span className="text-sm font-bold text-teal-700">{profile.full_name.split(' ')[0]}</span>
          </div>

          <a
            href={`/${profile.role}/settings`}
            className={`p-2 rounded-xl transition-colors ${pathname === `/${profile.role}/settings` ? 'bg-teal-100 text-teal-700' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}
            title="Einstellungen"
          >
            <Settings size={18} />
          </a>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Abmelden"
          >
            <LogOut size={18} />
          </button>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t-2 border-[#EDE8DF] px-4 py-3 flex flex-col gap-1">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-teal-50 hover:text-teal-700"
            >
              <span>{l.emoji}</span> {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
