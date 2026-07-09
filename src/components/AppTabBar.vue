<script setup>
import { theme, toggleTheme } from '../store/theme.js'

const props = defineProps({ current: { type: String, default: 'discover' } })
const emit = defineEmits(['navigate'])

const items = [
  { key: 'discover', label: '发现', icon: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
  { key: 'search', label: '搜索', icon: 'M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z' },
  { key: 'favorites', label: '收藏', icon: 'M12 21s-7.5-4.6-10-9.2C.6 8.9 2 5.5 5.2 5.1 7 4.9 8.6 5.8 9.4 7.2L12 12l2.6-4.8C15.4 5.8 17 4.9 18.8 5.1 22 5.5 23.4 8.9 22 11.8 19.5 16.4 12 21 12 21z' }
]
</script>

<template>
  <nav class="tabbar glass">
    <button
      v-for="it in items"
      :key="it.key"
      class="tab"
      :class="{ active: current === it.key }"
      @click="emit('navigate', { view: it.key })"
    >
      <svg viewBox="0 0 24 24" class="ico">
        <path :d="it.icon" />
      </svg>
      <span>{{ it.label }}</span>
    </button>

    <button class="tab theme" @click="toggleTheme" :title="theme === 'dark' ? '切换到浅色' : '切换到深色'">
      <svg v-if="theme === 'dark'" viewBox="0 0 24 24" class="ico"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 01-8.54-8.54c-.44-.06-.9-.1-1.36-.1z"/></svg>
      <svg v-else viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>
    </button>
  </nav>
</template>

<style scoped>
/* 桌面端隐藏，由左侧 Sidebar 承担导航 */
.tabbar { display: none; }

/* ============ 移动端：底部 Tab 栏 ============ */
@media (max-width: 820px) {
  .tabbar {
    display: flex;
    position: fixed;
    left: 0; right: 0; bottom: 0;
    z-index: 60;
    height: calc(var(--tabbar-h) + env(safe-area-inset-bottom));
    padding: 6px 8px env(safe-area-inset-bottom);
    align-items: stretch;
    gap: 4px;
    background: var(--surface-strong);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border-top: 1px solid var(--surface-line);
    border-radius: 18px 18px 0 0;
    box-shadow: 0 -8px 30px rgba(90, 130, 150, 0.12);
  }

  .tab {
    flex: 1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px;
    border-radius: 12px;
    color: var(--text-dim);
    font-size: 11px; font-weight: 600;
    transition: .2s;
    min-height: 44px; /* 触屏最小命中区域 */
  }
  .tab .ico {
    width: 22px; height: 22px; fill: none; stroke: currentColor;
    stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;
    transition: transform .2s, color .2s;
  }
  .tab.active { color: var(--text); }
  .tab.active .ico { transform: translateY(-1px) scale(1.08); }
  /* 选中态用渐变填充图标 */
  .tab.active .ico { color: #2b8f86; }

  /* 主题切换按钮：不平分宽度，独立成列 */
  .tab.theme { flex: 0 0 auto; width: 52px; color: var(--text-soft); }

  /* 触屏无 hover：直接给按压缩放反馈 */
  .tab:active { transform: scale(.92); }
}
</style>
