<script setup>
import { computed } from 'vue'
import SongItem from '../components/SongItem.vue'
import { usePlayer } from '../store/player.js'

const { state, playTrack } = usePlayer()
const favs = computed(() => state.favorites)

function playOne(t) {
  playTrack(t, favs.value)
}
</script>

<template>
  <div class="fav fade-up">
    <div class="sec-head">
      <h3>我的收藏</h3>
      <span class="muted">{{ favs.length }} 首 · 藏在心里的旋律</span>
    </div>

    <div v-if="!favs.length" class="empty glass">
      <div class="emo">💗</div>
      <p>还没有收藏哦</p>
      <span class="muted">在任意歌曲上点亮 ♥，它就会住进这里</span>
    </div>

    <div v-else class="list glass">
      <SongItem
        v-for="(t, i) in favs"
        :key="t.id"
        :track="t"
        :index="i"
        :playlist="favs"
        @play="playOne"
      />
    </div>
  </div>
</template>

<style scoped>
.fav { padding: 30px 30px 40px; height: 100%; overflow-y: auto; }
.sec-head { display: flex; align-items: baseline; gap: 14px; margin-bottom: 18px; }
.sec-head h3 { font-size: 20px; font-weight: 800; }
.empty { border-radius: var(--radius-lg); padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.emo { font-size: 46px; }
.empty p { font-size: 16px; font-weight: 600; }
.list { border-radius: var(--radius-lg); padding: 6px; }
</style>
