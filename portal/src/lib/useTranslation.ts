'use client'

import { t, Lang } from './translations'

type Leaf = { de: string; en: string; tr: string; ru: string }

function tr(node: Leaf, lang: Lang): string {
  return node[lang] ?? node.de
}

export function useTranslation(lang: string) {
  const l = (lang as Lang) in { de: 1, en: 1, tr: 1, ru: 1 } ? (lang as Lang) : 'de'

  return {
    lang: l,
    // shorthand: pass any leaf node and get the string back
    tr: (node: Leaf) => tr(node, l),
    // access the full translation tree
    t,
  }
}
