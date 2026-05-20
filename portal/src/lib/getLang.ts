import { cookies } from 'next/headers'
import type { Lang } from './translations'

const VALID: Lang[] = ['de', 'en', 'tr', 'ru']

export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies()
  const lang = cookieStore.get('kc_lang')?.value as Lang | undefined
  return VALID.includes(lang as Lang) ? (lang as Lang) : 'de'
}
