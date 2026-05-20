import Navbar from '@/components/navbar'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { getLang } from '@/lib/getLang'
import { t } from '@/lib/translations'
import KitaManager from './kita-manager'

export default async function AdminKitasPage() {
  const { profile } = await requireRole(['super_admin', 'traeger_admin'])
  const supabase = await createClient()
  const lang = await getLang()
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de

  const [{ data: kitas }, { data: traegerList }] = await Promise.all([
    supabase.from('kitas').select('*, traeger(id, name)').order('name'),
    supabase.from('traeger').select('*').order('name'),
  ])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={lang} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <a href="/admin" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">{tr(t.common.back)}</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #1D7A6F, #2EA89A)' }}>
          <div className="text-6xl flex-shrink-0">🏫</div>
          <div>
            <h1 className="text-2xl font-black text-white">{tr(t.adminKitas.heading)}</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">
              {kitas?.length ?? 0} Kitas · {traegerList?.length ?? 0} Träger
            </p>
          </div>
        </div>

        <KitaManager
          initialKitas={kitas ?? []}
          initialTraeger={traegerList ?? []}
          lang={lang}
        />
      </div>
    </div>
  )
}
