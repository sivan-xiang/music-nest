import { ref } from 'vue'

const STORE_KEY = 'mn-theme'

function getInitial() {
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {}
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const theme = ref(getInitial())

export function applyTheme(t) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', t)
  try {
    localStorage.setItem(STORE_KEY, t)
  } catch {}
}

export function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme(theme.value)
}

// 模块加载即应用，避免首屏闪烁（main.js 会先 import 本模块）
applyTheme(theme.value)
