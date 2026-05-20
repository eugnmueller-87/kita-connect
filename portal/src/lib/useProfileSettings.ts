'use client'

import { useState, useEffect } from 'react'

export interface ProfileSettings {
  lang: string
  notifyEmail: boolean
  notifyPush: boolean
  notifySms: boolean
}

const DEFAULTS: ProfileSettings = {
  lang: 'de',
  notifyEmail: true,
  notifyPush: true,
  notifySms: false,
}

function storageKey(profileId: string) {
  return `kc_settings_${profileId}`
}

export function useProfileSettings(profileId: string) {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULTS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(profileId))
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch {}
  }, [profileId])

  function update(patch: Partial<ProfileSettings>) {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      try { localStorage.setItem(storageKey(profileId), JSON.stringify(next)) } catch {}
      if (patch.lang) {
        document.cookie = `kc_lang=${patch.lang};path=/;max-age=31536000;samesite=lax`
      }
      return next
    })
  }

  return { settings, update }
}
