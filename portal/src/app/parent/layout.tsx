'use client'
import { usePushSubscription } from '@/lib/usePushSubscription'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  usePushSubscription()
  return <>{children}</>
}
