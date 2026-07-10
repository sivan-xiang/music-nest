<script setup>
import { ref, computed } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import AppTabBar from './components/AppTabBar.vue'
import ParticlesBg from './components/ParticlesBg.vue'
import AppPlayer from './components/AppPlayer.vue'
import DiscoverView from './views/DiscoverView.vue'
import SearchView from './views/SearchView.vue'
import PlaylistView from './views/PlaylistView.vue'
import FavoritesView from './views/FavoritesView.vue'
import LocalView from './views/LocalView.vue'
import NowPlayingView from './views/NowPlayingView.vue'
import { usePlayer } from './store/player.js'

const { state, openNow, closeNow } = usePlayer()

const currentView = ref('discover')
const viewParams = ref({})

function navigate({ view, params = {} }) {
  if (view === 'now') {
    openNow()
    return
  }
  currentView.value = view
  viewParams.value = params
  closeNow()
}

const showNow = computed(() => state.showNow)
</script>

<template>
  <div class="app">
    <ParticlesBg />
    <AppSidebar :current="currentView" @navigate="navigate" />

    <main class="main">
      <DiscoverView v-if="currentView === 'discover'" @navigate="navigate" />
      <SearchView v-else-if="currentView === 'search'" :q="viewParams.q || ''" @navigate="navigate" />
      <PlaylistView
        v-else-if="currentView === 'playlist'"
        :playlist="viewParams.playlist || null"
        :id="viewParams.id || null"
        @navigate="navigate"
      />
      <FavoritesView v-else-if="currentView === 'favorites'" @navigate="navigate" />
      <LocalView v-else-if="currentView === 'local'" @navigate="navigate" />
    </main>

    <AppTabBar :current="currentView" @navigate="navigate" />

    <AppPlayer @open-now="openNow" />

    <transition name="nowfade">
      <NowPlayingView v-if="showNow" @close="closeNow" />
    </transition>
  </div>
</template>

<style scoped>
.app { position: relative; z-index: 1; display: flex; gap: var(--app-gap); padding: var(--app-gap); height: 100vh; height: 100dvh; overflow: hidden; }
.main {
  flex: 1; height: 100%; overflow: hidden;
  padding-bottom: calc(var(--player-h) + 28px);
}
.nowfade-enter-active, .nowfade-leave-active { transition: opacity .35s ease; }
.nowfade-enter-from, .nowfade-leave-to { opacity: 0; }

/* ========== 移动端：整体改为纵向布局，内容占满全宽 ========== */
@media (max-width: 820px) {
  .app { flex-direction: column; padding: 0; gap: 0; }
  .main {
    /* 底部给迷你播放条 + Tab 栏 + 安全区留白 */
    padding-bottom: calc(var(--player-h) + var(--tabbar-h) + env(safe-area-inset-bottom) + 10px);
  }
}
</style>
