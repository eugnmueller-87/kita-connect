'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { Loader2 } from 'lucide-react'
import { useProfileSettings } from '@/lib/useProfileSettings'
import type { Profile } from '@/types'

const SUGGESTED: Record<string, string[]> = {
  de: ['Wie lange dauert die Eingewöhnung?', 'Was passiert bei Krankheit meines Kindes?', 'Wann beginnt die Mittagsruhe?', 'Wie melde ich mein Kind krank?'],
  en: ['How long does settling-in take?', 'What happens when my child is sick?', 'When does nap time start?', 'How do I report my child sick?'],
  ru: ['Сколько длится адаптация?', 'Что делать, если ребёнок заболел?', 'Когда начинается тихий час?', 'Как сообщить о болезни ребёнка?'],
  ar: ['كم تستغرق فترة التكيف؟', 'ماذا يحدث إذا مرض طفلي؟', 'متى يبدأ وقت القيلولة؟', 'كيف أُبلّغ عن مرض طفلي؟'],
  tr: ['Uyum süreci ne kadar sürer?', 'Çocuğum hastalanırsa ne olur?', 'Öğle uykusu ne zaman başlar?', 'Çocuğumu nasıl hasta bildiririm?'],
}

const MOCK_ANSWERS: Record<string, Record<string, string>> = {
  de: {
    'Wie lange dauert die Eingewöhnung?': 'Die Eingewöhnung dauert in der Regel 2–4 Wochen. In dieser Zeit begleiten Sie Ihr Kind schrittweise, bis es sich sicher fühlt.',
    'Was passiert bei Krankheit meines Kindes?': 'Bitte melden Sie Ihr Kind bis 8:00 Uhr krank — per App oder telefonisch. Ihr Kind darf erst 24 Stunden nach dem letzten Fieber wiederkommen.',
    'Wann beginnt die Mittagsruhe?': 'Die Mittagsruhe beginnt um 12:30 Uhr und dauert bis 14:00 Uhr.',
    'Wie melde ich mein Kind krank?': 'Krankmeldung bitte über den Nachrichten-Bereich in der App oder telefonisch bis 8:00 Uhr.',
  },
  en: {
    'How long does settling-in take?': 'Settling-in usually takes 2–4 weeks. You gradually step back while your child builds confidence with their carers.',
    'What happens when my child is sick?': 'Please report by 8:00 AM via the app or by phone. Your child may return 24 hours after their last fever.',
    'When does nap time start?': 'Nap time starts at 12:30 and ends at 14:00.',
    'How do I report my child sick?': 'Use the Messages section in the app or call us before 8:00 AM.',
  },
  ru: {
    'Сколько длится адаптация?': 'Адаптация обычно занимает 2–4 недели. Вы постепенно уменьшаете своё присутствие, пока ребёнок не освоится.',
    'Что делать, если ребёнок заболел?': 'Сообщите до 8:00 через приложение или по телефону. Ребёнок может вернуться через 24 часа после последнего повышения температуры.',
    'Когда начинается тихий час?': 'Тихий час начинается в 12:30 и заканчивается в 14:00.',
    'Как сообщить о болезни ребёнка?': 'Используйте раздел «Сообщения» в приложении или позвоните нам до 8:00.',
  },
  ar: {
    'كم تستغرق فترة التكيف؟': 'تستغرق فترة التكيف عادةً من أسبوعين إلى أربعة أسابيع، تُرافق خلالها طفلك تدريجياً حتى يشعر بالأمان.',
    'ماذا يحدث إذا مرض طفلي؟': 'يُرجى الإبلاغ قبل الساعة 8:00 صباحاً عبر التطبيق أو الهاتف. يمكن لطفلك العودة بعد 24 ساعة من انتهاء الحمى.',
    'متى يبدأ وقت القيلولة؟': 'يبدأ وقت القيلولة في الساعة 12:30 وينتهي في الساعة 14:00.',
    'كيف أُبلّغ عن مرض طفلي؟': 'استخدم قسم الرسائل في التطبيق أو اتصل بنا قبل الساعة 8:00 صباحاً.',
  },
  tr: {
    'Uyum süreci ne kadar sürer?': 'Uyum süreci genellikle 2–4 hafta sürer. Bu süreçte çocuğunuz güvende hissedene kadar kademeli olarak geri çekilirsiniz.',
    'Çocuğum hastalanırsa ne olur?': 'Lütfen saat 08:00\'e kadar uygulama veya telefon ile bildirim yapın. Son ateşten 24 saat sonra dönebilir.',
    'Öğle uykusu ne zaman başlar?': 'Öğle uykusu 12:30\'da başlar ve 14:00\'te biter.',
    'Çocuğumu nasıl hasta bildiririm?': 'Uygulamadaki Mesajlar bölümünü kullanın veya sabah 08:00\'den önce arayın.',
  },
}

