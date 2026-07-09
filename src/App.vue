<script setup>
import { ref, computed } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import ParticlesBg from './components/ParticlesBg.vue'
import AppPlayer from './components/AppPlayer.vue'
import DiscoverView from './views/DiscoverView.vue'
import SearchView from './views/SearchView.vue'
import PlaylistView from './views/PlaylistView.vue'
import FavoritesView from './views/FavoritesView.vue'
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
    </main>

    <AppPlayer @open-now="openNow" />

    <transition name="nowfade">
      <NowPlayingView v-if="showNow" @close="closeNow" />
    </transition>
  </div>
</template>

<style scoped>
.app { position: relative; z-index: 1; display: flex; gap: var(--app-gap); padding: var(--app-gap); height: 100vh; overflow: hidden; }
.main {
  flex: 1; height: 100%; overflow: hidden;
  padding-bottom: calc(var(--player-h) + 28px);
}
.nowfade-enter-active, .nowfade-leave-active { transition: opacity .35s ease; }
.nowfade-enter-from, .nowfade-leave-to { opacity: 0; }
</style>
