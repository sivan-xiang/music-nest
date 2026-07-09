<script setup>
import { usePlayer } from '../store/player.js'
import AppLogo from './AppLogo.vue'
import { theme, toggleTheme } from '../store/theme.js'

const props = defineProps({ current: { type: String, default: 'discover' } })
const emit = defineEmits(['navigate'])
const { state, isFav, getFavs } = usePlayer()

const items = [
  { key: 'discover', label: '发现', icon: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
  { key: 'search', label: '搜索', icon: 'M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z' },
  { key: 'favorites', label: '我的收藏', icon: 'M12 21s-7.5-4.6-10-9.2C.6 8.9 2 5.5 5.2 5.1 7 4.9 8.6 5.8 9.4 7.2L12 12l2.6-4.8C15.4 5.8 17 4.9 18.8 5.1 22 5.5 23.4 8.9 22 11.8 19.5 16.4 12 21 12 21z' }
]
</script>

<template>
  <aside class="sidebar glass">
    <div class="brand">
      <AppLogo :size="46" variant="tile" />
      <div class="brand-text">
        <div class="brand-name">音乐小窝</div>
        <div class="brand-sub">Music Nest</div>
      </div>
    </div>

    <nav class="nav">
      <button
        v-for="it in items"
        :key="it.key"
        class="nav-item"
        :class="{ active: current === it.key }"
        @click="emit('navigate', { view: it.key })"
      >
        <svg viewBox="0 0 24 24" class="ico">
          <path :d="it.icon" />
        </svg>
        <span>{{ it.label }}</span>
        <em v-if="it.key === 'favorites' && getFavs().length" class="badge">{{ getFavs().length }}</em>
      </button>
    </nav>

    <button class="now-mini" v-if="state.current" @click="emit('navigate', { view: 'now' })">
      <img :src="state.current.album?.picUrl" class="mini-cover" alt="" />
      <div class="mini-meta ellipsis">
        <div class="mini-name ellipsis">{{ state.current.name }}</div>
        <div class="mini-art ellipsis">{{ state.current.artistName }}</div>
      </div>
      <span class="mini-wave" :class="{ playing: state.isPlaying }">♪</span>
    </button>

    <div class="foot">
      <div class="slogan">雾屿听风 · 私人音乐小窝</div>
      <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? '切换到浅色' : '切换到深色'">
        <svg v-if="theme === 'dark'" viewBox="0 0 24 24" class="tt-ico"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 01-8.54-8.54c-.44-.06-.9-.1-1.36-.1z"/></svg>
        <svg v-else viewBox="0 0 24 24" class="tt-ico"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>
        <span>{{ theme === 'dark' ? '深色模式' : '浅色模式' }}</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  flex: 0 0 var(--sidebar-w);
  height: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-line);
  display: flex;
  flex-direction: column;
  padding: 26px 16px;
  gap: 26px;
}

.brand { display: flex; align-items: center; gap: 12px; padding: 0 6px; }
.brand-text { display: flex; flex-direction: column; line-height: 1.2; }
.brand-name {
  font-family: var(--font-display);
  font-size: 19px; font-weight: 700; letter-spacing: 1px;
  background: var(--grad-primary);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.brand-sub { font-size: 10.5px; color: var(--text-dim); letter-spacing: 2.5px; margin-top: 3px; }

.nav { display: flex; flex-direction: column; gap: 6px; }
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: var(--radius-md);
  color: var(--text-soft); font-size: 15px; font-weight: 600;
  transition: .22s; position: relative;
}
.nav-item:hover { background: var(--surface-hover); color: var(--text); box-shadow: 0 6px 18px rgba(120, 160, 200, 0.16); }
.nav-item.active {
  background: var(--grad-soft);
  color: var(--text);
  box-shadow: inset 0 0 0 1px rgba(120, 160, 200, 0.16);
}
.nav-item.active::before {
  content: ''; position: absolute; left: -16px; top: 17px; bottom: 17px;
  width: 4px; border-radius: 99px; background: var(--grad-primary);
}
.ico { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; transition: transform .22s; }
.nav-item:hover .ico { transform: scale(1.18); }
.badge {
  margin-left: auto; font-style: normal; font-size: 12px;
  background: var(--grad-primary); color: #fff; border-radius: 99px;
  padding: 1px 8px; min-width: 22px; text-align: center;
}

.now-mini {
  margin-top: auto; display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: var(--radius-md); cursor: pointer;
  background: var(--surface-strong); border: 1px solid var(--surface-line);
  transition: .22s; text-align: left; width: 100%;
}
.now-mini:hover { background: var(--surface-hover); box-shadow: var(--shadow-soft); }
.mini-cover { width: 40px; height: 40px; border-radius: 11px; object-fit: cover; box-shadow: var(--shadow-card); }
.mini-meta { flex: 1; min-width: 0; }
.mini-name { font-size: 13px; font-weight: 600; }
.mini-art { font-size: 11px; color: var(--text-dim); }
.mini-wave { color: var(--c-teal); font-size: 18px; }
.mini-wave.playing { animation: wave 1s ease-in-out infinite; }
@keyframes wave { 0%, 100% { transform: translateY(0); opacity: .5; } 50% { transform: translateY(-3px); opacity: 1; } }

.foot {
  display: flex; flex-direction: column; align-items: stretch; gap: 10px;
  padding-top: 4px;
}
.slogan {
  font-size: 11px; color: var(--text-dim); letter-spacing: 1px;
  text-align: center; line-height: 1.5;
}
.theme-toggle {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 9px 12px; border-radius: 99px;
  background: var(--surface-strong); border: 1px solid var(--surface-line);
  color: var(--text-soft); font-size: 13px; font-weight: 600;
  transition: .22s; cursor: pointer;
}
.theme-toggle:hover { background: var(--surface-hover); color: var(--text); box-shadow: var(--shadow-soft); }
.tt-ico { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
</style>