const FALLBACK: Record<string, string> = {
  de: 'Das ist eine gute Frage! In der Live-Version antwortet unser KI-Assistent sofort. Bitte wenden Sie sich an das Kita-Team.',
  en: 'Great question! In the live version our AI assistant answers immediately. Please contact the Kita team for now.',
  ru: 'Хороший вопрос! В рабочей версии наш ИИ-ассистент ответит немедленно. Пока обратитесь к команде Kita.',
  ar: 'سؤال رائع! في النسخة الحية، يجيب مساعدنا الذكي على الفور. يُرجى التواصل مع فريق الروضة في الوقت الحالي.',
  tr: 'Güzel soru! Canlı sürümde yapay zeka asistanımız hemen yanıt verir. Şimdilik Kita ekibiyle iletişime geçin.',
}

const PLACEHOLDER: Record<string, string> = {
  de: 'Ihre Frage eingeben…',
  en: 'Type your question…',
  ru: 'Введите ваш вопрос…',
  ar: 'اكتب سؤالك…',
  tr: 'Sorunuzu yazın…',
}

export default function FaqPage({ profile }: { profile: Profile }) {
  const { settings } = useProfileSettings(profile.id)
  const lang = settings.lang
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [source, setSource] = useState<'cache' | 'claude' | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function ask(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setAnswer('')
    setError('')
    setSource('')
    await new Promise(r => setTimeout(r, 800))
    const cached = MOCK_ANSWERS[lang]?.[q]
    if (cached) {
      setAnswer(cached)
      setSource('cache')
    } else {
      setAnswer(FALLBACK[lang] ?? FALLBACK.de)
      setSource('claude')
    }
    setLoading(false)
  }

  const suggested = SUGGESTED[lang] ?? SUGGESTED.de

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)' }}>
          <div className="text-6xl flex-shrink-0">🤖</div>
          <div>
            <h1 className="text-2xl font-black text-white">Fragen & Antworten</h1>
            <p className="text-purple-200 font-semibold text-sm mt-1">KI-Assistent für Kita-Fragen</p>
          </div>
        </div>

        <div className="kc-card p-5 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask(question)}
              placeholder={PLACEHOLDER[lang] ?? PLACEHOLDER.de}
              className="kc-input flex-1 px-4 py-3 text-sm"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
            <button
              onClick={() => ask(question)}
              disabled={loading || !question.trim()}
              className="kc-btn bg-teal-600 disabled:opacity-50 text-white px-5 py-3 font-black"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : '🔍'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <p className="text-xs font-black text-gray-400 w-full mb-1">
              {{ de: 'Häufige Fragen:', en: 'Common questions:', ru: 'Частые вопросы:', ar: 'أسئلة شائعة:', tr: 'Sık sorulan sorular:' }[lang] ?? 'Häufige Fragen:'}
            </p>
            {suggested.map(s => (
              <button
                key={s}
                onClick={() => { setQuestion(s); ask(s) }}
                className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-3 py-1.5 rounded-full transition-colors border-2 border-teal-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="kc-card px-5 py-4 mb-4 bg-red-50 border-red-200 text-sm text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="kc-card px-5 py-8 mb-4 text-center">
            <div className="text-4xl mb-3 animate-bounce">🤔</div>
            <p className="text-gray-500 font-semibold text-sm">
              {{ de: 'KI denkt nach…', en: 'AI is thinking…', ru: 'ИИ думает…', ar: 'الذكاء الاصطناعي يفكر…', tr: 'Yapay zeka düşünüyor…' }[lang] ?? 'KI denkt nach…'}
            </p>
          </div>
        )}

        {answer && !loading && (
          <div className="kc-card p-6" style={{ background: 'linear-gradient(135deg, #F0F4FF, #EDE8FF)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💡</span>
              <span className="font-black text-gray-700">
                {{ de: 'Antwort', en: 'Answer', ru: 'Ответ', ar: 'الجواب', tr: 'Cevap' }[lang] ?? 'Antwort'}
              </span>
              <span className="kc-badge bg-purple-100 text-purple-700 text-xs ml-auto">
                {source === 'cache' ? '📚 FAQ' : '🤖 KI'}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{answer}</p>
            <p className="text-xs text-gray-400 font-semibold mt-4 pt-4 border-t border-purple-100">
              {{ de: 'Kein Ersatz für Rücksprache mit dem Kita-Team.', en: 'Not a substitute for direct contact with the Kita team.', ru: 'Не заменяет прямой контакт с командой Kita.', ar: 'لا يُغني عن التواصل المباشر مع فريق الروضة.', tr: 'Kita ekibiyle doğrudan iletişimin yerini tutmaz.' }[lang] ?? ''}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
