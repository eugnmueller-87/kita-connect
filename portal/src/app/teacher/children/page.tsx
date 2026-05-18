import Link from 'next/link'
import Navbar from '@/components/navbar'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-teacher', full_name: 'Maria Schmidt', email: 'maria@kita-connect.de',
  role: 'teacher', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

export const mockChildren = [
  { id: '1', name: 'Emma Müller',  birth_date: '2020-03-15', group_name: 'Schmetterlinge', gender: 'f' },
  { id: '2', name: 'Luca Becker',  birth_date: '2019-11-22', group_name: 'Schmetterlinge', gender: 'm' },
  { id: '3', name: 'Mia Fischer',  birth_date: '2020-07-08', group_name: 'Schmetterlinge', gender: 'f' },
  { id: '4', name: 'Noah Klein',   birth_date: '2019-09-14', group_name: 'Schmetterlinge', gender: 'm' },
  { id: '5', name: 'Lea Wagner',   birth_date: '2020-01-30', group_name: 'Bienen',         gender: 'f' },
  { id: '6', name: 'Ben Schulz',   birth_date: '2019-12-05', group_name: 'Bienen',         gender: 'm' },
]

function ChildAvatar({ gender, size = 56 }: { gender: string; size?: number }) {
  const s = size
  if (gender === 'f') {
    return (
      <svg width={s} height={s} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <ellipse cx="28" cy="44" rx="14" ry="9" fill="#FF9FB2"/>
        {/* Head */}
        <circle cx="28" cy="26" r="14" fill="#FFCF8B"/>
        {/* Hair back */}
        <ellipse cx="28" cy="16" rx="14" ry="8" fill="#C0761A"/>
        {/* Pigtails */}
        <ellipse cx="14" cy="22" rx="4" ry="6" fill="#C0761A"/>
        <ellipse cx="42" cy="22" rx="4" ry="6" fill="#C0761A"/>
        {/* Hair bow left */}
        <ellipse cx="14" cy="17" rx="4" ry="2.5" fill="#FF6B9D" transform="rotate(-20 14 17)"/>
        <ellipse cx="14" cy="17" rx="4" ry="2.5" fill="#FF6B9D" transform="rotate(20 14 17)"/>
        <circle cx="14" cy="17" r="2" fill="#FF3D7F"/>
        {/* Eyes */}
        <circle cx="23" cy="27" r="2.5" fill="#3D2B1F"/>
        <circle cx="33" cy="27" r="2.5" fill="#3D2B1F"/>
        <circle cx="24" cy="26" r="0.8" fill="white"/>
        <circle cx="34" cy="26" r="0.8" fill="white"/>
        {/* Cheeks */}
        <ellipse cx="20" cy="31" rx="3" ry="2" fill="#FFB3C6" opacity="0.7"/>
        <ellipse cx="36" cy="31" rx="3" ry="2" fill="#FFB3C6" opacity="0.7"/>
        {/* Smile */}
        <path d="M23 33 Q28 37 33 33" stroke="#C0761A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    )
  }
  return (
    <svg width={s} height={s} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="28" cy="44" rx="14" ry="9" fill="#7EC8E3"/>
      {/* Head */}
      <circle cx="28" cy="26" r="14" fill="#FFCF8B"/>
      {/* Hair */}
      <ellipse cx="28" cy="15" rx="13" ry="7" fill="#7B4F2E"/>
      <ellipse cx="15" cy="20" rx="4" ry="5" fill="#7B4F2E"/>
      <ellipse cx="41" cy="20" rx="4" ry="5" fill="#7B4F2E"/>
      {/* Eyes */}
      <circle cx="23" cy="27" r="2.5" fill="#3D2B1F"/>
      <circle cx="33" cy="27" r="2.5" fill="#3D2B1F"/>
      <circle cx="24" cy="26" r="0.8" fill="white"/>
      <circle cx="34" cy="26" r="0.8" fill="white"/>
      {/* Cheeks */}
      <ellipse cx="20" cy="31" rx="3" ry="2" fill="#FFCBA4" opacity="0.7"/>
      <ellipse cx="36" cy="31" rx="3" ry="2" fill="#FFCBA4" opacity="0.7"/>
      {/* Smile */}
      <path d="M23 33 Q28 37 33 33" stroke="#7B4F2E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

export default function TeacherChildrenPage() {
  const profile = mockProfile
  const children = mockChildren
  const groups = [...new Set(children.map(c => c.group_name).filter(Boolean))]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">

        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <ChildAvatar gender="f" size={64} />
          <div>
            <h1 className="text-2xl font-black text-white">Alle Kinder</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">
              {children.length} Kinder · {groups.length} Gruppen
            </p>
          </div>
        </div>

        {groups.map(group => (
          <div key={group} className="mb-6">
            <h2 className="font-black text-gray-600 text-sm uppercase tracking-wider mb-3 px-1">
              📍 Gruppe {group}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {children.filter(c => c.group_name === group).map(child => (
                <Link
                  key={child.id}
                  href={`/teacher/children/${child.id}`}
                  className="kc-card p-4 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer"
                  style={{ background: child.gender === 'f' ? '#FFF0F5' : '#EEF6FF' }}
                >
                  <ChildAvatar gender={child.gender} size={48} />
                  <div>
                    <p className="font-black text-gray-800 text-sm">{child.name}</p>
                    <p className="text-xs text-gray-400 font-semibold">
                      {new Date(child.birth_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
