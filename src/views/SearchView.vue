<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/netease.js'
import { demoTracks, demoPlaylists } from '../data/demo.js'
import SongItem from '../components/SongItem.vue'
import { usePlayer } from '../store/player.js'

const emit = defineEmits(['navigate'])
const { playTrack } = usePlayer()

const keyword = ref('')
const tab = ref('songs')
const songs = ref([])
const playlists = ref([])
const loading = ref(false)
const searched = ref(false)
const demo = ref(false)
const hots = ref([])

// 一次搜索同时拉「单曲 + 歌单」并各自缓存，切换 tab 不再清空
async function runSearch(kw) {
  const k = kw.trim()
  if (!k) return
  loading.value = true
  searched.value = true
  const [sRes, pRes] = await Promise.all([
    api
      .searchSongs(k, { limit: 40 })
      .then((list) => ({ list, isDemo: false }))
      .catch(() => ({
        list: demoTracks.filter((t) => t.name.includes(k) || t.artistName.includes(k)),
        isDemo: true
      })),
    api
      .searchPlaylists(k, { limit: 30 })
      .then((list) => ({ list, isDemo: false }))
      .catch(() => ({ list: demoPlaylists.filter((p) => p.name.includes(k)), isDemo: true }))
  ])
  songs.value = sRes.list
  playlists.value = pRes.list
  demo.value = sRes.isDemo && pRes.isDemo
  loading.value = false
}

function doSearch() {
  runSearch(keyword.value)
}

function playSong(t) {
  playTrack(t, songs.value)
}
function goPlaylist(p) {
  emit('navigate', { view: 'playlist', params: { playlist: p } })
}
function pickHot(h) {
  keyword.value = h
  runSearch(h)
}

onMounted(async () => {
  // 热搜词（用于快捷搜索，也作为默认搜索词）
  try {
    hots.value = await api.hotSearch(10)
  } catch {
    hots.value = []
  }
  // 默认加载点数据：用第一个热搜词，拿不到就用一个固定词兜底
  const def = hots.value[0] || '晴天'
  keyword.value = def
  runSearch(def)
})
</script>

<template>
  <div class="search fade-up">
    <div class="bar glass">
      <svg class="s-ico" viewBox="0 0 24 24"><path d="M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z"/></svg>
      <input
        v-model="keyword"
        placeholder="搜索歌曲、歌手，或歌单…"
        @keyup.enter="doSearch"
      />
      <button class="btn-primary" @click="doSearch">搜索</button>
    </div>

    <div class="tabs">
      <button :class="{ on: tab === 'songs' }" @click="tab = 'songs'">单曲</button>
      <button :class="{ on: tab === 'playlists' }" @click="tab = 'playlists'">歌单</button>
    </div>

    <div v-if="hots.length" class="hots">
      <span class="hots-label">大家都在搜</span>
      <button v-for="h in hots" :key="h" class="hot-chip" @click="pickHot(h)">{{ h }}</button>
    </div>

    <div v-if="demo" class="demo-tip">🌿 演示模式：未连接本地接口，仅展示示例匹配结果。</div>

    <div v-if="loading" class="state">搜索中…</div>
    <div v-else-if="searched && !songs.length && !playlists.length" class="state muted">
      没有找到「{{ keyword }}」相关结果 🍃
    </div>

    <div v-if="tab === 'songs' && songs.length" class="list glass">
      <SongItem
        v-for="(t, i) in songs"
        :key="t.id"
        :track="t"
        :index="i"
        :playlist="songs"
        @play="playSong"
      />
    </div>

    <div v-if="tab === 'playlists' && playlists.length" class="grid">
      <button v-for="(p, i) in playlists" :key="p.id" class="card stagger" :style="{ '--i': i }" @click="goPlaylist(p)">
        <div class="cover" :style="{ backgroundImage: `url(${p.coverImgUrl})` }">
          <span class="cnt">{{ (p.trackCount || p.tracks?.length || '') }}</span>
        </div>
        <div class="c-name ellipsis">{{ p.name }}</div>
        <div class="c-sub ellipsis">{{ p.creator?.nickname || '' }}</div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.search { padding: 30px 30px 40px; height: 100%; overflow-y: auto; }
.bar { display: flex; align-items: center; gap: 12px; padding: 8px 8px 8px 18px; border-radius: 99px; max-width: 620px; }
.s-ico { width: 20px; height: 20px; fill: none; stroke: var(--text-dim); stroke-width: 1.8; stroke-linecap: round; }
.bar input { flex: 1; border: none; outline: none; background: transparent; font-size: 15px; color: var(--text); }
.tabs { display: flex; gap: 22px; margin: 22px 0 18px; }
.tabs button { font-size: 15px; font-weight: 600; color: var(--text-dim); padding-bottom: 6px; border-bottom: 2px solid transparent; }
.tabs button.on { color: var(--text); border-color: var(--c-teal); }
.hots { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 18px; }
.hots-label { font-size: 13px; color: var(--text-dim); margin-right: 2px; }
.hot-chip { font-size: 13px; color: var(--text); background: var(--surface); border: 1px solid var(--surface-line); padding: 6px 14px; border-radius: 99px; transition: .18s; }
.hot-chip:hover { background: var(--grad-soft); border-color: var(--c-teal); transform: translateY(-2px); }
.demo-tip { background: rgba(255,214,192,.35); border:1px solid rgba(255,180,140,.5); color:#8a5a3c; padding:9px 16px; border-radius: var(--radius-md); font-size:13px; margin-bottom: 16px; }
.state { padding: 40px; text-align: center; }
.list { border-radius: var(--radius-lg); padding: 6px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 18px; }
.card { text-align: left; transition: .2s; }
.card:hover { transform: translateY(-6px); box-shadow: var(--shadow-soft); }
.card .cover { transition: transform .35s cubic-bezier(.2, .7, .3, 1); }
.card:hover .cover { transform: scale(1.05); }
.cover { position: relative; width: 100%; aspect-ratio: 1; border-radius: var(--radius-md); background-size: cover; background-position: center; box-shadow: var(--shadow-card); }
.cnt { position: absolute; right: 10px; top: 10px; font-size: 11px; color:#fff; background: rgba(0,0,0,.4); padding: 2px 8px; border-radius: 99px; }
.c-name { font-size: 14px; font-weight: 600; margin-top: 10px; }
.c-sub { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
</style>
